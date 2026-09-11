'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMeshSync } from '../../../meshSync';

type InvoiceItem = { description: string; qty: number; rate: number; amount: number };

export default function NewInvoicePage() {
  const router = useRouter();
  const { billingCatalog } = useMeshSync();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientId: '', patientName: 'Ravi Kumar',
    doctorId: 'D001', invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '', paymentMethod: 'CASH', discount: 0, notes: '',
    includeGST: true, gstRate: 18,
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'First Consultation', qty: 1, rate: 500, amount: 500 },
  ]);

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const discountAmt = (subtotal * form.discount) / 100;
  const taxableAmt = subtotal - discountAmt;
  const gstAmt = form.includeGST ? (taxableAmt * form.gstRate) / 100 : 0;
  const total = taxableAmt + gstAmt;

  const addItem = () => setItems([...items, { description: '', qty: 1, rate: 0, amount: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'qty' || field === 'rate') {
      updated[i].amount = Number(updated[i].qty) * Number(updated[i].rate);
    }
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    router.push('/dashboard/reception/billing');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/reception/billing" className="p-2 rounded-xl hover:bg-slate-200 transition text-slate-600">←</Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create Invoice</h1>
          <p className="text-slate-500 text-sm">GST-compliant billing & payment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Invoice header */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">✚</div>
                <span className="font-extrabold text-slate-800">APML Connect Pro</span>
              </div>
              <p className="text-xs text-slate-500">Apollo Metro Clinic, Mumbai — GSTIN: 27ABCDE1234F1Z5</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Invoice No.</p>
              <p className="font-extrabold text-slate-800 text-lg font-mono">INV-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Patient</label>
              <input id="inv-patient" type="text" value={form.patientName}
                onChange={e => setForm({ ...form, patientName: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Invoice Date</label>
              <input id="inv-date" type="date" value={form.invoiceDate}
                onChange={e => setForm({ ...form, invoiceDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Due Date</label>
              <input id="inv-due" type="date" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Doctor</label>
              <select id="inv-doctor" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition">
                <option value="D001">Dr. Sharma — Cardiology</option>
                <option value="D002">Dr. Mehta — General OPD</option>
                <option value="D003">Dr. Gupta — Orthopedics</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Billing Items</h2>
            <button type="button" id="add-item" onClick={addItem}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition">
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 rounded-xl">
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase w-20">Qty</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase w-28">Rate (₹)</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase w-28">Amount (₹)</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5">
                      <select id={`item-desc-${i}`} value={item.description}
                        onChange={e => {
                          const desc = e.target.value;
                          const found = billingCatalog.find(b => b.name === desc);
                          updateItem(i, 'description', desc);
                          if (found) {
                            updateItem(i, 'rate', found.price);
                          }
                        }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white transition">
                        <option value="">-- Select Billing Item --</option>
                        {billingCatalog.map(itemOpt => (
                          <option key={itemOpt.id} value={itemOpt.name}>{itemOpt.name} (₹{itemOpt.price})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <input id={`item-qty-${i}`} type="number" value={item.qty} min={1}
                        onChange={e => updateItem(i, 'qty', parseInt(e.target.value) || 1)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                    </td>
                    <td className="px-4 py-2.5">
                      <input id={`item-rate-${i}`} type="number" value={item.rate} min={0}
                        onChange={e => updateItem(i, 'rate', parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <button type="button" id={`remove-item-${i}`} onClick={() => removeItem(i)}
                        disabled={items.length === 1}
                        className="text-slate-300 hover:text-rose-500 transition disabled:opacity-30 disabled:cursor-not-allowed">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add preset items */}
          <div className="mt-3 flex flex-wrap gap-2">
            <p className="text-xs text-slate-400 font-semibold w-full">Quick add:</p>
            {[
              { label: '💊 Pharmacy', desc: 'Pharmacy / Medicines', rate: 0 },
              { label: '🧪 Lab Test', desc: 'Laboratory Investigation', rate: 0 },
              { label: '🩹 Procedure', desc: 'Minor Procedure', rate: 0 },
              { label: '📋 Report', desc: 'Medical Report / Certificate', rate: 200 },
            ].map(preset => (
              <button key={preset.label} type="button" id={`quick-${preset.label}`}
                onClick={() => setItems([...items, { description: preset.desc, qty: 1, rate: preset.rate, amount: preset.rate }])}
                className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition">
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Totals & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Payment method */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h2 className="font-bold text-slate-800 mb-4">💳 Payment Method</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: 'CASH', label: '💵 Cash' },
                { id: 'UPI', label: '📱 UPI' },
                { id: 'CARD', label: '💳 Card' },
                { id: 'RAZORPAY', label: '🔵 Razorpay' },
                { id: 'STRIPE', label: '🟣 Stripe' },
                { id: 'INSURANCE', label: '🛡️ Insurance' },
              ].map(m => (
                <button key={m.id} type="button" id={`pay-${m.id}`}
                  onClick={() => setForm({ ...form, paymentMethod: m.id })}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition ${
                    form.paymentMethod === m.id ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount (%)</label>
                <input id="inv-discount" type="number" value={form.discount} min={0} max={100}
                  onChange={e => setForm({ ...form, discount: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  id="toggle-gst"
                  onClick={() => setForm({ ...form, includeGST: !form.includeGST })}
                  className={`w-10 h-5 rounded-full transition-all duration-300 relative cursor-pointer ${form.includeGST ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${form.includeGST ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Include GST ({form.gstRate}%)</span>
              </label>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-900 text-white rounded-2xl p-5">
            <h2 className="font-bold mb-4">Invoice Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount ({form.discount}%)</span>
                  <span className="text-emerald-400">-₹{discountAmt.toLocaleString()}</span>
                </div>
              )}
              {form.includeGST && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">GST ({form.gstRate}%)</span>
                  <span>₹{gstAmt.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-extrabold pt-3 border-t border-slate-700">
                <span>Total</span>
                <span className="text-emerald-400">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button type="submit" id="create-invoice" disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : '✅ Generate Invoice'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" id="print-invoice"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1">
                  🖨️ Print
                </button>
                <button type="button" id="share-invoice"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1">
                  📤 Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
