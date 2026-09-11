'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    router.push('/');
  };

  if (pathname === '/dashboard/doctor/login' || pathname === '/dashboard/pharmacy/login' || pathname === '/dashboard/reception/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans relative">
      {/* Background Liquid Ambient Canvas */}
      <div className="liquid-canvas">
        <div className="liquid-orb liquid-orb-1" />
        <div className="liquid-orb liquid-orb-2" />
        <div className="liquid-orb liquid-orb-3" />
      </div>

      {/* Sidebar */}
      <aside className="w-64 liquid-glass-nav border-r border-slate-200 flex flex-col z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <span className="bg-emerald-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/30">✚</span>
          <span className="font-extrabold text-slate-800 text-lg">APML Connect Pro</span>
        </div>

        <nav className="p-4 flex-1 space-y-1">
          <Link
            href="/dashboard/pharmacy"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              pathname.includes('/pharmacy')
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>💊</span> Pharmacy Hub
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
          >
            <span>🚪</span> Secure Log Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Clinic Location:</span>
              <select className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-100 transition">
                <option>🏥 Apollo Metro Clinic (Primary)</option>
                <option>🏥 Apollo Super Speciality Hospital</option>
                <option>🏥 Apollo Diagnostics & Lab R&D</option>
              </select>
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full w-64">
              <span className="text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search database..."
                className="bg-transparent text-xs text-slate-700 outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 transition text-slate-600 font-bold"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="text-right">
              <span className="block text-sm font-bold text-slate-800">Sarah Jenkins</span>
              <span className="block text-xs text-slate-500">Desk Officer • Reception</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center font-bold text-emerald-700">
              SJ
            </div>
          </div>
        </header>

        {/* Workspace content area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
