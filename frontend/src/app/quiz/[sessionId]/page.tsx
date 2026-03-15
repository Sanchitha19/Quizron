'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import ProgressBar from '@/components/ProgressBar';
import AnswerOption from '@/components/AnswerOption';
import { quizAPI } from '@/lib/api';
import { Question, QuizSession } from '@/types';
import clsx from 'clsx';

type AnswerState = 'default' | 'selected' | 'correct' | 'wrong';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<QuizSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>([]);
  const [answered, setAnswered] = useState(false);
  const [correctIdx, setCorrectIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    quizAPI.getQuiz(sessionId)
      .then(res => {
        setSession(res.data.session);
        setQuestions(res.data.questions);
        setAnswerStates(new Array(res.data.questions[0]?.options.length).fill('default'));
      })
      .catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, []);

  const currentQ = questions[currentIdx];

  const handleSelect = async (idx: number) => {
    if (answered || submitting) return;
    setSelectedIdx(idx);
    setSubmitting(true);

    try {
      const res = await quizAPI.submitAnswer(sessionId, {
        question_id: currentQ.id,
        selected_index: idx,
      });

      const { is_correct, correct_index } = res.data;
      setCorrectIdx(correct_index);
      setAnswered(true);

      const newStates: AnswerState[] = currentQ.options.map((_, i) => {
        if (i === correct_index) return 'correct';
        if (i === idx && !is_correct) return 'wrong';
        return 'default';
      });
      setAnswerStates(newStates);

      if (!is_correct) toast.error('Incorrect', { duration: 1500, icon: '✗' });
      else toast.success('Correct!', { duration: 1500, icon: '✓' });
    } catch {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    const isLast = currentIdx === questions.length - 1;

    if (isLast) {
      try {
        await quizAPI.finish(sessionId);
        router.push(`/quiz/${sessionId}/results`);
      } catch {
        toast.error('Failed to finish quiz');
      }
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setCurrentIdx(i => i + 1);
      setSelectedIdx(null);
      setAnswered(false);
      setCorrectIdx(null);
      setAnswerStates(new Array(questions[currentIdx + 1]?.options.length).fill('default'));
      setAnimating(false);
    }, 200);
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  if (!currentQ) return null;

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">{session?.topic}</p>
          <ProgressBar current={currentIdx + 1} total={questions.length} />
        </div>

        {/* Question card */}
        <div className={clsx('transition-all duration-200', animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0')}>
          <div className="bg-white rounded-2xl border border-gray-200 p-7 mb-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">
              Question {currentIdx + 1}
            </p>
            <h2 className="font-serif text-[1.35rem] leading-snug text-brand-800">
              {currentQ.text}
            </h2>
          </div>

          {/* Answers */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((opt, i) => (
              <AnswerOption
                key={i}
                label={labels[i]}
                text={opt}
                state={answered ? answerStates[i] : (selectedIdx === i ? 'selected' : 'default')}
                onClick={() => handleSelect(i)}
                disabled={answered}
              />
            ))}
          </div>

          {/* Explanation (shown after answering) */}
          {answered && correctIdx !== null && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-5 animate-fade-in">
              <p className="text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">Explanation</p>
              <p className="text-sm text-brand-800 leading-relaxed">
                {/* We stored explanation in questions after answering — fetch from API response */}
                The correct answer is <strong>{currentQ.options[correctIdx]}</strong>.
              </p>
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={!answered}
            className="w-full py-3.5 bg-brand-700 text-white rounded-xl font-medium text-sm hover:bg-brand-800 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
          </button>
        </div>
      </main>
    </>
  );
}
