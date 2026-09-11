'use client';

import { useState } from 'react';
import { useMeshSync, MedicalDoc } from '../../meshSync';

const typeColors: Record<string, string> = {
  'Lab Report': 'bg-violet-100 text-violet-700',
  'Lab Request': 'bg-violet-100 text-violet-750 border-violet-200',
  'Prescription': 'bg-teal-100 text-teal-700',
  'Insurance': 'bg-emerald-100 text-emerald-700',
  'Consent Form': 'bg-amber-100 text-amber-700',
  'Radiology': 'bg-blue-100 text-blue-700',
  'Medical Certificate': 'bg-rose-100 text-rose-700',
  'Referral Letter': 'bg-indigo-100 text-indigo-750',
  'Vaccination Certificate': 'bg-emerald-150 text-emerald-800 border-emerald-350',
};

export default function DocumentsPage() {
  const { documents, addDocument } = useMeshSync();
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<MedicalDoc | null>(null);

  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const filteredDocs = documents.filter(d => 
    !deletedIds.includes(d.id) && (
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      d.patient.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSimulatedUpload = (type: string) => {
    const pName = prompt("Enter Patient Name for the uploaded document:", "Ravi Kumar");
    if (!pName) return;
    
    addDocument({
      name: `${type} - ${pName}`,
      patient: pName,
      type: type,
      format: 'PDF',
      size: '1.2 MB'
    });
    alert(`${type} uploaded successfully and synced via mesh!`);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Document Management</h1>
        <p className="text-slate-500 text-sm mt-1">Secure cloud document storage · Synchronized with clinic doctor workspace</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'}`}
      >
        <div className="text-4xl mb-2">☁️</div>
        <p className="font-bold text-slate-800 text-base">Drop files here or click to upload</p>
        <p className="text-slate-400 text-xs mt-0.5">Supports PDF, JPG, PNG, DICOM · Max 50MB per file</p>
        <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
          {[
            { label: '📄 Lab Request', type: 'Lab Report' },
            { label: '💊 Prescription', type: 'Prescription' },
            { label: '🛡️ Insurance', type: 'Insurance' },
            { label: '📋 Consent Form', type: 'Consent Form' }
          ].map(t => (
            <button
              key={t.type}
              onClick={() => handleSimulatedUpload(t.type)}
              className="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-emerald-55 hover:border-emerald-400 text-slate-650 hover:text-emerald-750 transition"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <span className="text-slate-400">🔍</span>
          <input id="doc-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents by name, patient, type..."
            className="bg-transparent text-sm outline-none w-full placeholder-slate-400" />
        </div>
      </div>

      {/* Document list */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Document Name', 'Patient', 'Document Type', 'Format', 'Size', 'Date Generated', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocs.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-lg">
                        {d.format === 'PDF' ? '📄' : d.format === 'JPG' ? '🖼️' : '🩺'}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 max-w-[240px] truncate">{d.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-semibold">{d.patient}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${typeColors[d.type] || 'bg-slate-100 text-slate-650'}`}>
                      {d.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{d.format}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{d.size}</td>
                  <td className="p-4 text-sm text-slate-600">{d.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setPreviewDoc(d)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition" 
                        title="Preview Document Details"
                      >
                        👁️
                      </button>
                      <button 
                        onClick={() => alert(`Simulating PDF download of: ${d.name}`)}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition" 
                        title="Download"
                      >
                        ⬇️
                      </button>
                      <button 
                        onClick={() => { alert(`Sending ${d.name} to HP-Clinic Jet printer...`); window.print(); }}
                        className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition" 
                        title="Print"
                      >
                        🖨️
                      </button>
                      <button 
                        onClick={() => { if (confirm(`Are you sure you want to delete ${d.name}?`)) { setDeletedIds([...deletedIds, d.id]); } }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition" 
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No documents matching search queries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <strong className="text-slate-800 text-base">Document Preview: {previewDoc.name}</strong>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-650 text-xl font-bold">×</button>
            </div>
            
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-150 pb-2 font-bold text-slate-500 uppercase">
                <span>Patient: {previewDoc.patient}</span>
                <span className="text-right">Type: {previewDoc.type}</span>
              </div>

              {previewDoc.type === 'Medical Certificate' && previewDoc.details && (
                <div className="space-y-2">
                  <p><strong>Certificate Class:</strong> {previewDoc.details.certType || 'Sick Leave'}</p>
                  <p><strong>Duration:</strong> {previewDoc.details.from} to {previewDoc.details.to}</p>
                  <p><strong>Clinical Basis:</strong> {previewDoc.details.reason}</p>
                </div>
              )}

              {previewDoc.type === 'Referral Letter' && previewDoc.details && (
                <div className="space-y-2">
                  <p><strong>Department Referral:</strong> {previewDoc.details.specialist}</p>
                  <p><strong>Brief Medical Abstract:</strong> {previewDoc.details.reason}</p>
                </div>
              )}

              {previewDoc.type === 'Consent Form' && previewDoc.details && (
                <div className="space-y-2">
                  <p><strong>Consent Procedure:</strong> {previewDoc.details.procedure}</p>
                  <p><strong>Verification status:</strong> Digitally signed by patient. Circular seal attached.</p>
                </div>
              )}

              {previewDoc.type === 'Lab Report' && previewDoc.details && (
                <div className="space-y-2">
                  <p><strong>Panels Requested:</strong></p>
                  <ul className="list-disc pl-5">
                    {(previewDoc.details.tests || []).map((t: string) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              )}

              {previewDoc.type === 'Vaccination Certificate' && previewDoc.details && (
                <div className="space-y-2">
                  <p><strong>Immunization record of:</strong> {previewDoc.patient}</p>
                  <p><strong>Vaccines Logged:</strong></p>
                  <ul className="list-disc pl-5">
                    {(previewDoc.details.vaccinesCompleted || []).map((v: string) => <li key={v}>{v}</li>)}
                  </ul>
                </div>
              )}

              {(!previewDoc.details || Object.keys(previewDoc.details).length === 0) && (
                <p className="italic text-slate-400 text-center py-4">Standard uploaded cloud EMR file. Details parsed and indexed.</p>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { alert('Document sent to print queue.'); setPreviewDoc(null); }}
                className="flex-1 bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition hover:bg-slate-900"
              >
                🖨️ Print
              </button>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
