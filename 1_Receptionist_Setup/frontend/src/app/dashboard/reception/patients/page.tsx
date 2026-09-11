'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMeshSync, PatientProfileItem } from '../../meshSync';

function PatientsPageContent() {
  const { patients = [], deletePatientProfile } = useMeshSync();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('search') || '';

  const [search, setSearch] = useState(initialQuery);
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const urlQ = searchParams.get('q') || searchParams.get('search');
    if (urlQ) {
      setSearch(urlQ);
    }
  }, [searchParams]);

  const safePatients = Array.isArray(patients) ? patients : [];

  const filtered = safePatients.filter(p => {
    if (!p) return false;
    const q = search.trim().toLowerCase();
    
    const nameStr = (p.name || '').toLowerCase();
    const mrnStr = (p.mrn || '').toLowerCase();
    const phoneStr = (p.phone || '').toLowerCase();
    const idStr = (p.id || '').toLowerCase();
    const bloodStr = (p.blood || '').toLowerCase();
    const genderStr = (p.gender || '').toLowerCase();

    const matchSearch = !q || 
      nameStr.includes(q) || 
      mrnStr.includes(q) || 
      phoneStr.includes(q) || 
      idStr.includes(q) ||
      bloodStr.includes(q) ||
      genderStr.includes(q);

    const matchGender = genderFilter === 'All' || p.gender === genderFilter;
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchBlood = bloodFilter === 'All' || p.blood === bloodFilter;
    
    return matchSearch && matchGender && matchStatus && matchBlood;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'age') return a.age - b.age;
    if (sortBy === 'lastVisit') return b.lastVisit.localeCompare(a.lastVisit);
    return 0;
  });

  const toggleSelect = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deletePatientProfile(deleteTarget);
      alert('Patient profile removed from local database.');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Management</h1>
          <p className="text-slate-500 text-sm mt-1">{patients.length} total patients · {patients.filter(p => p.status === 'Active').length} active</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/reception/patients/new" id="btn-new-patient"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm">
            + Register New Patient
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <span className="text-slate-400">🔍</span>
            <input
              id="patient-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, MRN, phone number..."
              className="bg-transparent text-sm text-slate-700 outline-none w-full placeholder-slate-400 font-semibold"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-650">✕</button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'filter-gender', value: genderFilter, setter: setGenderFilter, options: ['All', 'Male', 'Female'] },
              { id: 'filter-status', value: statusFilter, setter: setStatusFilter, options: ['All', 'Active', 'Inactive'] },
              { id: 'filter-blood', value: bloodFilter, setter: setBloodFilter, options: ['All', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] },
            ].map(f => (
              <select
                key={f.id}
                id={f.id}
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-300 bg-white font-medium"
              >
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            <select
              id="sort-patients"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-300 bg-white font-medium"
            >
              <option value="name">Sort: Name</option>
              <option value="lastVisit">Sort: Last Visit</option>
              <option value="age">Sort: Age</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-xs">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10 text-left">
                  <input type="checkbox" onChange={e => setSelected(e.target.checked ? patients.map(p => p.id) : [])}
                    checked={selected.length === patients.length && patients.length > 0} className="rounded border-slate-350" />
                </th>
                {['MRN / ID', 'Patient Name', 'Age/Gender', 'Contact Phone', 'Blood Group', 'Status', 'Last Visit', 'Insurance', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {sorted.map(p => (
                <tr key={p.id} className={`hover:bg-slate-50/50 transition ${selected.includes(p.id) ? 'bg-emerald-50/10' : ''}`}>
                  <td className="p-4">
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-slate-350" />
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-600">{p.mrn}</td>
                  <td className="p-4 font-bold text-slate-800 text-sm">{p.name}</td>
                  <td className="p-4 font-semibold text-slate-600">{p.age} Yrs · {p.gender}</td>
                  <td className="p-4 font-semibold text-slate-600">{p.phone}</td>
                  <td className="p-4 font-bold text-slate-700">{p.blood}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-semibold">{p.lastVisit}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.insurance ? 'bg-blue-105 text-blue-800 bg-blue-100 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {p.insurance ? 'Covered' : 'Cash Only'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteClick(p.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Profile">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 text-sm">No registered patients match filter logic.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <span className="text-4xl block mb-1">⚠️</span>
            <h3 className="text-base font-bold text-slate-800">Remove Patient Record</h3>
            <p className="text-xs text-slate-500">This will permanently delete this patient profile from the local offline workstation store.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 text-xs transition">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md">
                🗑️ Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-bold text-sm">Loading patient database...</div>}>
      <PatientsPageContent />
    </Suspense>
  );
}
