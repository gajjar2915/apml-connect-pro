'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMeshSync } from '../meshSync';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  WAITING: 'bg-amber-100 text-amber-700',
  CHECKED_IN: 'bg-emerald-100 text-emerald-700',
  SCHEDULED: 'bg-slate-100 text-slate-600',
  IN_CONSULTATION: 'bg-violet-100 text-violet-700',
  COMPLETED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

const doctorStatusColors: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  IN_CONSULTATION: 'bg-violet-100 text-violet-700',
  ON_BREAK: 'bg-amber-100 text-amber-700',
  LEAVE: 'bg-rose-100 text-rose-700',
};

const doctors = [
  { name: 'Dr. Sharma', spec: 'Cardiology', status: 'AVAILABLE', patients: 8, color: 'bg-emerald-500' },
  { name: 'Dr. Mehta', spec: 'General OPD', status: 'IN_CONSULTATION', patients: 12, color: 'bg-violet-500' },
  { name: 'Dr. Gupta', spec: 'Orthopedics', status: 'AVAILABLE', patients: 6, color: 'bg-blue-500' },
  { name: 'Dr. Patel', spec: 'Dermatology', status: 'ON_BREAK', patients: 4, color: 'bg-amber-500' },
  { name: 'Dr. Joshi', spec: 'Pediatrics', status: 'AVAILABLE', patients: 10, color: 'bg-teal-500' },
  { name: 'Dr. Anil', spec: 'Neurology', status: 'LEAVE', patients: 0, color: 'bg-rose-500' },
];

