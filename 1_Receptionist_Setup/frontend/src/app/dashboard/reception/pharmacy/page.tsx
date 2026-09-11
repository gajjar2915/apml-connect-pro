'use client';

import { useState } from 'react';

const prescriptions = [
  { id: 'RX001', patient: 'Ravi Kumar', doctor: 'Dr. Sharma', date: '2026-06-19', medicines: ['Aspirin 75mg', 'Atorvastatin 20mg', 'Metoprolol 25mg'], status: 'PENDING', deliveryStatus: 'Processing' },
  { id: 'RX002', patient: 'Priya Nair', doctor: 'Dr. Mehta', date: '2026-06-18', medicines: ['Paracetamol 500mg', 'Cetirizine 10mg'], status: 'SENT', deliveryStatus: 'Ready for Pickup' },
  { id: 'RX003', patient: 'Suresh Rao', doctor: 'Dr. Gupta', date: '2026-06-17', medicines: ['Diclofenac 50mg', 'Pantoprazole 40mg'], status: 'DISPENSED', deliveryStatus: 'Delivered' },
  { id: 'RX004', patient: 'Anita Joshi', doctor: 'Dr. Sharma', date: '2026-06-16', medicines: ['Metformin 500mg', 'Glimepiride 1mg'], status: 'REFILL', deliveryStatus: 'Pending Refill' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  SENT: 'bg-blue-100 text-blue-700',
  DISPENSED: 'bg-emerald-100 text-emerald-700',
  REFILL: 'bg-violet-100 text-violet-700',
};

export default function PharmacyPage() {
  const [selected, setSelected] = useState<typeof prescriptions[0] | null>(null);

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Pharmacy Support</h1>
        <p className="text-slate-500 text-sm mt-1">Prescription management · Delivery tracking · Refill requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Dispatch', value: prescriptions.filter(p => p.status === 'PENDING').length, icon: '⏳', color: 'bg-amber-50 border-amber-100' },
          { label: 'Sent to Pharmacy', value: prescriptions.filter(p => p.status === 'SENT').length, icon: '💊', color: 'bg-blue-50 border-blue-100' },
          { label: 'Dispensed', value: prescriptions.filter(p => p.status === 'DISPENSED').length, icon: '✅', color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Refill Requests', value: prescriptions.filter(p => p.status === 'REFILL').length, icon: '🔄', color: 'bg-violet-50 border-violet-100' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-5`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Prescriptions list */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Prescriptions</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {prescriptions.map(rx => (
              <div key={rx.id} onClick={() => setSelected(rx)}
                className="p-5 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-xl flex-shrink-0">💊</div>
                    <div>
                      <p className="font-bold text-slate-800">{rx.patient}</p>
                      <p className="text-sm text-slate-500">{rx.doctor} · {rx.date}</p>
                      <p className="text-xs text-slate-400 mt-1">{rx.medicines.slice(0, 2).join(', ')}{rx.medicines.length > 2 ? ` +${rx.medicines.length - 2} more` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[rx.status] || 'bg-slate-100 text-slate-600'}`}>
                      {rx.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{rx.deliveryStatus}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button id={`send-rx-${rx.id}`} onClick={e => e.stopPropagation()}
                    className="px-3 py-1.5 bg-teal-500 text-white text-xs font-bold rounded-lg hover:bg-teal-600 transition">
                    📤 Send to Pharmacy
                  </button>
                  <button id={`refill-${rx.id}`} onClick={e => e.stopPropagation()}
                    className="px-3 py-1.5 bg-violet-500 text-white text-xs font-bold rounded-lg hover:bg-violet-600 transition">
                    🔄 Request Refill
                  </button>
                  <button id={`notify-patient-${rx.id}`} onClick={e => e.stopPropagation()}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition">
                    📱 Notify Patient
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {selected ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Prescription Details</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">{selected.id}</p>
                  <p className="font-bold text-slate-800 mt-1">{selected.patient}</p>
                  <p className="text-sm text-slate-500">{selected.doctor} · {selected.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medicines</p>
                  <div className="space-y-2">
                    {selected.medicines.map(med => (
                      <div key={med} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                        <span className="text-sm">💊</span>
                        <span className="text-sm font-semibold text-slate-700">{med}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-100 text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${statusColors[selected.status]}`}>{selected.status}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-100 text-sm">
                  <span className="text-slate-500">Delivery</span>
                  <span className="font-semibold text-slate-800">{selected.deliveryStatus}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">💊</div>
              <p className="font-semibold text-slate-500">Select a prescription to view details</p>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-3">Medicine Availability</h3>
            {['Aspirin 75mg', 'Metformin 500mg', 'Paracetamol 500mg', 'Atorvastatin 20mg'].map((med, i) => (
              <div key={med} className="flex items-center justify-between py-2 border-b border-slate-50 text-sm">
                <span className="text-slate-700">{med}</span>
                <span className={`font-bold ${i === 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {i === 1 ? '⚠️ Low Stock' : '✅ Available'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
