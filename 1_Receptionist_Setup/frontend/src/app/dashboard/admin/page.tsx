'use client';

import { useState } from 'react';

interface AuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  time: string;
  ip: string;
}

export default function AdminDashboard() {
  const [departments] = useState([
    { name: 'Cardiology', bedsTotal: 20, bedsOccupied: 14, staffCount: 8 },
    { name: 'General Medicine', bedsTotal: 40, bedsOccupied: 32, staffCount: 15 },
    { name: 'Pediatrics', bedsTotal: 15, bedsOccupied: 6, staffCount: 6 },
    { name: 'Emergency & Triage', bedsTotal: 25, bedsOccupied: 20, staffCount: 12 },
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    { id: '1', actor: 'Dr. Suresh Mehta', role: 'Doctor', action: 'READ_EMR_HISTORY', resource: 'Patient/Ramesh Patel', time: '17 Jun 2026 19:15:30', ip: '192.168.1.102' },
    { id: '2', actor: 'Sarah Jenkins', role: 'Administrator', action: 'CREATE_INVOICE', resource: 'Invoice/INV-2026002', time: '17 Jun 2026 18:40:12', ip: '192.168.1.50' },
    { id: '3', actor: 'Dr. Suresh Mehta', role: 'Doctor', action: 'CREATE_EMR_RECORD', resource: 'Patient/Ramesh Patel', time: '17 Jun 2026 18:30:00', ip: '192.168.1.102' },
    { id: '4', actor: 'Staff_Reception', role: 'Receptionist', action: 'CREATE_PATIENT', resource: 'Patient/Aisha Khan', time: '17 Jun 2026 17:15:22', ip: '192.168.1.61' },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Control Center</h1>
        <p className="text-slate-500 text-sm mt-1">Configure department configurations, monitor bed occupancy quotas, and review HIPAA audit trials.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Overall Bed Occupancy</span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-slate-800">72%</span>
            <span className="text-xs text-slate-500 font-semibold">(72 / 100 Beds Occupied)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '72%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registered Staff Users</span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-slate-800">41</span>
            <span className="text-xs text-slate-500 font-semibold">Active Members</span>
          </div>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-3 inline-block font-semibold">All credentials active</span>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">HIPAA Integrity Checks</span>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-extrabold text-emerald-600">Passed</span>
            <span className="text-xs text-slate-500 font-semibold">All logs encrypted</span>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-3 inline-block font-semibold">Automatic backups enabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department bed capacity map */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900">Hospital Departments Status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
                  <th className="px-6 py-4">Department Name</th>
                  <th className="px-6 py-4 text-center">Beds Capacity</th>
                  <th className="px-6 py-4 text-center">Beds Occupied</th>
                  <th className="px-6 py-4 text-center">Active Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-800">{dept.name}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">{dept.bedsTotal}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        (dept.bedsOccupied / dept.bedsTotal) > 0.8
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {dept.bedsOccupied}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">{dept.staffCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Audit Trails Display */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900">Security Audit trail</h2>
            <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">HIPAA Log</span>
          </div>

          <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800">{log.actor} ({log.role})</span>
                  <span className="text-[9px] text-slate-400">{log.time}</span>
                </div>
                <div className="mt-1">
                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold">{log.action}</span>
                  <span className="text-slate-500 ml-2">on {log.resource}</span>
                </div>
                <span className="block text-[9px] text-slate-400 mt-1 font-mono">Client IP: {log.ip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
