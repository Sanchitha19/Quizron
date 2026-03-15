from django.utils import timezone
from django.http import FileResponse
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import QuizSession, Question, UserAnswer, CheatSheet
from .serializers import (RegisterSerializer, UserSerializer, QuizSessionSerializer,
                           QuestionSerializer, QuestionReviewSerializer, CheatSheetSerializer)
from .grok_service import generate_quiz_questions, generate_cheatsheet
from .pdf_service import generate_pdf_from_markdown
import os
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "QuizAI API running",
        "version": "1.0"
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    from django.contrib.auth import authenticate
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def me(request):
    return Response(UserSerializer(request.user).data)


# ── PROFILE ────────────────────────────────────────────────────────────────────

@api_view(['GET'])
def profile(request):
    user = request.user
    sessions = user.quiz_sessions.filter(status='completed')

    topic_stats = {}
    for s in sessions:
        if s.topic not in topic_stats:
            topic_stats[s.topic] = {'count': 0, 'total_score': 0, 'difficulty': s.difficulty}
        topic_stats[s.topic]['count'] += 1
        topic_stats[s.topic]['total_score'] += s.score or 0

    topics_summary = [
        {
            'topic': topic,
            'count': data['count'],
            'avg_score': round(data['total_score'] / data['count'], 1) if data['count'] > 0 else 0,
            'difficulty': data['difficulty']
        }
        for topic, data in topic_stats.items()
    ]

    return Response({
        'user': UserSerializer(user).data,
        'total_quizzes': sessions.count(),
        'avg_score': round(sum(s.score for s in sessions if s.score) / sessions.count(), 1) if sessions.exists() else 0,
        'topics_summary': topics_summary,
        'recent_sessions': QuizSessionSerializer(sessions[:5], many=True).data,
    })


@api_view(['GET'])
def quiz_history(request):
    sessions = request.user.quiz_sessions.all()
    return Response(QuizSessionSerializer(sessions, many=True).data)


# ── QUIZ ───────────────────────────────────────────────────────────────────────

@api_view(['POST'])
def create_quiz(request):
    topic = request.data.get('topic', '').strip()
    num_questions = int(request.data.get('num_questions', 10))
    difficulty = request.data.get('difficulty', 'medium')

    print(f"Generating quiz: {topic}, {difficulty}, {num_questions}")

    if not topic:
        return Response({'error': 'Topic is required'}, status=400)
    if not (5 <= num_questions <= 20):
        return Response({'error': 'num_questions must be between 5 and 20'}, status=400)
    if difficulty not in ['easy', 'medium', 'hard']:
        return Response({'error': 'difficulty must be easy, medium, or hard'}, status=400)

    # Create session
    session = QuizSession.objects.create(
        user=request.user,
        topic=topic,
        difficulty=difficulty,
        num_questions=num_questions,
        status='active'
    )

    # Generate questions via Gemini
    try:
        raw_questions = generate_quiz_questions(topic, num_questions, difficulty)
    except Exception as e:
        import traceback
        print("QUIZ GENERATION ERROR:", str(e))
        traceback.print_exc()
        session.delete()
        return Response({
            "error": "quiz_generation_failed",
            "detail": str(e)
        }, status=500)

    print("Gemini returned questions:", len(raw_questions))

    # Save questions
    questions = []
    for i, q in enumerate(raw_questions):
        # Validate question structure
        if "text" not in q:
            continue
        if "options" not in q or len(q["options"]) != 4:
            continue
        if "correct_index" not in q:
            continue

        question = Question.objects.create(
            session=session,
            text=q['text'],
            options=q['options'],
            correct_index=q['correct_index'],
            explanation=q.get('explanation', ''),
            order=i
        )
        questions.append(question)

    return Response({
        'session': QuizSessionSerializer(session).data,
        'questions': QuestionSerializer(questions, many=True).data,
    }, status=201)


@api_view(['GET'])
def get_quiz(request, session_id):
    try:
        session = QuizSession.objects.get(id=session_id, user=request.user)
    except QuizSession.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    questions = session.questions.all()
    return Response({
        'session': QuizSessionSerializer(session).data,
        'questions': QuestionSerializer(questions, many=True).data,
    })


