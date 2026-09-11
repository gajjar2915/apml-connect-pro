'use client';

import { useState } from 'react';
import { useMeshSync, ClaimItem } from '../../meshSync';

const statusColors: Record<string, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  PENDING: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30',
};

interface AbhaCard {
  abhaNumber: string;
  abhaAddress: string;
  name: string;
  gender: string;
  dob: string;
  mobile: string;
  linkedInsurance: string;
  verified: boolean;
}

const sampleAbhaCards: AbhaCard[] = [
  {
    abhaNumber: '91-8492-0193-4810',
    abhaAddress: 'sarah.jenkins@abha',
    name: 'Sarah Jenkins',
    gender: 'Female',
    dob: '1992-05-14',
    mobile: '+91 98765 43210',
    linkedInsurance: 'Star Health (POL-84920)',
    verified: true
  },
  {
    abhaNumber: '91-3829-1049-5829',
    abhaAddress: 'rajesh.kumar@abha',
    name: 'Rajesh Kumar',
    gender: 'Male',
    dob: '1985-11-20',
    mobile: '+91 91234 56789',
    linkedInsurance: 'HDFC ERGO (POL-38291)',
    verified: true
  }
];

export default function InsurancePage() {
  const { claims, addClaim, updateClaimStatus } = useMeshSync();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'claims' | 'abha'>('claims');
  
  const [abhaList, setAbhaList] = useState<AbhaCard[]>(sampleAbhaCards);
  const [selectedAbha, setSelectedAbha] = useState<AbhaCard | null>(sampleAbhaCards[0]);

  // ABHA Form State
  const [abhaForm, setAbhaForm] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    linkedInsurance: 'Star Health Insurance'
  });

  const [claimForm, setClaimForm] = useState({
    patient: '',
    provider: 'Star Health Insurance',
    policyNo: '',
    invoiceId: '',
    amount: '',
    diagnosis: 'Cardiac Evaluation',
    abhaNumber: ''
  });

  const [search, setSearch] = useState('');

  const filteredClaims = claims.filter(c => 
    c.patient.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.provider.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateAbha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaForm.name || !abhaForm.mobile) return;

    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const randDigits2 = Math.floor(1000 + Math.random() * 9000);
    const randDigits3 = Math.floor(1000 + Math.random() * 9000);

    const newAbha: AbhaCard = {
      abhaNumber: `91-${randDigits}-${randDigits2}-${randDigits3}`,
      abhaAddress: `${abhaForm.name.toLowerCase().replace(/\s+/g, '.')}.${randDigits}@abha`,
      name: abhaForm.name,
      gender: abhaForm.gender,
      dob: abhaForm.dob || '1995-01-01',
      mobile: `+91 ${abhaForm.mobile}`,
      linkedInsurance: `${abhaForm.linkedInsurance} (POL-${randDigits})`,
      verified: true
    };

    setAbhaList([newAbha, ...abhaList]);
    setSelectedAbha(newAbha);
    setShowAbhaModal(false);
    setAbhaForm({ name: '', dob: '', gender: 'Male', mobile: '', linkedInsurance: 'Star Health Insurance' });
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.patient || !claimForm.amount) {
      alert('Please fill out all required fields.');
      return;
    }

    addClaim({
      patient: claimForm.patient,
      provider: claimForm.provider,
      policy: claimForm.policyNo || `POL-${Math.floor(10000 + Math.random() * 90000)}`,
      invoiceId: claimForm.invoiceId || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: parseFloat(claimForm.amount),
      approved: null,
      status: 'SUBMITTED',
    });

    setShowClaimModal(false);
    setClaimForm({ patient: '', provider: 'Star Health Insurance', policyNo: '', invoiceId: '', amount: '', diagnosis: 'Cardiac Evaluation', abhaNumber: '' });
  };

  const handleApprove = (claim: ClaimItem) => {
    const approvedVal = prompt(`Enter Approved Amount for ${claim.patient} (Claimed: ₹${claim.amount}):`, String(claim.amount));
    if (approvedVal === null) return;
    const amount = parseFloat(approvedVal) || claim.amount;
    updateClaimStatus(claim.id, 'APPROVED', amount);
  };

  const handleReject = (claimId: string) => {
    if (confirm(`Reject Claim ID ${claimId}?`)) {
      updateClaimStatus(claimId, 'REJECTED', 0);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            🇮🇳 ABDM Integrated • ABHA Health Card System
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Insurance & ABHA Health Card Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Ayushman Bharat Digital Mission (ABDM) verification · Policy claim ledger · Instant ABHA ID generation
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAbhaModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer"
          >
            💳 Generate New ABHA Card
          </button>
          <button
            onClick={() => setShowClaimModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-600/20 cursor-pointer"
          >
            🛡️ Submit Claim
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'claims'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          📋 Insurance Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveTab('abha')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'abha'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          💳 ABHA Digital Cards ({abhaList.length})
        </button>
      </div>

      {/* ABHA Digital Card Section */}
      {activeTab === 'abha' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ABHA Card Digital Widget */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Digital ABHA Health ID Preview</h2>
            
            {selectedAbha && (
              <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden space-y-6">
                
                {/* ABDM Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 via-white to-green-500 flex items-center justify-center text-slate-900 font-extrabold text-xs shadow">
                      🇮🇳
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-wider uppercase text-blue-400">ABDM • Govt of India</div>
                      <div className="text-[10px] text-slate-400 font-semibold">Ayushman Bharat Health Account</div>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    ✓ Verified
                  </span>
                </div>

                {/* Card Details */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Health Card Holder</div>
                      <div className="text-lg font-extrabold tracking-tight text-white">{selectedAbha.name}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">ABHA Address</div>
                      <div className="text-xs font-mono font-bold text-blue-300">{selectedAbha.abhaAddress}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Gender / DOB</div>
                        <div className="text-xs font-semibold text-slate-200">{selectedAbha.gender} • {selectedAbha.dob}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Mobile</div>
                        <div className="text-xs font-semibold text-slate-200">{selectedAbha.mobile}</div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="w-24 h-24 bg-white p-2 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-700 flex-shrink-0">
                    <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-[10px] font-mono text-white text-center font-bold p-1">
                      [ABDM QR CODE]
                    </div>
                  </div>
                </div>

                {/* ABHA Number */}
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">14-Digit ABHA Number</div>
                    <div className="text-lg font-mono font-extrabold text-blue-400 tracking-wider">{selectedAbha.abhaNumber}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedAbha.abhaNumber)}
                    className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg font-semibold border border-slate-700"
                  >
                    Copy
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 font-semibold text-center border-t border-slate-800/80 pt-3">
                  Linked Insurance: <span className="text-slate-300 font-bold">{selectedAbha.linkedInsurance}</span>
                </div>
              </div>
            )}
          </div>

          {/* Registered ABHA Directory */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Clinic Verified ABHA Directory</h2>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {abhaList.map(card => (
                  <div
                    key={card.abhaNumber}
                    onClick={() => setSelectedAbha(card)}
                    className={`p-5 flex items-center justify-between gap-4 cursor-pointer transition ${
                      selectedAbha?.abhaNumber === card.abhaNumber
                        ? 'bg-blue-50/70 dark:bg-blue-500/10 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl font-bold">
                        💳
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">{card.name}</div>
                        <div className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{card.abhaNumber}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{card.abhaAddress} • {card.mobile}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                        ABDM Verified
                      </span>
                      <div className="text-xs text-slate-400 font-semibold mt-1.5">{card.linkedInsurance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (

        /* Claims Ledger Section */
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Claims Submitted', value: claims.length, icon: '📋', color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
              { label: 'Approved Claims', value: claims.filter(c => c.status === 'APPROVED').length, icon: '✅', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' },
              { label: 'Pending Review', value: claims.filter(c => c.status === 'PENDING' || c.status === 'SUBMITTED').length, icon: '⏳', color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' },
              { label: 'Rejected Claims', value: claims.filter(c => c.status === 'REJECTED').length, icon: '❌', color: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' },
            ].map(s => (
              <div key={s.label} className={`${s.color} border rounded-2xl p-5 shadow-sm`}>
                <span className="text-2xl">{s.icon}</span>
                <p className="text-3xl font-extrabold mt-2">{s.value}</p>
                <p className="text-xs font-semibold opacity-80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-3 shadow-sm">
            <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5">
              <span className="text-slate-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search insurance claims by patient name, claim ID, or provider..."
                className="bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none w-full placeholder-slate-400 font-semibold"
              />
            </div>
          </div>

          {/* Claims Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">Insurance Claims Ledger</h2>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                    {['Claim ID', 'Patient', 'Provider', 'Policy No.', 'Invoice', 'Claimed', 'Approved', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="p-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredClaims.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-400">{c.id}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">{c.patient}</td>
                      <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">{c.provider}</td>
                      <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{c.policy}</td>
                      <td className="p-4 font-mono text-slate-500 dark:text-slate-400">{c.invoiceId}</td>
                      <td className="p-4 font-extrabold text-slate-900 dark:text-white">₹{c.amount.toLocaleString()}</td>
                      <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                        {c.approved !== null ? `₹${c.approved.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap uppercase border ${statusColors[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-semibold">{c.date}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {c.status === 'SUBMITTED' && (
                            <>
                              <button onClick={() => handleApprove(c)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-[10px]">
                                Approve
                              </button>
                              <button onClick={() => handleReject(c.id)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition text-[10px]">
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generate ABHA Modal */}
      {showAbhaModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateAbha} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Generate ABDM ABHA Card</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ayushman Bharat Digital Health ID Registration</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Patient Name</label>
                <input
                  type="text"
                  value={abhaForm.name}
                  onChange={e => setAbhaForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g. Ramesh Verma"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={abhaForm.dob}
                    onChange={e => setAbhaForm(prev => ({ ...prev, dob: e.target.value }))}
                    required
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
                  <select
                    value={abhaForm.gender}
                    onChange={e => setAbhaForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={abhaForm.mobile}
                  onChange={e => setAbhaForm(prev => ({ ...prev, mobile: e.target.value }))}
                  required
                  placeholder="9876543210"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAbhaModal(false)}
                className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md"
              >
                💳 Issue ABHA Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Claim Submission Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitClaim} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">🛡️ Submit Insurance Claim</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  value={claimForm.patient}
                  onChange={e => setClaimForm(prev => ({ ...prev, patient: e.target.value }))}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Claim Amount (₹)</label>
                  <input
                    type="number"
                    value={claimForm.amount}
                    onChange={e => setClaimForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Policy Number</label>
                  <input
                    type="text"
                    value={claimForm.policyNo}
                    onChange={e => setClaimForm(prev => ({ ...prev, policyNo: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Invoice Ref</label>
                  <input
                    type="text"
                    value={claimForm.invoiceId}
                    onChange={e => setClaimForm(prev => ({ ...prev, invoiceId: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Provider</label>
                  <select
                    value={claimForm.provider}
                    onChange={e => setClaimForm(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs outline-none font-semibold"
                  >
                    {['Star Health Insurance', 'HDFC ERGO Health', 'ICICI Lombard', 'Bajaj Allianz', 'New India Assurance', 'LIC Health', 'Niva Bupa'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md"
              >
                🛡️ Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