const quickActions = [
  { label: 'Register Patient', icon: '👤', href: '/dashboard/reception/patients', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Book Appointment', icon: '📅', href: '/dashboard/reception/appointments', color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'Generate Token', icon: '🎫', href: '/dashboard/reception/queue', color: 'bg-violet-500 hover:bg-violet-600' },
  { label: 'Create Invoice', icon: '💳', href: '/dashboard/reception/billing', color: 'bg-amber-500 hover:bg-amber-600' },
  { label: 'Upload Document', icon: '📁', href: '/dashboard/reception/documents', color: 'bg-teal-500 hover:bg-teal-600' },
  { label: 'Emergency Queue', icon: '🔴', href: '/dashboard/reception/queue', color: 'bg-rose-500 hover:bg-rose-600' },
  { label: 'View Reports', icon: '📊', href: '/dashboard/reception/reports', color: 'bg-slate-700 hover:bg-slate-800' },
];

export default function ReceptionDashboard() {
  const { clinicStatus, queue, invoices, broadcastDelay, clearDelay } = useMeshSync();
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors'>('appointments');

  // Compute dynamic stats based on mesh shared state
  const waitingPatientsCount = queue.filter(q => q.status === 'WAITING' || q.status === 'CHECKED_IN').length;
  const checkedInCount = queue.filter(q => q.status === 'CHECKED_IN').length;
  const completedCount = queue.filter(q => q.status === 'COMPLETED').length;
  
  const dailyPaidRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const dailyPendingRevenue = invoices
    .filter(i => i.status === 'UNPAID')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const stats = [
    { label: "Today's Appointments", value: String(queue.length + 15), sub: '+3 vs yesterday', icon: '📅', color: 'emerald', href: '/dashboard/reception/appointments' },
    { label: 'Waiting Patients', value: String(waitingPatientsCount), sub: 'in queue right now', icon: '⏳', color: 'amber', href: '/dashboard/reception/queue' },
    { label: 'Checked-In', value: String(checkedInCount), sub: 'waiting in lobby', icon: '✅', color: 'blue', href: '/dashboard/reception/queue' },
    { label: 'Completed Visits', value: String(completedCount), sub: 'consultations done', icon: '🏁', color: 'violet', href: '/dashboard/reception/appointments' },
    { label: 'Walk-In Patients', value: String(queue.filter(q => q && q.token && q.token.startsWith('A')).length), sub: 'from front desk', icon: '🚶', color: 'teal', href: '/dashboard/reception/patients' },
    { label: 'Active Doctors', value: '5', sub: 'of 6 available', icon: '🩺', color: 'indigo', href: '/dashboard/reception/doctors' },
    { label: "Daily Revenue", value: `₹${dailyPaidRevenue.toLocaleString()}`, sub: 'fees paid today', icon: '💰', color: 'emerald', href: '/dashboard/reception/billing' },
    { label: 'Pending Payments', value: `₹${dailyPendingRevenue.toLocaleString()}`, sub: 'outstanding invoices', icon: '⚠️', color: 'rose', href: '/dashboard/reception/billing' },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Reception Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}Apollo Metro Clinic
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 border rounded-xl px-4 py-2 transition-all ${
            clinicStatus === 'Online' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${clinicStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-sm font-semibold">Clinic: {clinicStatus}</span>
          </div>
          <Link
            href="/dashboard/reception/reports"
            id="dashboard-reports-btn"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            📊 Daily Report
          </Link>
        </div>
      </div>

      {/* CLINIC STATUS OFFLINE ALERT */}
      {clinicStatus === 'Offline' && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-rose-800 text-sm font-semibold flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <span>🔴</span>
            <span>The clinic has been set to <strong>OFFLINE</strong> by the doctor. New patient token generation should be paused.</span>
          </div>
        </div>
      )}

      {/* DELAY BROADCAST BANNER */}
      {broadcastDelay && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl text-amber-800 text-sm font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>Doctor Broadcast Delay Alert:</strong> Dr. Sharma is running <strong>{broadcastDelay.minutes} minutes late</strong>. 
              Message: "{broadcastDelay.message}"
            </span>
          </div>
          <button 
            onClick={clearDelay} 
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs px-2.5 py-1 rounded-lg font-bold transition"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            id={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={`bg-white border rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${colorMap[s.color]?.split(' ').slice(2).join(' ') || 'border-slate-100'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${colorMap[s.color] || 'bg-slate-100 text-slate-600'}`}>
                {s.color === 'rose' ? '!' : '↑'}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{s.label}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {quickActions.map(a => (
            <Link
              key={a.label}
              href={a.href}
              id={`qa-${a.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`${a.color} text-white flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-center transition shadow-sm hover:shadow-lg hover:-translate-y-0.5`}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[10px] font-bold leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments + Doctors tabs */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              id="tab-appointments"
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-4 text-sm font-bold transition ${activeTab === 'appointments' ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              📅 OPD Patient Queue List
            </button>
            <button
              id="tab-doctors"
              onClick={() => setActiveTab('doctors')}
              className={`flex-1 py-4 text-sm font-bold transition ${activeTab === 'doctors' ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              🩺 Doctor Status
            </button>
          </div>

          {activeTab === 'appointments' && (
            <div>
              <div className="divide-y divide-slate-50">
                {queue.slice(0, 6).map((a, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                    <div className="text-center w-16 flex-shrink-0">
                      <p className="text-xs font-bold text-slate-800">{a.time}</p>
                      <p className="text-xs text-slate-400 font-mono font-bold">{a.token}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{a.name}</p>
                      <p className="text-xs text-slate-500 truncate">{a.doctor} · {a.type}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 border ${
                      a.status === 'WAITING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      a.status === 'IN_CONSULTATION' ? 'bg-violet-100 text-violet-700 border-violet-200' :
                      a.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 p-4 text-center">
                <Link
                  href="/dashboard/reception/queue"
                  id="view-all-appointments"
                  className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition"
                >
                  Manage Live Queue →
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div>
              <div className="divide-y divide-slate-50">
                {doctors.map((d, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                    <div className={`w-10 h-10 ${d.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {d.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.spec}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${doctorStatusColors[d.status] || 'bg-slate-100 text-slate-600'}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">{d.patients} patients</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 p-4 text-center">
                <Link
                  href="/dashboard/reception/doctors"
                  id="view-all-doctors"
                  className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition"
                >
                  Manage Doctors →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Revenue chart */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Revenue Trend</h3>
              <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none">
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            {/* Simple bar chart */}
            <div className="flex items-end gap-1.5 h-28">
              {[35, 58, 42, 71, 55, 83, 68].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md hover:from-emerald-500 hover:to-emerald-300 transition cursor-pointer"
                    style={{ height: `${v}%` }}
                    title={`₹${(v * 700).toLocaleString()}`}
                  />
                  <span className="text-[9px] text-slate-400">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Total: <strong className="text-slate-800">₹{dailyPaidRevenue.toLocaleString()}</strong></span>
              <span className="text-emerald-600 font-semibold">↑ 14%</span>
            </div>
          </div>

          {/* Live Queue */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Live Queue</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-red-500">LIVE</span>
              </div>
            </div>
            <div className="space-y-2">
              {queue.filter(q => q.status === 'WAITING' || q.status === 'IN_CONSULTATION').slice(0, 3).map(q => (
                <div key={q.token} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                  <span className={`font-mono text-sm font-bold px-2 py-1 rounded-lg ${q.priority === 'EMERGENCY' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'}`}>
                    {q.token}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{q.name}</p>
                    <p className="text-xs text-slate-450 font-bold text-slate-500 uppercase">{q.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/reception/queue"
              id="view-queue"
              className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold py-2.5 rounded-xl transition"
            >
              🎫 Manage Queue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
