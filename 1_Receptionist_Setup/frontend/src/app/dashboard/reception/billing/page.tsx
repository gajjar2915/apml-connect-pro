'use client';

import { useState } from 'react';
import { useMeshSync, Invoice } from '../../meshSync';

const statusColors: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-250',
  UNPAID: 'bg-rose-100 text-rose-700 border-rose-250',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700 border-amber-250',
  REFUNDED: 'bg-blue-100 text-blue-700 border-blue-250',
};

export default function BillingPage() {
  const { invoices, payInvoice } = useMeshSync();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Payment modal state
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = inv.patient.toLowerCase().includes(search.toLowerCase()) || inv.id.includes(search);
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((sum, current) => sum + current.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'UNPAID').reduce((sum, current) => sum + current.amount, 0);
  const totalPartial = invoices.filter(i => i.status === 'PARTIALLY_PAID').reduce((sum, current) => sum + current.amount, 0);

  const handleProcessPayment = () => {
    if (activeInvoice) {
      payInvoice(activeInvoice.id, paymentMethod);
      setActiveInvoice(null);
      alert(`Payment of ₹${activeInvoice.amount} processed for ${activeInvoice.patient} via ${paymentMethod}.`);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Billing & Payments</h1>
          <p className="text-slate-500 text-sm mt-1">Invoice management · Realtime billing and payment checkout sync</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, icon: '💰' },
          { label: 'Pending Payments', value: `₹${totalPending.toLocaleString()}`, icon: '⏳' },
          { label: 'Partial Payments', value: `₹${totalPartial.toLocaleString()}`, icon: '⚡' },
          { label: 'Total Invoices', value: String(invoices.length), icon: '📄' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <span className="text-slate-400">🔍</span>
          <input id="billing-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient, invoice ID..."
            className="bg-transparent text-sm outline-none w-full placeholder-slate-400" />
        </div>
        <div className="flex gap-2">
          {['All', 'PAID', 'UNPAID', 'PARTIALLY_PAID', 'REFUNDED'].map(s => (
            <button key={s} id={`bill-filter-${s}`} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${statusFilter === s ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Invoice ID', 'Patient Name', 'Consulting Doctor', 'Date Issued', 'Amount Due', 'Payment Method', 'Status', 'Actions'].map(h => (
                <th key={h} className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredInvoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4 font-mono text-xs text-slate-650 font-bold">{inv.id}</td>
                <td className="p-4 font-semibold text-sm text-slate-800">{inv.patient}</td>
                <td className="p-4 text-sm text-slate-600 font-medium">{inv.doctor}</td>
                <td className="p-4 text-sm text-slate-505 text-slate-500">{inv.date}</td>
                <td className="p-4 font-bold text-slate-800">₹{inv.amount.toLocaleString()}</td>
                <td className="p-4 text-sm text-slate-500">{inv.method}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[inv.status] || 'bg-slate-100 text-slate-600'}`}>
                    {inv.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => alert(`Invoice Summary Preview:\nID: ${inv.id}\nPatient: ${inv.patient}\nDoctor: ${inv.doctor}\nAmount: ₹${inv.amount}\nStatus: ${inv.status}`)} 
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition" 
                      title="Preview invoice details"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => { alert(`Sending Invoice ${inv.id} to HP-Clinic Jet printer...`); window.print(); }} 
                      className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition" 
                      title="Print Invoice"
                    >
                      🖨️
                    </button>
                    <button 
                      onClick={() => alert(`Simulating receipt link share to ${inv.patient} via WhatsApp...`)} 
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition" 
                      title="Share invoice link"
                    >
                      📤
                    </button>
                    {inv.status === 'UNPAID' && (
                      <button 
                        onClick={() => setActiveInvoice(inv)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition"
                      >
                        💳 Pay
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAYMENT CASHIER MODAL */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <strong className="text-slate-800 text-base">Process Payment: {activeInvoice.id}</strong>
              <button onClick={() => setActiveInvoice(null)} className="text-slate-400 hover:text-slate-650 text-xl font-bold">×</button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2 text-xs">
              <p><strong>Patient Name:</strong> {activeInvoice.patient}</p>
              <p><strong>Issued by:</strong> {activeInvoice.doctor}</p>
              <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2 font-bold text-slate-800">
                <span>Amount to Pay:</span>
                <span className="text-emerald-700">₹{activeInvoice.amount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'UPI', label: '📱 UPI / QR' },
                  { key: 'Cash', label: '💵 Cash' },
                  { key: 'Card', label: '💳 Card' },
                  { key: 'NetBanking', label: '🌐 Net Banking' },
                  { key: 'Insurance', label: '🛡️ Insurance' },
                  { key: 'Wallet', label: '👛 Wallet' },
                  { key: 'Cheque', label: '📝 Cheque' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setPaymentMethod(m.key)}
                    className={`py-2 px-1.5 rounded-xl text-[10px] font-bold transition border ${
                      paymentMethod === m.key 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button 
                onClick={handleSimulatedPayment => handleProcessPayment()}
                className="flex-1 bg-emerald-600 text-white font-extrabold py-2.5 rounded-xl text-xs transition hover:bg-emerald-700 shadow-md"
              >
                ✔ Accept Payment
              </button>
              <button 
                onClick={() => setActiveInvoice(null)}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
