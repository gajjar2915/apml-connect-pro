'use client';

import { useState } from 'react';
import { useMeshSync } from '../../meshSync';

const categories = ['All', 'appointment', 'billing', 'queue', 'lab', 'pharmacy', 'doctor', 'insurance', 'system'];
const catColors: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-700',
  billing: 'bg-emerald-100 text-emerald-700',
  queue: 'bg-rose-100 text-rose-700',
  lab: 'bg-violet-100 text-violet-700',
  pharmacy: 'bg-teal-100 text-teal-700',
  doctor: 'bg-indigo-100 text-indigo-700',
  insurance: 'bg-amber-100 text-amber-700',
  system: 'bg-slate-100 text-slate-700',
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markNotificationsRead, archiveNotification } = useMeshSync();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = notifications.filter(n => {
    const matchCat = filter === 'All' || n.category === filter;
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notification Center</h1>
          <p className="text-slate-500 text-sm mt-1">{unreadCount} unread notifications (Mesh synced)</p>
        </div>
        <div className="flex items-center gap-3">
          <button id="mark-all-read" onClick={markNotificationsRead}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 px-4 py-2 bg-emerald-50 rounded-xl transition">
            ✅ Mark All Read
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-3 flex-wrap shadow-sm">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 min-w-48">
          <span className="text-slate-400">🔍</span>
          <input id="notif-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notifications..." className="bg-transparent text-sm outline-none w-full placeholder-slate-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} id={`notif-filter-${cat}`} onClick={() => setFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition ${filter === cat ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-650 hover:bg-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-50">
          {filtered.map(n => (
            <div key={n.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 transition ${!n.read ? 'bg-emerald-55/35' : ''}`}>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{n.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catColors[n.category] || 'bg-slate-100 text-slate-600'}`}>
                    {n.category.toUpperCase()}
                  </span>
                  {!n.read && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                </div>
                <p className="text-sm text-slate-550 mt-0.5">{n.desc}</p>
                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read && (
                  <button id={`read-${n.id}`} onClick={() => markNotificationRead(n.id)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition text-sm" title="Mark as read">
                    ✅
                  </button>
                )}
                <button id={`archive-${n.id}`} onClick={() => archiveNotification(n.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition text-sm" title="Archive">
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <span className="text-5xl">🔔</span>
              <p className="text-slate-550 font-semibold mt-4">No notifications found</p>
              <p className="text-slate-400 text-sm mt-1">You&apos;re all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
