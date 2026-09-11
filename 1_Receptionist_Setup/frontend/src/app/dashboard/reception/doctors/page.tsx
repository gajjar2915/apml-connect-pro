'use client';

import { useState } from 'react';
import Link from 'next/link';

const doctors = [
  { id: 'D001', name: 'Dr. Rajesh Sharma', spec: 'Cardiology', exp: 15, fee: 800, videoFee: 600, status: 'AVAILABLE', patients: 8, avatar: 'RS', color: 'bg-red-500', rating: 4.8, clinics: ['Apollo Metro', 'Apollo Super Speciality'] },
  { id: 'D002', name: 'Dr. Anika Mehta', spec: 'General OPD', exp: 8, fee: 500, videoFee: 400, status: 'IN_CONSULTATION', patients: 12, avatar: 'AM', color: 'bg-violet-500', rating: 4.6, clinics: ['Apollo Metro'] },
  { id: 'D003', name: 'Dr. Suresh Gupta', spec: 'Orthopedics', exp: 20, fee: 1000, videoFee: 800, status: 'AVAILABLE', patients: 6, avatar: 'SG', color: 'bg-blue-500', rating: 4.9, clinics: ['Apollo Metro', 'Apollo Diagnostics'] },
  { id: 'D004', name: 'Dr. Priya Patel', spec: 'Dermatology', exp: 10, fee: 700, videoFee: 550, status: 'ON_BREAK', patients: 4, avatar: 'PP', color: 'bg-amber-500', rating: 4.7, clinics: ['Apollo Metro'] },
  { id: 'D005', name: 'Dr. Arjun Joshi', spec: 'Pediatrics', exp: 12, fee: 600, videoFee: 500, status: 'AVAILABLE', patients: 10, avatar: 'AJ', color: 'bg-teal-500', rating: 4.5, clinics: ['Apollo Metro'] },
  { id: 'D006', name: 'Dr. Kavitha Anil', spec: 'Neurology', exp: 18, fee: 1200, videoFee: 1000, status: 'LEAVE', patients: 0, avatar: 'KA', color: 'bg-rose-500', rating: 4.9, clinics: ['Apollo Super Speciality'] },
];

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  AVAILABLE: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Available' },
  IN_CONSULTATION: { color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', label: 'In Consultation' },
  ON_BREAK: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'On Break' },
  LEAVE: { color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500', label: 'On Leave' },
};

const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

export default function DoctorsPage() {
  const [selected, setSelected] = useState<typeof doctors[0] | null>(null);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.spec.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === 'All' || d.spec === specFilter;
    return matchSearch && matchSpec;
  });

  const specs = ['All', ...Array.from(new Set(doctors.map(d => d.spec)))];

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Doctor Management</h1>
          <p className="text-slate-500 text-sm mt-1">{doctors.filter(d => d.status === 'AVAILABLE').length} available today · {doctors.length} total</p>
        </div>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <div key={status} className={`${cfg.color} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className="text-xs font-bold uppercase tracking-wider">{cfg.label}</span>
            </div>
            <p className="text-3xl font-extrabold">{doctors.filter(d => d.status === status).length}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 min-w-48">
          <span className="text-slate-400">🔍</span>
          <input id="doctor-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or specialization..." className="bg-transparent text-sm outline-none w-full placeholder-slate-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {specs.map(s => (
            <button key={s} id={`spec-${s}`} onClick={() => setSpecFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${specFilter === s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(d => (
          <div key={d.id}
            onClick={() => setSelected(d)}
            className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 ${d.color} rounded-2xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0 shadow-lg`}>
                {d.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-800">{d.name}</p>
                    <p className="text-sm text-slate-500">{d.spec}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${statusConfig[d.status]?.color}`}>
                    {statusConfig[d.status]?.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-400">⭐ {d.rating}</span>
                  <span className="text-xs text-slate-400">{d.exp} yrs exp</span>
                  <span className="text-xs font-bold text-emerald-700">₹{d.fee}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Today's patients</p>
                <p className="text-lg font-extrabold text-slate-800">{d.patients}</p>
              </div>
              <div className="flex gap-2">
                <button id={`book-appt-${d.id}`}
                  onClick={e => { e.stopPropagation(); window.location.href = `/dashboard/reception/appointments/new?doctorId=${d.id}`; }}
                  className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition">
                  📅 Book
                </button>
                <button id={`queue-${d.id}`}
                  onClick={e => { e.stopPropagation(); window.location.href = '/dashboard/reception/queue'; }}
                  className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition">
                  🎫 Queue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor detail side panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Doctor Profile</h3>
            <button id="close-doctor-panel" onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 transition">✕</button>
          </div>
          <div className="p-5 space-y-5">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className={`w-20 h-20 ${selected.color} rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-3 shadow-lg`}>
                {selected.avatar}
              </div>
              <p className="font-bold text-slate-900 text-lg">{selected.name}</p>
              <p className="text-slate-500 text-sm">{selected.spec}</p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="text-sm">⭐ {selected.rating}</span>
                <span className="text-sm text-slate-400">{selected.exp} yrs experience</span>
              </div>
              <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full ${statusConfig[selected.status]?.color}`}>
                {statusConfig[selected.status]?.label}
              </span>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Consultation Fee', value: `₹${selected.fee}` },
                { label: 'Video Consultation', value: `₹${selected.videoFee}` },
                { label: 'Clinics', value: selected.clinics.join(', ') },
                { label: "Today's Patients", value: selected.patients.toString() },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-50 text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-bold text-slate-700 mb-3 text-sm">Available Slots Today</h4>
              <div className="grid grid-cols-3 gap-2">
                {slots.map(slot => (
                  <button key={slot} id={`slot-${selected.id}-${slot}`}
                    className="py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 rounded-xl transition border border-emerald-100 hover:border-emerald-500">
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href={`/dashboard/reception/appointments/new?doctorId=${selected.id}`} id={`profile-book-${selected.id}`}
                className="bg-emerald-500 text-white text-sm font-bold py-3 rounded-xl hover:bg-emerald-600 transition text-center">
                📅 Book Appointment
              </Link>
              <button id={`manage-leave-${selected.id}`}
                className="bg-slate-100 text-slate-700 text-sm font-bold py-3 rounded-xl hover:bg-slate-200 transition">
                🏖️ Manage Leave
              </button>
            </div>
          </div>
        </div>
      )}
      {selected && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelected(null)} />}
    </div>
  );
}
