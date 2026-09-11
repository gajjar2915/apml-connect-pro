'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMeshSync } from '../../meshSync';

const statusColors: Record<string, string> = {
  WAITING: 'bg-amber-100 text-amber-700 border-amber-200',
  IN_CONSULTATION: 'bg-violet-100 text-violet-700 border-violet-200',
  CHECKED_IN: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ARRIVED: 'bg-teal-100 text-teal-700 border-teal-200',
};

const priorityColors: Record<string, string> = {
  EMERGENCY: 'bg-rose-500 text-white animate-pulse',
  URGENT: 'bg-amber-50 text-amber-750 border-amber-300 font-bold',
  NORMAL: 'bg-slate-700 text-white',
};

export default function QueuePage() {
  const { queue, updateQueueItemStatus, addQueueToken } = useMeshSync();
  const [filter, setFilter] = useState('All');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newTokenForm, setNewTokenForm] = useState({ name: '', age: '30', gender: 'Male', doctor: 'Dr. Sharma', priority: 'NORMAL' as 'NORMAL' | 'URGENT' | 'EMERGENCY', type: 'OPD' });

  const handleGenerateToken = () => {
    addQueueToken({
      name: newTokenForm.name || 'Walk-In Patient',
      age: newTokenForm.age,
      gender: newTokenForm.gender,
      doctor: newTokenForm.doctor,
      priority: newTokenForm.priority,
      type: newTokenForm.type,
    });
    setNewTokenForm({ name: '', age: '30', gender: 'Male', doctor: 'Dr. Sharma', priority: 'NORMAL', type: 'OPD' });
    setShowTokenModal(false);
  };

  const filteredQueue = queue.filter(item => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  const stats = {
    waiting: queue.filter(q => q.status === 'WAITING').length,
    inConsultation: queue.filter(q => q.status === 'IN_CONSULTATION').length,
    completed: queue.filter(q => q.status === 'COMPLETED').length,
    checkedIn: queue.filter(q => q.status === 'CHECKED_IN').length,
    emergency: queue.filter(q => q.priority === 'EMERGENCY').length,
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">Queue Management</h1>
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-red-600">LIVE MESH ACTIVE</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-1">Real-time patient queue · Synchronized peer-to-peer with doctor workstation</p>
        </div>
        <button
          id="generate-token-btn"
          onClick={() => setShowTokenModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition"
        >
          🎫 Generate Token
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Waiting', value: stats.waiting, icon: '⏳', color: 'bg-amber-50 border-amber-100 text-amber-700' },
          { label: 'In Consultation', value: stats.inConsultation, icon: '🩺', color: 'bg-violet-50 border-violet-100 text-violet-700' },
          { label: 'Checked In', value: stats.checkedIn, icon: '📍', color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Completed', value: stats.completed, icon: '✅', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
          { label: 'Emergency', value: stats.emergency, icon: '🔴', color: 'bg-rose-50 border-rose-100 text-rose-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-extrabold mt-1">{s.value}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main queue */}
        <div className="lg:col-span-2 space-y-3">
          {/* Sort / filter bar */}
          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5">
            <span className="text-sm font-bold text-slate-500">Filter:</span>
            {['All', 'WAITING', 'IN_CONSULTATION', 'CHECKED_IN', 'COMPLETED'].map(f => (
              <button
                key={f}
                id={`queue-filter-${f}`}
                onClick={() => setFilter(f)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  filter === f ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredQueue.map(item => (
              <div key={item.token}
                className={`bg-white border-2 rounded-2xl p-4 transition hover:shadow-md ${
                  item.priority === 'EMERGENCY' ? 'border-rose-200 bg-rose-50/30' :
                  item.priority === 'URGENT' ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'
                }`}>
                <div className="flex items-center gap-4">
                  {/* Token */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-mono font-extrabold text-lg flex-shrink-0 ${
                    item.priority === 'EMERGENCY' ? priorityColors.EMERGENCY :
                    item.priority === 'URGENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-800 text-white'
                  }`}>
                    <span className="text-[10px] font-bold opacity-75 leading-none text-center">TOKEN</span>
                    {item.token}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <span className="text-xs text-slate-500">({item.gender}, {item.age} Yrs)</span>
                      {item.priority !== 'NORMAL' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.priority === 'EMERGENCY' ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 text-white'}`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.doctor} · {item.type}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColors[item.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {(item.status || 'WAITING').replace('_', ' ')}
                      </span>
                      {item.status === 'WAITING' && (
                        <span className="text-xs text-slate-400">⏱️ ~{item.waitTime}min wait</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {item.status === 'WAITING' && (
                      <>
                        <button id={`checkin-${item.token}`}
                          onClick={() => updateQueueItemStatus(item.token, 'CHECKED_IN')}
                          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition whitespace-nowrap">
                          📍 Check In
                        </button>
                        <button id={`consult-${item.token}`}
                          onClick={() => updateQueueItemStatus(item.token, 'IN_CONSULTATION')}
                          className="px-3 py-1.5 bg-violet-500 text-white text-xs font-bold rounded-lg hover:bg-violet-600 transition whitespace-nowrap">
                          🩺 Consult
                        </button>
                      </>
                    )}
                    {item.status === 'CHECKED_IN' && (
                      <button id={`start-consult-${item.token}`}
                        onClick={() => updateQueueItemStatus(item.token, 'IN_CONSULTATION')}
                        className="px-3 py-1.5 bg-violet-500 text-white text-xs font-bold rounded-lg hover:bg-violet-600 transition">
                        🩺 Start
                      </button>
                    )}
                    {item.status === 'IN_CONSULTATION' && (
                      <button id={`complete-${item.token}`}
                        onClick={() => updateQueueItemStatus(item.token, 'COMPLETED')}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition">
                        ✅ Complete
                      </button>
                    )}
                    {item.status === 'COMPLETED' && (
                      <Link href="/dashboard/reception/billing" id={`bill-${item.token}`}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition text-center">
                        💳 Bill
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live display board */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5">
            <div className="text-center mb-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Now Serving</p>
              <div className="font-mono text-5xl font-extrabold text-emerald-400 my-3">
                {queue.find(q => q.status === 'IN_CONSULTATION')?.token || '---'}
              </div>
              <p className="text-slate-300 font-semibold text-sm">
                {queue.find(q => q.status === 'IN_CONSULTATION')?.name || 'No active consultation'}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{queue.find(q => q.status === 'IN_CONSULTATION')?.doctor}</p>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Next in Queue</p>
              {queue.filter(q => q.status === 'WAITING').slice(0, 3).map((q, i) => (
                <div key={q.token} className="flex items-center gap-3 py-2">
                  <span className="font-mono text-sm font-bold text-emerald-300">{q.token}</span>
                  <span className="text-sm text-slate-300 flex-1">{q.name}</span>
                  {i === 0 && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">NEXT</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-3">Queue Analytics</h3>
            <div className="space-y-3">
              {[
                { label: 'Avg. Wait Time', value: '18 min' },
                { label: 'Avg. Consultation', value: '12 min' },
                { label: 'Peak Hour', value: '10-11 AM' },
                { label: 'Total Today', value: String(queue.length) },
              ].map(a => (
                <div key={a.label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <span className="text-sm text-slate-500">{a.label}</span>
                  <span className="text-sm font-bold text-slate-800">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Token generation modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🎫 Generate Queue Token</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Patient Name</label>
                <input id="token-patient-name" type="text" value={newTokenForm.name}
                  onChange={e => setNewTokenForm({ ...newTokenForm, name: e.target.value })}
                  placeholder="Patient name or 'Walk-In'"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                  <input type="number" value={newTokenForm.age}
                    onChange={e => setNewTokenForm({ ...newTokenForm, age: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select value={newTokenForm.gender}
                    onChange={e => setNewTokenForm({ ...newTokenForm, gender: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition bg-white">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doctor</label>
                <select id="token-doctor" value={newTokenForm.doctor}
                  onChange={e => setNewTokenForm({ ...newTokenForm, doctor: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition bg-white">
                  {['Dr. Sharma', 'Dr. Mehta', 'Dr. Gupta', 'Dr. Patel', 'Dr. Joshi'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <div className="flex gap-2">
                  {['NORMAL', 'URGENT', 'EMERGENCY'].map(p => (
                    <button key={p} type="button" id={`token-priority-${p}`}
                      onClick={() => setNewTokenForm({ ...newTokenForm, priority: p as any })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                        newTokenForm.priority === p
                          ? p === 'EMERGENCY' ? 'bg-rose-500 text-white animate-pulse' : p === 'URGENT' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTokenModal(false)}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition">
                Cancel
              </button>
              <button id="confirm-generate-token" onClick={handleGenerateToken}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition">
                🎫 Generate Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
