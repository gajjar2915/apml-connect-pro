'use client';

import { useState } from 'react';
import Link from 'next/link';

const reports = [
  { id: 'RPT001', title: 'Daily Appointment Report', date: '2026-06-19', type: 'Appointments', status: 'Ready', icon: '📅' },
  { id: 'RPT002', title: 'Revenue Report — June 2026', date: '2026-06-18', type: 'Financial', status: 'Ready', icon: '💰' },
  { id: 'RPT003', title: 'Doctor-Wise Report', date: '2026-06-17', type: 'Doctors', status: 'Ready', icon: '🩺' },
  { id: 'RPT004', title: 'No-Show Analysis Report', date: '2026-06-16', type: 'Appointments', status: 'Ready', icon: '🚫' },
  { id: 'RPT005', title: 'Patient Registration Report', date: '2026-06-15', type: 'Patients', status: 'Processing', icon: '👥' },
  { id: 'RPT006', title: 'Insurance Claims Report', date: '2026-06-14', type: 'Insurance', status: 'Ready', icon: '🛡️' },
  { id: 'RPT007', title: 'Queue Performance Report', date: '2026-06-13', type: 'Queue', status: 'Ready', icon: '🎫' },
  { id: 'RPT008', title: 'Outstanding Payments Report', date: '2026-06-12', type: 'Financial', status: 'Ready', icon: '⚠️' },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '2026-06-01', to: '2026-06-19' });
  const [reportType, setReportType] = useState('All');

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(null);
  };

  const filtered = reports.filter(r => reportType === 'All' || r.type === reportType);

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Generate, export and download clinic reports</p>
      </div>

      {/* Report generator */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h2 className="font-bold text-slate-800 mb-4">📊 Generate Custom Report</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Report Type</label>
            <select id="report-type-select" value={reportType} onChange={e => setReportType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition">
              {['All', 'Appointments', 'Financial', 'Patients', 'Doctors', 'Queue', 'Insurance'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">From Date</label>
            <input id="report-from" type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">To Date</label>
            <input id="report-to" type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
          </div>
          <div className="flex items-end">
            <button id="generate-report-btn" onClick={() => handleGenerate('custom')}
              disabled={generating === 'custom'}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
              {generating === 'custom' ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              ) : '📊 Generate'}
            </button>
          </div>
        </div>

        {/* Quick report buttons */}
        <div className="flex flex-wrap gap-2">
          <p className="text-xs font-bold text-slate-400 w-full">Quick reports:</p>
          {[
            { id: 'today', label: "📅 Today's Summary" },
            { id: 'week', label: '📆 This Week' },
            { id: 'month', label: '🗓️ This Month' },
            { id: 'revenue', label: '💰 Revenue Report' },
            { id: 'noshow', label: '🚫 No-Show Report' },
          ].map(q => (
            <button key={q.id} id={`quick-report-${q.id}`}
              onClick={() => handleGenerate(q.id)}
              disabled={generating === q.id}
              className="text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl transition disabled:opacity-60">
              {generating === q.id ? '⏳ Generating...' : q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', value: '1,247', change: '+12%', icon: '📅', period: 'This month' },
          { label: 'Total Revenue', value: '₹5.8L', change: '+18%', icon: '💰', period: 'This month' },
          { label: 'New Patients', value: '143', change: '+8%', icon: '👥', period: 'This month' },
          { label: 'No-Show Rate', value: '4.2%', change: '-1.2%', icon: '🚫', period: 'This month' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{m.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.change.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {m.change}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{m.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{m.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{m.period}</p>
          </div>
        ))}
      </div>

      {/* Report list */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recent Reports</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Export all as:</span>
            {['PDF', 'Excel', 'CSV'].map(fmt => (
              <button key={fmt} id={`export-all-${fmt}`}
                className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition">
                {fmt === 'PDF' ? '📄' : fmt === 'Excel' ? '📊' : '📋'} {fmt}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{r.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.date} · {r.type}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {r.status === 'Ready' ? '✅ Ready' : '⏳ Processing'}
              </span>
              {r.status === 'Ready' && (
                <div className="flex items-center gap-1">
                  {['PDF', 'Excel', 'CSV'].map(fmt => (
                    <button key={fmt} id={`download-${r.id}-${fmt}`}
                      className="text-xs font-bold px-2 py-1.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 rounded-lg transition">
                      {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
