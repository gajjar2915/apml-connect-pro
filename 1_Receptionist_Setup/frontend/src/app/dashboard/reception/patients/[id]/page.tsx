'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'billing' | 'documents' | 'notes'>('overview');

  const patient = {
    id: params.id || 'P001',
    mrn: 'MRN-20240001', name: 'Ravi Kumar', age: 45, gender: 'Male',
    dob: '1981-03-15', phone: '9876543210', email: 'ravi.kumar@gmail.com',
    blood: 'O+', weight: '78 kg', height: '172 cm',
    address: '42, Gandhi Nagar, Andheri West, Mumbai 400058',
    allergies: ['Penicillin', 'Latex'],
    medical: 'Hypertension (since 2019), Dyslipidemia',
    insurance: { provider: 'Star Health Insurance', policy: 'SH-2024-001', valid: '2026-12-31' },
    emergency: { name: 'Sunita Kumar (Spouse)', phone: '9876543211' },
    status: 'Active',
  };

  const appointments = [
    { date: '2026-06-19', doctor: 'Dr. Sharma', type: 'Cardiology', status: 'CONFIRMED', token: 'A012' },
    { date: '2026-05-20', doctor: 'Dr. Sharma', type: 'Follow-Up', status: 'COMPLETED', token: 'A009' },
    { date: '2026-04-10', doctor: 'Dr. Gupta', type: 'Orthopedics', status: 'COMPLETED', token: 'A005' },
  ];

  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    SCHEDULED: 'bg-slate-100 text-slate-600',
    CANCELLED: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reception/patients" className="p-2 rounded-xl hover:bg-slate-200 transition text-slate-600">←</Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Patient Profile</h1>
          <p className="text-slate-500 text-sm">{patient.mrn} · {patient.status}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/reception/appointments/new?patientId=${patient.id}`} id="book-for-patient"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
            📅 Book Appointment
          </Link>
          <Link href={`/dashboard/reception/billing/new?patientId=${patient.id}`} id="bill-patient"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
            💳 Create Invoice
          </Link>
          <button id="print-patient-card"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
            🖨️ Print Card
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0 shadow-lg">
            {patient.name.split(' ').map(w => w[0]).join('')}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">{patient.name}</h2>
                <p className="text-slate-500 mt-0.5">{patient.age} years · {patient.gender} · {patient.blood}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full">
                ✅ {patient.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { label: 'MRN', value: patient.mrn },
                { label: 'Phone', value: patient.phone },
                { label: 'Email', value: patient.email },
                { label: 'DOB', value: patient.dob },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 overflow-x-auto">
        {[
          { id: 'overview', label: '📋 Overview' },
          { id: 'appointments', label: '📅 Appointments' },
          { id: 'billing', label: '💳 Billing' },
          { id: 'documents', label: '📁 Documents' },
          { id: 'notes', label: '📝 Notes' },
        ].map(tab => (
          <button key={tab.id} id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-800">🏥 Medical Information</h3>
            <div className="space-y-3">
              {[
                { label: 'Blood Group', value: patient.blood },
                { label: 'Height', value: patient.height },
                { label: 'Weight', value: patient.weight },
                { label: 'Medical History', value: patient.medical },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800 text-right max-w-xs">{item.value}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">⚠️ Allergies</p>
              <div className="flex gap-2 flex-wrap">
                {patient.allergies.map(a => (
                  <span key={a} className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <h3 className="font-bold text-slate-800 mb-4">🛡️ Insurance</h3>
              <div className="space-y-2">
                {[
                  { label: 'Provider', value: patient.insurance.provider },
                  { label: 'Policy No.', value: patient.insurance.policy },
                  { label: 'Valid Until', value: patient.insurance.valid },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <h3 className="font-bold text-slate-800 mb-4">🆘 Emergency Contact</h3>
              <p className="font-semibold text-slate-800">{patient.emergency.name}</p>
              <p className="text-sm text-slate-500">{patient.emergency.phone}</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5">
              <h3 className="font-bold text-slate-800 mb-3">📍 Address</h3>
              <p className="text-sm text-slate-700">{patient.address}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Date', 'Doctor', 'Type', 'Token', 'Status', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-semibold text-sm text-slate-800">{a.date}</td>
                  <td className="p-4 text-sm text-slate-700">{a.doctor}</td>
                  <td className="p-4 text-sm text-slate-600">{a.type}</td>
                  <td className="p-4 font-mono text-sm font-bold text-slate-600">{a.token}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button id={`followup-appt-${i}`} className="text-xs font-bold px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                      📅 Follow-Up
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(activeTab === 'billing' || activeTab === 'documents' || activeTab === 'notes') && (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">{activeTab === 'billing' ? '💳' : activeTab === 'documents' ? '📁' : '📝'}</div>
          <p className="font-bold text-slate-600 text-lg capitalize">{activeTab} History</p>
          <p className="text-slate-400 text-sm mt-2">Patient {activeTab} records will appear here</p>
          <Link href={activeTab === 'billing' ? `/dashboard/reception/billing/new?patientId=${patient.id}` : `/dashboard/reception/documents`}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition">
            {activeTab === 'billing' ? '+ Create Invoice' : activeTab === 'documents' ? '+ Upload Document' : '+ Add Note'}
          </Link>
        </div>
      )}
    </div>
  );
}
