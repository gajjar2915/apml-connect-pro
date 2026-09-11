'use client';

import { useState } from 'react';
import { useMeshSync } from '../../meshSync';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  SAMPLE_COLLECTED: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
};

export default function LabPage() {
  const { labBookings, addLabBooking, updateLabBookingStatus } = useMeshSync();
  const [showBookModal, setShowBookModal] = useState(false);
  const [labForm, setLabForm] = useState({ patient: '', test: 'Complete Blood Count (CBC)', doctor: 'Dr. Sharma', priority: 'NORMAL' as 'NORMAL' | 'URGENT', date: new Date().toISOString().split('T')[0], notes: '' });
  const [filter, setFilter] = useState('All');

  // Drag and Drop Lab Report State
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [patientInput, setPatientInput] = useState('');
  const [testTypeInput, setTestTypeInput] = useState('Blood Test Report');

  const filtered = labBookings.filter(l => {
    return filter === 'All' || l.status === filter;
  });

  const handleBookTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labForm.patient || !labForm.test) {
      alert('Please fill out patient name and target test.');
      return;
    }

    addLabBooking({
      patient: labForm.patient,
      test: labForm.test,
      doctor: labForm.doctor,
      date: labForm.date,
      status: 'PENDING',
      priority: labForm.priority,
    });

    alert(`Lab test ${labForm.test} booked successfully for ${labForm.patient}.`);
    setShowBookModal(false);
    setLabForm({ patient: '', test: 'Complete Blood Count (CBC)', doctor: 'Dr. Sharma', priority: 'NORMAL', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleQuickUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientInput && !tokenInput) {
      alert('Please enter patient name or token number.');
      return;
    }
    if (!uploadedFile) {
      alert('Please drag & drop or select a lab report file (PDF/Image).');
      return;
    }

    const patientDisplayName = tokenInput ? `[Token ${tokenInput.toUpperCase()}] ${patientInput || 'Patient'}` : patientInput;

    addLabBooking({
      patient: patientDisplayName,
      test: `${testTypeInput} (${uploadedFile.name})`,
      doctor: 'Dr. Sharma',
      date: new Date().toISOString().split('T')[0],
      status: 'COMPLETED',
      priority: 'URGENT',
    });

    alert(`Lab Report "${uploadedFile.name}" successfully attached & registered for ${patientDisplayName}!`);
    setUploadedFile(null);
    setTokenInput('');
    setPatientInput('');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lab Management</h1>
          <p className="text-slate-500 text-sm mt-1">Drag & Drop lab report attachment · Fast token registration · Sample tracking</p>
        </div>
        <button id="book-lab-test" onClick={() => setShowBookModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer">
          🧪 Book Lab Test
        </button>
      </div>

      {/* Drag & Drop Lab Report Section */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-slate-900/10 to-teal-900/10 border border-emerald-500/20 rounded-3xl p-6 shadow-md backdrop-blur-md">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
          <span>📤</span> Drag & Drop Lab Report Uploader & Fast Token Registration
        </h2>
        <form onSubmit={handleQuickUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Token No. / Patient Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Token e.g. TK-104"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-1/3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Patient Name (e.g. Ramesh Kumar)"
                value={patientInput}
                onChange={(e) => setPatientInput(e.target.value)}
                className="w-2/3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Test Category</label>
            <select
              value={testTypeInput}
              onChange={(e) => setTestTypeInput(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
            >
              <option value="Blood Test Report">Blood Test / CBC</option>
              <option value="X-Ray Scan PDF">X-Ray / MRI Scan PDF</option>
              <option value="Lipid Profile">Lipid Profile</option>
              <option value="Diabetes HbA1c">Diabetes HbA1c</option>
              <option value="Urine Analysis">Urine Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload PDF / Image File</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDropFile}
              className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
                dragOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <input type="file" id="labFileInput" onChange={handleFileSelect} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
              <label htmlFor="labFileInput" className="cursor-pointer block text-xs">
                {uploadedFile ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">📄 {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                ) : (
                  <span className="text-slate-500">📥 Drag & Drop PDF / Image here or <span className="text-emerald-500 font-bold underline">Browse</span></span>
                )}
              </label>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              ⚡ Attach & Register Lab Report
            </button>
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Tests', value: labBookings.filter(l => l.status === 'PENDING').length, icon: '⏳', color: 'bg-amber-50 border-amber-100 text-amber-700' },
          { label: 'Sample Collected', value: labBookings.filter(l => l.status === 'SAMPLE_COLLECTED').length, icon: '🧫', color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Reports Ready', value: labBookings.filter(l => l.status === 'COMPLETED').length, icon: '✅', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
          { label: 'Urgent Tests', value: labBookings.filter(l => l.priority === 'URGENT').length, icon: '🔴', color: 'bg-rose-50 border-rose-100 text-rose-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-5 shadow-sm`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tests table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-white text-sm">Lab Test Requests & Reports</h2>
          <div className="flex gap-2">
            {['All', 'PENDING', 'SAMPLE_COLLECTED', 'COMPLETED'].map(f => (
              <button key={f} id={`lab-filter-${f}`}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${filter === f ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-650 hover:bg-slate-100'}`}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-left border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                <th className="p-3">Patient</th>
                <th className="p-3">Lab Test</th>
                <th className="p-3">Doctor</th>
                <th className="p-3">Date</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{l.patient}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{l.test}</td>
                  <td className="p-3 text-slate-500">{l.doctor}</td>
                  <td className="p-3 text-slate-500">{l.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${l.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                      {l.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${statusColors[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {l.status === 'PENDING' && (
                      <button onClick={() => updateLabBookingStatus(l.id, 'SAMPLE_COLLECTED')} className="bg-blue-500 text-white px-2.5 py-1 rounded-lg font-bold">Collect Sample</button>
                    )}
                    {l.status === 'SAMPLE_COLLECTED' && (
                      <button onClick={() => updateLabBookingStatus(l.id, 'COMPLETED')} className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-bold">Finalize Report</button>
                    )}
                    {l.status === 'COMPLETED' && (
                      <span className="text-emerald-500 font-bold">Ready</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Book New Lab Test</h3>
            <form onSubmit={handleBookTest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Patient Name</label>
                <input type="text" required value={labForm.patient} onChange={e => setLabForm({...labForm, patient: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Lab Test Name</label>
                <input type="text" required value={labForm.test} onChange={e => setLabForm({...labForm, test: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Referring Doctor</label>
                <input type="text" value={labForm.doctor} onChange={e => setLabForm({...labForm, doctor: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBookModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-xl">Book Test</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
