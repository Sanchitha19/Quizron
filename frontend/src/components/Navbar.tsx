'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { clearTokens } from '@/lib/auth';
import { LogOut, BookOpen, User, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    clearTokens();
    router.push('/login');
  };

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: BookOpen },
    { href: '/quiz/create', label: 'New Quiz', icon: PlusCircle },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-serif text-xl text-brand-800">QuizAI</Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition',
                pathname === href
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              )}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition ml-1"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
