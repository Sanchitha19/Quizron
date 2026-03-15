'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { profileAPI } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QuizSession, TopicStat } from '@/types';
import clsx from 'clsx';

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    Promise.all([profileAPI.getProfile(), profileAPI.getHistory()])
      .then(([p, h]) => { setData(p.data); setHistory(h.data); })
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (s: number) => s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626';
  const diffBadge = (d: string) =>
    ({ easy: 'bg-green-50 text-green-700', medium: 'bg-amber-50 text-amber-700', hard: 'bg-red-50 text-red-700' }[d] || '');

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  );

  const chartData = data?.topics_summary?.map((t: TopicStat) => ({
    name: t.topic.length > 14 ? t.topic.slice(0, 14) + '…' : t.topic,
    score: t.avg_score,
  }));

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-brand-700 flex items-center justify-center text-white font-serif text-xl">
            {data?.user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-brand-800">{data?.user?.username}</h1>
            <p className="text-gray-500 text-sm">{data?.user?.email}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Joined {new Date(data?.user?.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Quizzes', value: data?.total_quizzes },
            { label: 'Avg Score', value: `${data?.avg_score}%` },
            { label: 'Topics', value: data?.topics_summary?.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="font-serif text-2xl text-brand-800">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartData?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h2 className="font-serif text-lg text-brand-800 mb-5">Performance by Topic</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                  formatter={(val: number) => [`${val}%`, 'Avg Score']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry: any, i: number) => (
                    <Cell key={i} fill={scoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-serif text-lg text-brand-800">Quiz History</h2>
          </div>
          {history.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No quizzes yet. <Link href="/quiz/create" className="text-brand-600 hover:underline">Create one!</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Topic', 'Difficulty', 'Score', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 font-medium text-brand-800 max-w-[200px] truncate">{s.topic}</td>
                    <td className="px-5 py-3.5">
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium capitalize', diffBadge(s.difficulty))}>
                        {s.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {s.score !== null
                        ? <span className="font-semibold" style={{ color: scoreColor(s.score) }}>{s.score}%</span>
                        : <span className="text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.status === 'completed' && (
                        <Link href={`/quiz/${s.id}/results`}
                          className="text-brand-600 hover:underline text-xs font-medium">
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
