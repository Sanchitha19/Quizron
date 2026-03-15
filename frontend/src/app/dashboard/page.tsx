'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { profileAPI } from '@/lib/api';
import { QuizSession, TopicStat } from '@/types';
import { isLoggedIn } from '@/lib/auth';
import { PlusCircle, ChevronRight, Trophy, Target, BookOpen } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    profileAPI.getProfile().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const diffColor = (d: string) =>
    ({ easy: 'text-green-600 bg-green-50', medium: 'text-amber-600 bg-amber-50', hard: 'text-red-600 bg-red-50' }[d] || '');

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-500';

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
      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-brand-800 mb-1">
            Welcome back, {data?.user?.username}
          </h1>
          <p className="text-gray-500 text-sm">Ready to learn something new?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Total Quizzes', value: data?.total_quizzes ?? 0, color: 'text-brand-600' },
            { icon: Trophy, label: 'Average Score', value: `${data?.avg_score ?? 0}%`, color: 'text-amber-500' },
            { icon: Target, label: 'Topics Explored', value: data?.topics_summary?.length ?? 0, color: 'text-green-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <Icon size={18} className={clsx(color, 'mb-3')} />
              <p className="text-2xl font-semibold text-brand-800">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/quiz/create"
          className="flex items-center justify-between bg-brand-700 text-white rounded-2xl p-6 mb-10 hover:bg-brand-800 transition group shadow-md"
        >
          <div>
            <p className="font-serif text-xl mb-1">Create a new quiz</p>
            <p className="text-brand-100 text-sm">Generate AI questions on any topic in seconds</p>
          </div>
          <PlusCircle size={28} className="opacity-80 group-hover:scale-110 transition" />
        </Link>

        {/* Recent sessions */}
        {data?.recent_sessions?.length > 0 && (
          <div>
            <h2 className="font-serif text-xl text-brand-800 mb-4">Recent Quizzes</h2>
            <div className="space-y-3">
              {data.recent_sessions.map((s: QuizSession) => (
                <Link
                  key={s.id}
                  href={`/quiz/${s.id}/results`}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-brand-300 transition group shadow-sm"
                >
                  <div>
                    <p className="font-medium text-sm text-brand-800">{s.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', diffColor(s.difficulty))}>
                        {s.difficulty}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.score !== null && (
                      <span className={clsx('text-lg font-semibold', scoreColor(s.score))}>
                        {s.score}%
                      </span>
                    )}
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
