import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuizAI — AI-Powered Learning',
  description: 'Generate AI quizzes on any topic, track your progress, get personalised cheatsheets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#FAFAF9] text-brand-800 font-sans antialiased">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
