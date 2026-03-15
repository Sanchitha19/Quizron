from rest_framework import serializers
from django.contrib.auth.models import User
from .models import QuizSession, Question, UserAnswer, CheatSheet


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    total_quizzes = serializers.SerializerMethodField()
    avg_score = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'total_quizzes', 'avg_score']

    def get_total_quizzes(self, obj):
        return obj.quiz_sessions.filter(status='completed').count()

    def get_avg_score(self, obj):
        sessions = obj.quiz_sessions.filter(status='completed', score__isnull=False)
        if not sessions.exists():
            return 0
        return round(sum(s.score for s in sessions) / sessions.count(), 1)


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'options', 'order']
        # correct_index and explanation are EXCLUDED during quiz


class QuestionReviewSerializer(serializers.ModelSerializer):
    user_answer = serializers.SerializerMethodField()
    is_correct = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'text', 'options', 'correct_index', 'explanation', 'order',
                  'user_answer', 'is_correct']

    def get_user_answer(self, obj):
        session = self.context.get('session')
        if session:
            answer = obj.useranswer_set.filter(session=session).first()
            return answer.selected_index if answer else None
        return None

    def get_is_correct(self, obj):
        session = self.context.get('session')
        if session:
            answer = obj.useranswer_set.filter(session=session).first()
            return answer.is_correct if answer else False
        return False


class QuizSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSession
        fields = ['id', 'topic', 'difficulty', 'num_questions', 'score', 'status',
                  'created_at', 'completed_at']


class CheatSheetSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = CheatSheet
        fields = ['id', 'content', 'pdf_url', 'generated_at']

    def get_pdf_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and request:
            return request.build_absolute_uri(obj.pdf_file.url)
        return None
