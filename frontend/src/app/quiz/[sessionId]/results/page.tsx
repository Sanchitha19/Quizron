'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { quizAPI, cheatsheetAPI } from '@/lib/api';
import { Question, QuizSession } from '@/types';
import { ChevronDown, ChevronUp, FileText, RotateCcw, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

export default function ResultsPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const router = useRouter();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI.getResults(sessionId)
      .then(res => {
        setSession(res.data.session);
        setQuestions(res.data.questions);
      })
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateCheatsheet = async () => {
    setGeneratingPDF(true);
    try {
      await cheatsheetAPI.generate(sessionId);
      router.push(`/quiz/${sessionId}/cheatsheet`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate cheatsheet');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const score = session?.score ?? 0;
  const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  const scoreLabel = score >= 80 ? 'Excellent! 🎉' : score >= 60 ? 'Good work!' : 'Keep practicing';

  const correct = questions.filter(q => q.is_correct).length;

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Score */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 mb-4"
            style={{ borderColor: scoreColor }}
          >
            <span className="font-serif text-3xl" style={{ color: scoreColor }}>{score}%</span>
          </div>
          <h1 className="font-serif text-2xl text-brand-800 mb-1">{scoreLabel}</h1>
          <p className="text-gray-500 text-sm">{correct} of {questions.length} questions correct</p>
          <p className="text-gray-400 text-xs mt-1">{session?.topic} · {session?.difficulty}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button
            onClick={handleGenerateCheatsheet}
            disabled={generatingPDF}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-700 text-white rounded-xl font-medium text-sm hover:bg-brand-800 transition disabled:opacity-50"
          >
            {generatingPDF ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating cheatsheet...</>
            ) : (
              <><FileText size={16} /> Generate Cheatsheet & PDF</>
            )}
          </button>
          <Link
            href="/quiz/create"
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:border-gray-400 transition"
          >
            <PlusCircle size={16} /> New Quiz
          </Link>
        </div>

        {/* Answer review */}
        <h2 className="font-serif text-xl text-brand-800 mb-4">Review Answers</h2>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className={clsx(
              'bg-white rounded-xl border overflow-hidden shadow-sm',
              q.is_correct ? 'border-green-200' : 'border-red-200'
            )}>
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <div className="flex items-start gap-3">
                  <span className={clsx(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
                    q.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  )}>
                    {q.is_correct ? '✓' : '✗'}
                  </span>
                  <span className="text-sm text-brand-800 leading-snug">{i + 1}. {q.text}</span>
                </div>
                {expanded === q.id ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </button>
              {expanded === q.id && (
                <div className="px-5 pb-4 border-t border-gray-100 pt-4 space-y-2 animate-fade-in">
                  {q.options?.map((opt, oi) => (
                    <div key={oi} className={clsx(
                      'px-4 py-2.5 rounded-lg text-sm',
                      oi === q.correct_index ? 'bg-green-50 text-green-800 font-medium' :
                      oi === q.user_answer && !q.is_correct ? 'bg-red-50 text-red-700' :
                      'text-gray-600'
                    )}>
                      {['A','B','C','D'][oi]}. {opt}
                      {oi === q.correct_index && <span className="ml-2 text-green-600">✓ Correct</span>}
                      {oi === q.user_answer && !q.is_correct && <span className="ml-2 text-red-500">← Your answer</span>}
                    </div>
                  ))}
                  {q.explanation && (
                    <p className="text-xs text-gray-500 pt-2 border-t border-gray-100 leading-relaxed">
                      {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
