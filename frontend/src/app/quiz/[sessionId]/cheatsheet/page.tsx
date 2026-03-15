'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import { cheatsheetAPI } from '@/lib/api';
import { Download } from 'lucide-react';

export default function CheatSheetPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const [cheatsheet, setCheatsheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cheatsheetAPI.get(sessionId)
      .then(res => setCheatsheet(res.data))
      .catch(() => toast.error('Cheatsheet not found'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    const token = localStorage.getItem('access_token');
    fetch(cheatsheetAPI.downloadUrl(sessionId), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cheatsheet.pdf';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Download failed'));
  };

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
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-brand-800">Study Cheatsheet</h1>
            <p className="text-gray-500 text-sm mt-1">AI-generated based on your quiz performance</p>
          </div>
          {cheatsheet?.pdf_url && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl text-sm font-medium hover:bg-brand-800 transition"
            >
              <Download size={15} />
              Download PDF
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm prose prose-sm max-w-none
          prose-headings:font-serif prose-headings:text-brand-800
          prose-h1:text-2xl prose-h2:text-xl prose-h2:text-brand-700
          prose-strong:text-brand-800 prose-a:text-brand-600
          prose-table:text-sm prose-th:bg-brand-50 prose-th:text-brand-700
          prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
          <ReactMarkdown>{cheatsheet?.content || ''}</ReactMarkdown>
        </div>
      </main>
    </>
  );
}
