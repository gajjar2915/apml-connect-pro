'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMeshSync, AppointmentItem } from '../../meshSync';

const statusConfig: Record<string, { color: string; icon: string }> = {
  SCHEDULED: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '📋' },
  CONFIRMED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✅' },
  CHECKED_IN: { color: 'bg-teal-100 text-teal-700 border-teal-200', icon: '📍' },
  WAITING: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⏳' },
  IN_CONSULTATION: { color: 'bg-violet-100 text-violet-700 border-violet-200', icon: '🩺' },
  COMPLETED: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🏁' },
  CANCELLED: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: '❌' },
  NO_SHOW: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🚫' },
};

export default function AppointmentsPage() {
  const { appointments = [], updateAppointmentStatus, addQueueToken } = useMeshSync();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [view, setView] = useState<'table' | 'timeline'>('table');
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);

  const safeAppts = Array.isArray(appointments) ? appointments : [];

  const filtered = safeAppts.filter(a => {
    if (!a) return false;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      (a.patient || '').toLowerCase().includes(q) ||
      (a.doctor || '').toLowerCase().includes(q) ||
      (a.id || '').toLowerCase().includes(q) ||
      (a.token || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });

  const handleCheckIn = (appt: AppointmentItem) => {
    updateAppointmentStatus(appt.id, 'CHECKED_IN');
    
    // Automatically generate a queue token to appear in OPD queue
    addQueueToken({
      token: appt.token || `A${Math.floor(100 + Math.random() * 900)}`,
      name: appt.patient,
      age: '35', // default mock age
      gender: 'Male',
      doctor: appt.doctor,
      status: 'CHECKED_IN',
      priority: 'NORMAL',
      time: appt.time,
      type: appt.type,
    });

    alert(`Checked in ${appt.patient}. Token ${appt.token} pushed to Live Queue.`);
    if (selectedAppt?.id === appt.id) {
      setSelectedAppt({ ...appt, status: 'CHECKED_IN' });
    }
  };

  const handleCancel = (apptId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      updateAppointmentStatus(apptId, 'CANCELLED');
      alert('Appointment cancelled.');
      if (selectedAppt?.id === apptId) {
        setSelectedAppt(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
      }
    }
  };

  const handleComplete = (apptId: string) => {
    updateAppointmentStatus(apptId, 'COMPLETED');
    alert('Appointment marked as completed.');
    if (selectedAppt?.id === apptId) {
      setSelectedAppt(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} scheduled visits found</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button id="view-table" onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === 'table' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
              📋 Table
            </button>
            <button id="view-timeline" onClick={() => setView('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === 'timeline' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
              📅 Timeline
            </button>
          </div>
          <Link href="/dashboard/reception/appointments/new" id="btn-new-appt"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm">
            + Book Appointment
          </Link>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
        {Object.entries(statusConfig).map(([status, cfg]) => {
          const count = appointments.filter(a => a.status === status).length;
          return (
            <button key={status} id={`filter-status-${status}`}
              onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
              className={`p-3 rounded-xl border text-center transition hover:shadow-md ${statusFilter === status ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <span className="text-xl">{cfg.icon}</span>
              <p className="text-lg font-extrabold text-slate-800 mt-1">{count}</p>
              <p className="text-[10px] font-bold text-slate-500">{status.replace('_', ' ')}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <span className="text-slate-400">🔍</span>
          <input id="appt-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, doctor, appointment ID..."
            className="bg-transparent text-sm text-slate-700 outline-none w-full placeholder-slate-400" />
        </div>
        <input id="filter-date" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="border border-slate-250 rounded-xl px-3 py-2 text-sm text-slate-750 outline-none focus:ring-2 focus:ring-emerald-300 bg-white" />
        <select id="filter-appt-status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-250 rounded-xl px-3 py-2 text-sm text-slate-750 outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
          <option value="All">All Statuses</option>
          {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List/Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {view === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-250">
                    {['Token/ID', 'Patient', 'Consulting Doctor', 'Date & Time', 'Specialty', 'Status', 'Billing', 'Actions'].map(h => (
                      <th key={h} className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.map(a => (
                    <tr key={a.id} onClick={() => setSelectedAppt(a)} className={`hover:bg-slate-50 transition cursor-pointer ${selectedAppt?.id === a.id ? 'bg-slate-55 bg-emerald-50/20' : ''}`}>
                      <td className="p-4">
                        <span className="font-bold font-mono text-slate-800 block">{a.token}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{a.id}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-700 text-sm">{a.patient}</td>
                      <td className="p-4 font-semibold text-slate-600">{a.doctor}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-700 block">{a.time}</span>
                        <span className="text-[10px] text-slate-450 block font-medium">{a.date}</span>
                      </td>
                      <td className="p-4 text-slate-500 font-semibold">{a.type}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusConfig[a.status]?.color || 'bg-slate-100 text-slate-700'}`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${a.payStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                          {a.payStatus}
                        </span>
                      </td>
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {a.status === 'SCHEDULED' && (
                            <button onClick={() => handleCheckIn(a)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-[10px]">
                              📍 Check In
                            </button>
                          )}
                          {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                            <button onClick={() => handleCancel(a.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition">
                              ✕ Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No scheduled appointments match filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {filtered.map(a => (
                <div key={a.id} onClick={() => setSelectedAppt(a)} className={`p-4 border rounded-2xl flex justify-between items-center cursor-pointer hover:shadow-sm transition ${selectedAppt?.id === a.id ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200'}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{a.patient}</span>
                      <span className="text-xs text-slate-400">({a.id})</span>
                    </div>
                    <p className="text-xs text-slate-500">Scheduled: {a.date} at {a.time} with {a.doctor} ({a.type})</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusConfig[a.status]?.color}`}>
                    {a.status}
                  </span>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">No appointments matching filters.</p>}
            </div>
          )}
        </div>

        {/* Selected Appointment Drawer */}
        <div className="space-y-4">
          {selectedAppt ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Appointment Details</h3>
                <button onClick={() => setSelectedAppt(null)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 bg-slate-50 border border-slate-150 p-4 rounded-2xl leading-relaxed">
                <p><strong>Appointment ID:</strong> {selectedAppt.id}</p>
                <p><strong>Queue Token:</strong> {selectedAppt.token}</p>
                <p><strong>Patient Name:</strong> {selectedAppt.patient}</p>
                <p><strong>Consultant:</strong> {selectedAppt.doctor}</p>
                <p><strong>Department:</strong> {selectedAppt.type}</p>
                <p><strong>Date & Time:</strong> {selectedAppt.date} at {selectedAppt.time}</p>
                
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span><strong>Status:</strong></span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${statusConfig[selectedAppt.status]?.color}`}>
                    {selectedAppt.status}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span><strong>Billing Status:</strong></span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${selectedAppt.payStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {selectedAppt.payStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedAppt.status === 'SCHEDULED' && (
                  <button onClick={() => handleCheckIn(selectedAppt)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm">
                    📍 Check In Patient (Generate Token)
                  </button>
                )}
                {selectedAppt.status === 'CONFIRMED' && (
                  <button onClick={() => handleCheckIn(selectedAppt)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm">
                    📍 Checked In
                  </button>
                )}
                {selectedAppt.status !== 'COMPLETED' && selectedAppt.status !== 'CANCELLED' && (
                  <button onClick={() => handleComplete(selectedAppt.id)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl transition">
                    ✔ Complete Appointment
                  </button>
                )}
                {selectedAppt.status !== 'CANCELLED' && selectedAppt.status !== 'COMPLETED' && (
                  <button onClick={() => handleCancel(selectedAppt.id)} className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold py-2.5 rounded-xl transition">
                    ✕ Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
              <span className="text-4xl block mb-2">📋</span>
              <p className="font-semibold text-slate-500 text-sm">Select an appointment row to review operations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