@api_view(['POST'])
def submit_answer(request, session_id):
    try:
        session = QuizSession.objects.get(id=session_id, user=request.user, status='active')
    except QuizSession.DoesNotExist:
        return Response({'error': 'Session not found or already completed'}, status=404)

    question_id = request.data.get('question_id')
    selected_index = request.data.get('selected_index')

    try:
        question = Question.objects.get(id=question_id, session=session)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=404)

    is_correct = int(selected_index) == question.correct_index

    answer, _ = UserAnswer.objects.update_or_create(
        session=session,
        question=question,
        defaults={'selected_index': selected_index, 'is_correct': is_correct}
    )

    return Response({
        'is_correct': is_correct,
        'correct_index': question.correct_index,
        'explanation': question.explanation,
    })


@api_view(['POST'])
def finish_quiz(request, session_id):
    try:
        session = QuizSession.objects.get(id=session_id, user=request.user, status='active')
    except QuizSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)

    answers = session.answers.all()
    total = session.questions.count()
    correct = answers.filter(is_correct=True).count()
    score = round((correct / total) * 100, 1) if total > 0 else 0

    session.score = score
    session.status = 'completed'
    session.completed_at = timezone.now()
    session.save()

    return Response({
        'score': score,
        'correct': correct,
        'total': total,
        'session': QuizSessionSerializer(session).data,
    })


@api_view(['GET'])
def quiz_results(request, session_id):
    try:
        session = QuizSession.objects.get(id=session_id, user=request.user, status='completed')
    except QuizSession.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    questions = session.questions.all()
    return Response({
        'session': QuizSessionSerializer(session).data,
        'questions': QuestionReviewSerializer(questions, many=True, context={'session': session}).data,
    })


# ── CHEATSHEET ────────────────────────────────────────────────────────────────

@api_view(['POST'])
def generate_cheatsheet_view(request, session_id):
    try:
        session = QuizSession.objects.get(id=session_id, user=request.user, status='completed')
    except QuizSession.DoesNotExist:
        return Response({'error': 'Session not found or not completed'}, status=404)

    # Return cached if exists
    if hasattr(session, 'cheatsheet'):
        return Response(CheatSheetSerializer(session.cheatsheet, context={'request': request}).data)

    # Build wrong questions list
    wrong_answers = session.answers.filter(is_correct=False).select_related('question')
    wrong_questions = [
        {
            'text': a.question.text,
            'correct_answer': a.question.options[a.question.correct_index],
            'explanation': a.question.explanation
        }
        for a in wrong_answers
    ]

    # Generate markdown via Gemini
    try:
        markdown_content = generate_cheatsheet(
            topic=session.topic,
            difficulty=session.difficulty,
            score=session.score or 0,
            wrong_questions=wrong_questions
        )
    except Exception as e:
        return Response({'error': 'ai_unavailable', 'detail': str(e)}, status=503)

    # Generate PDF
    try:
        pdf_filename = f"cheatsheet_{session_id}.pdf"
        pdf_path = generate_pdf_from_markdown(markdown_content, pdf_filename)
    except Exception:
        pdf_path = None

    cheatsheet = CheatSheet.objects.create(
        session=session,
        content=markdown_content,
        pdf_file=pdf_path
    )

    return Response(
        CheatSheetSerializer(cheatsheet, context={'request': request}).data,
        status=201
    )


@api_view(['GET'])
def get_cheatsheet(request, session_id):
    try:
        session = QuizSession.objects.get(id=session_id, user=request.user)
        cheatsheet = session.cheatsheet
    except (QuizSession.DoesNotExist, CheatSheet.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)

    return Response(CheatSheetSerializer(cheatsheet, context={'request': request}).data)


@api_view(['GET'])
def download_pdf(request, session_id):
    try:
        session = QuizSession.objects.get(id=session_id, user=request.user)
        cheatsheet = session.cheatsheet
    except (QuizSession.DoesNotExist, CheatSheet.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)

    if not cheatsheet.pdf_file:
        return Response({'error': 'PDF not generated'}, status=404)

    file_path = cheatsheet.pdf_file.path
    return FileResponse(
        open(file_path, 'rb'),
        as_attachment=True,
        filename=f"{session.topic.replace(' ', '_')}_cheatsheet.pdf"
    )
