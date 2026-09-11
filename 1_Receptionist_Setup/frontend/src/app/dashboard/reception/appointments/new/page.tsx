'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMeshSync } from '../../../meshSync';

const doctors = [
  { id: 'D001', name: 'Dr. Sharma', spec: 'Cardiology', fee: 800, available: true, slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'] },
  { id: 'D002', name: 'Dr. Mehta', spec: 'General OPD', fee: 500, available: true, slots: ['09:00 AM', '09:15 AM', '09:30 AM', '10:00 AM', '11:30 AM'] },
  { id: 'D003', name: 'Dr. Gupta', spec: 'Orthopedics', fee: 1000, available: true, slots: ['10:00 AM', '10:30 AM', '11:00 AM'] },
  { id: 'D004', name: 'Dr. Patel', spec: 'Dermatology', fee: 700, available: true, slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
  { id: 'D005', name: 'Dr. Joshi', spec: 'Pediatrics', fee: 600, available: true, slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'] },
];

export default function NewAppointmentPage() {
  const router = useRouter();
  const { addAppointment, addQueueToken, patients } = useMeshSync();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientSearch: '', patientId: '', patientName: '',
    doctorId: '', date: new Date().toISOString().split('T')[0], slot: '10:00 AM',
    type: 'IN_PERSON', priority: 'NORMAL', reason: 'Routine Health Checkup', notes: '',
    isWalkIn: false, isEmergency: false, isFollowUp: false, isRecurring: false,
    recurringInterval: 'weekly',
  });

  const selectedDoctor = doctors.find(d => d.id === form.doctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName) {
      alert('Please select or write a patient name.');
      return;
    }
    if (!form.doctorId) {
      alert('Please select a consulting doctor.');
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const doctorObj = doctors.find(d => d.id === form.doctorId);
    const docName = doctorObj ? doctorObj.name : 'Dr. Sharma';
    const specName = doctorObj ? doctorObj.spec : 'General OPD';

    // 1. Add Appointment to Database
    const apptIdNum = Math.floor(100 + Math.random() * 900);
    const tokenNum = `A${Math.floor(100 + Math.random() * 950)}`;
    const statusVal = form.isWalkIn || form.isEmergency ? 'WAITING' : 'SCHEDULED';
    
    addAppointment({
      patient: form.patientName,
      doctor: docName,
      date: form.date,
      time: form.slot,
      type: specName,
      status: statusVal,
      payStatus: 'UNPAID',
    });

    // 2. If walk-in or emergency, push straight to OPD queue
    if (form.isWalkIn || form.isEmergency) {
      addQueueToken({
        token: tokenNum,
        name: form.patientName,
        age: '28',
        gender: 'Female',
        doctor: docName,
        status: statusVal,
        priority: form.isEmergency ? 'EMERGENCY' : 'NORMAL',
        time: form.slot,
        type: specName,
      });
    }

    setLoading(false);
    router.push('/dashboard/reception/appointments');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/reception/appointments" className="p-2 rounded-xl hover:bg-slate-200 transition text-slate-650 font-bold">←</Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book Appointment</h1>
          <p className="text-slate-500 text-sm">Schedule a new patient appointment</p>
        </div>
      </div>

      {/* Appointment type toggles */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 mb-5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Appointment Type</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'isWalkIn', label: '🚶 Walk-In', color: 'bg-emerald-600 text-white' },
            { key: 'isEmergency', label: '🔴 Emergency', color: 'bg-rose-600 text-white' },
            { key: 'isFollowUp', label: '🔄 Follow-Up', color: 'bg-blue-600 text-white' },
            { key: 'isRecurring', label: '🔁 Recurring', color: 'bg-violet-600 text-white' },
          ].map(t => {
            const isActive = form[t.key as keyof typeof form];
            return (
              <button
                key={t.key}
                type="button"
                id={`type-${t.key}`}
                onClick={() => setForm({ ...form, [t.key]: !isActive })}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  isActive ? t.color : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {form.isEmergency && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
            <p className="text-rose-700 text-xs font-bold">⚠️ Emergency appointment will automatically generate a high-priority token in the active OPD queue.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">👤 Patient Selection</h2>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Search Registered Database</label>
            <div className="relative">
              <input id="patient-search-appt" type="text" value={form.patientSearch}
                onChange={e => setForm({ ...form, patientSearch: e.target.value, patientName: e.target.value })}
                placeholder="Search name, MRN, phone, or type new patient name..."
                className="w-full border border-slate-250 rounded-xl px-4 py-2.5 pr-10 text-xs outline-none focus:ring-2 focus:ring-emerald-450 transition" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
            
            {/* Auto-suggest dropdown */}
            {form.patientSearch && patients.filter(p => p.name.toLowerCase().includes(form.patientSearch.toLowerCase())).length > 0 && (
              <div className="mt-2 border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 overflow-hidden shadow-sm max-h-[150px] overflow-y-auto">
                {patients.filter(p => p.name.toLowerCase().includes(form.patientSearch.toLowerCase())).map(p => (
                  <button key={p.id} type="button"
                    onClick={() => setForm({ ...form, patientName: p.name, patientSearch: p.name })}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-xs text-slate-700 transition font-medium">
                    👤 {p.name} ({p.mrn} · {p.phone})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Doctor and Schedule details */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">📅 Doctor & Time</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Consulting Doctor</label>
              <select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}
                className="w-full border border-slate-250 rounded-xl p-2.5 text-xs outline-none bg-white font-medium">
                <option value="">Select consulting doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.spec})</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Appointment Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full border border-slate-250 rounded-xl p-2 text-xs outline-none bg-white font-medium" />
            </div>
          </div>

          {selectedDoctor && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Available Slots</label>
              <div className="flex flex-wrap gap-2">
                {selectedDoctor.slots.map(s => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, slot: s })}
                    className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition ${form.slot === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reason for visit */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Reason for Visit</label>
            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
              className="w-full border border-slate-250 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-350 transition" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Additional Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Clinical or administrative notes..."
              className="w-full border border-slate-250 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-350 transition" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/reception/appointments" className="px-5 py-3 border border-slate-250 hover:bg-slate-50 rounded-2xl text-xs font-bold transition text-slate-700">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition disabled:opacity-50">
            {loading ? 'Scheduling...' : 'Confirm Appointment Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
