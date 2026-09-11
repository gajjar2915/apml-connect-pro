'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMeshSync } from '../meshSync';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard/reception', icon: '🏠', label: 'Dashboard', exact: true },
      { href: '/dashboard/reception/notifications', icon: '🔔', label: 'Notifications', badge: 'NEW' },
    ],
  },
  {
    label: 'Patient Care',
    items: [
      { href: '/dashboard/reception/patients', icon: '👥', label: 'Patients' },
      { href: '/dashboard/reception/appointments', icon: '📅', label: 'Appointments' },
      { href: '/dashboard/reception/calendar', icon: '🗓️', label: 'Calendar' },
      { href: '/dashboard/reception/queue', icon: '🎫', label: 'Queue', badge: 'LIVE' },
    ],
  },
  {
    label: 'Medical Staff',
    items: [
      { href: '/dashboard/reception/doctors', icon: '🩺', label: 'Doctors' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/dashboard/reception/billing', icon: '💳', label: 'Billing & Payments' },
      { href: '/dashboard/reception/insurance', icon: '🛡️', label: 'Insurance' },
    ],
  },
  {
    label: 'Clinical Support',
    items: [
      { href: '/dashboard/reception/documents', icon: '📁', label: 'Documents' },
      { href: '/dashboard/reception/lab', icon: '🧪', label: 'Lab Management' },
      { href: '/dashboard/pharmacy', icon: '💊', label: 'Pharmacy' },
    ],
  },

  {
    label: 'Analytics',
    items: [
      { href: '/dashboard/reception/reports', icon: '📊', label: 'Reports' },
      { href: '/dashboard/reception/ai', icon: '🤖', label: 'AI Assistant' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/dashboard/reception/settings', icon: '⚙️', label: 'Settings' },
    ],
  },
];

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clinicStatus, notifications, markNotificationRead, markNotificationsRead, accounts } = useMeshSync();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clinic, setClinic] = useState('Apollo Metro Clinic');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [globalSearch, setGlobalSearch] = useState('');

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

  const activeAccount = (accounts || []).find(a => a.role === 'receptionist' || a.role === 'admin') || { name: 'Sarah Jenkins', email: 'receptionist@clinic.com', role: 'receptionist' };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    if (pathname === '/dashboard/reception/login') {
      setCheckingAuth(false);
      return;
    }
    const hasAuthParam = typeof window !== 'undefined' && window.location.search.includes('auth=true');
    const isLoggedIn = sessionStorage.getItem('reception_logged_in');
    if (hasAuthParam || isLoggedIn === 'true') {
      sessionStorage.setItem('reception_logged_in', 'true');
      setIsLocked(false);
    } else {
      router.push('/dashboard/reception/login');
    }
    setCheckingAuth(false);
  }, [pathname, router]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    sessionStorage.removeItem('reception_logged_in');
    setIsLocked(true);
    router.push('/dashboard/reception/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (pathname === '/dashboard/reception/login') {
    return <>{children}</>;
  }

  if (checkingAuth || isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="text-emerald-400 text-sm font-semibold italic animate-pulse">Checking credentials...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} liquid-glass-nav text-white flex flex-col z-30 transition-all duration-300 ease-in-out flex-shrink-0`}>
        {/* Logo */}
        <div className="h-16 border-b border-slate-700/50 flex items-center px-4 gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-emerald-500/30">✚</div>
          {sidebarOpen && (
            <span className="font-extrabold text-base tracking-tight whitespace-nowrap overflow-hidden">
              APML Connect <span className="text-emerald-400">Pro</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4 scrollbar-hide">
          {navGroups.map(group => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-1">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative group ${
                      isActive(item.href, item.exact)
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 whitespace-nowrap">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.badge === 'LIVE' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
                          }`}>
                            {item.badge === 'NEW' && unreadCount > 0 ? String(unreadCount) : item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {!sidebarOpen && item.badge && unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-slate-700/50 p-3 space-y-1">
          <button
            onClick={handleLogout}
            id="sidebar-logout"
            title={!sidebarOpen ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          >
            <span className="text-base flex-shrink-0">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 z-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              id="sidebar-toggle"
              className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
            >
              <div className="w-5 space-y-1">
                <div className="h-0.5 bg-current rounded" />
                <div className="h-0.5 bg-current rounded w-4" />
                <div className="h-0.5 bg-current rounded" />
              </div>
            </button>

            {/* Clinic switcher */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Clinic:</span>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-xl px-3 py-1.5 cursor-default transition">
                🏥 Apollo Metro Clinic
              </span>
            </div>

            {/* Global search */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (globalSearch.trim()) {
                  router.push(`/dashboard/reception/patients?q=${encodeURIComponent(globalSearch.trim())}`);
                }
              }}
              className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl w-72"
            >
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                id="global-search"
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (pathname.includes('/patients')) {
                    router.replace(`/dashboard/reception/patients?q=${encodeURIComponent(e.target.value)}`);
                  }
                }}
                placeholder="Search patients, MRN..."
                className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none w-full"
              />
              <kbd className="hidden lg:block text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">↵</kbd>
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick actions */}
            <Link
              href="/dashboard/reception/patients"
              id="quick-new-patient"
              className="hidden md:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm"
            >
              <span>+</span> New Patient
            </Link>

            <Link
              href="/dashboard/reception/appointments"
              id="quick-new-appointment"
              className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm"
            >
              <span>📅</span> Book Appt
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 transition text-slate-600 font-bold"
              title="Toggle Dark/Light Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                id="notif-btn"
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 transition text-slate-600"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <button
                      onClick={markNotificationsRead}
                      className="text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                    {notifications.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${
                          !n.read ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <span className="text-xl mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{n.title}</p>
                          <p className="text-xs text-slate-500 truncate">{n.desc}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-700 text-sm">
                  {getInitials(activeAccount.name)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-800">{activeAccount.name}</p>
                  <p className="text-xs text-slate-500">{activeAccount.role === 'admin' ? 'System Admin' : 'Reception Officer'}</p>
                </div>
                <span className="text-slate-400 text-xs hidden md:block">▼</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-bold text-slate-800 text-sm">{activeAccount.name}</p>
                    <p className="text-xs text-slate-500">{activeAccount.email}</p>
                  </div>
                  {[
                    { href: '/dashboard/reception/settings', icon: '⚙️', label: 'Settings' },
                    { href: '/dashboard/reception/settings#devices', icon: '📱', label: 'Manage Devices' },
                    { href: '/dashboard/reception/settings#activity', icon: '📋', label: 'Activity Log' },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      id="header-logout"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {notifOpen || userMenuOpen ? (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setNotifOpen(false); setUserMenuOpen(false); }}
        />
      ) : null}
    </div>
  );
}
