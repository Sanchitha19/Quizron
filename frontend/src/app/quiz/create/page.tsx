'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { quizAPI } from '@/lib/api';
import { Sparkles } from 'lucide-react';
import clsx from 'clsx';

const difficulties = ['easy', 'medium', 'hard'];
const questionCounts = [5, 10, 15, 20];

export default function CreateQuiz() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [numQ, setNumQ] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setLoading(true);
    try {
      const res = await quizAPI.create({ topic: topic.trim(), num_questions: numQ, difficulty });
      router.push(`/quiz/${res.data.session.id}`);
    } catch (err: any) {
      console.error("QUIZ ERROR:", err)

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Quiz generation failed"

      toast.error(msg)
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-brand-800 mb-1">Create a Quiz</h1>
          <p className="text-gray-500 text-sm">Gemini AI will generate questions for you</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                type="text"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Python decorators, French Revolution, Photosynthesis..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition"
              />
            </div>

            {/* Number of questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
              <div className="grid grid-cols-4 gap-2">
                {questionCounts.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumQ(n)}
                    className={clsx(
                      'py-2.5 rounded-xl border text-sm font-medium transition',
                      numQ === n
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={clsx(
                      'py-2.5 rounded-xl border text-sm font-medium transition capitalize',
                      difficulty === d
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-700 text-white rounded-xl font-medium text-sm hover:bg-brand-800 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating with Gemini AI... (~15s)
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Quiz
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
