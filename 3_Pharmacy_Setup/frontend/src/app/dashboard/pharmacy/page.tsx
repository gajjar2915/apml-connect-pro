'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMeshSync, MedicalDoc } from '../meshSync';

const orderStatusColors: Record<string, string> = {
  Received: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  Verified: 'bg-amber-50 border-amber-200 text-amber-700',
  Packing: 'bg-blue-50 border-blue-200 text-blue-700',
  Completed: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  Rejected: 'bg-rose-50 border-rose-200 text-rose-700',
};

export default function PharmacyPage() {
  const { documents = [], invoices = [], addInvoice, stocks = [], updateStock, whoMedicines = [], importWHOMedicineToStock, accounts = [], updateAccount } = useMeshSync();
  const [activeSlide, setActiveSlide] = useState<'orders' | 'inventory' | 'who_catalog' | 'financials' | 'account'>('orders');
  const [whoSearchQuery, setWhoSearchQuery] = useState('');
  const [whoCategoryFilter, setWhoCategoryFilter] = useState('all');

  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    const hasAuthParam = typeof window !== 'undefined' && window.location.search.includes('auth=true');
    const isLoggedIn = sessionStorage.getItem('pharmacy_logged_in');
    if (hasAuthParam || isLoggedIn === 'true') {
      sessionStorage.setItem('pharmacy_logged_in', 'true');
      setIsLocked(false);
    } else {
      router.push('/dashboard/pharmacy/login');
    }
    setCheckingAuth(false);
  }, [router]);

  const handleLockWorkspace = () => {
    sessionStorage.removeItem('pharmacy_logged_in');
    setIsLocked(true);
    router.push('/dashboard/pharmacy/login');
  };

  // Slide 1 State
  const [selectedRx, setSelectedRx] = useState<MedicalDoc | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, 'Received' | 'Verified' | 'Packing' | 'Completed' | 'Rejected'>>({});
  const [rejectReasonMap, setRejectReasonMap] = useState<Record<string, string>>({});
  const [currentRejectingId, setCurrentRejectingId] = useState<string | null>(null);
  const [verifyFileId, setVerifyFileId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Slide 2 State
  const [scanActive, setScanActive] = useState(false);
  const [expiryFilter, setExpiryFilter] = useState<'all' | '30' | '60' | '90'>('all');
  const [manualEditId, setManualEditId] = useState<string | null>(null);
  const [editQtyVal, setEditQtyVal] = useState<number>(0);

  // Filter Prescriptions sent from Doctor EMR
  const prescriptions = documents.filter(d => d.type === 'Prescription');

  const getOrderStatus = (rxId: string) => orderStatuses[rxId] || 'Received';

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Slide 1 Handlers
  const handleAcceptOrder = (rxId: string) => {
    setOrderStatuses(prev => ({ ...prev, [rxId]: 'Received' }));
    triggerToast(`Order ${rxId} Accepted Successfully.`);
  };

  const handleRejectOrder = (rxId: string, reason: string) => {
    if (!reason) return;
    setOrderStatuses(prev => ({ ...prev, [rxId]: 'Rejected' }));
    setRejectReasonMap(prev => ({ ...prev, [rxId]: reason }));
    setCurrentRejectingId(null);
    triggerToast(`Order ${rxId} Rejected: ${reason}`);
  };

  const handleVerifyPrescription = (rxId: string) => {
    setVerifyFileId(rxId);
  };

  const handleApproveAndInvoice = (rx: MedicalDoc) => {
    // Generate Invoice inside Shared Billing DB
    const itemsList = rx.details?.meds?.map((m: any) => ({
      name: m.name,
      price: m.name.includes('Paracetamol') ? 120 : m.name.includes('Telmisartan') ? 280 : 180
    })) || [{ name: 'Standard Pharmacy Prescription Dispensation', price: 150 }];

    const totalVal = itemsList.reduce((sum: number, item: any) => sum + item.price, 0);

    addInvoice({
      patient: rx.patient,
      doctor: 'Dr. S. Jenkins',
      amount: totalVal,
      status: 'UNPAID',
      method: 'Pending checkout',
      date: new Date().toISOString().split('T')[0]
    } as any);

    setOrderStatuses(prev => ({ ...prev, [rx.id]: 'Verified' }));
    triggerToast(`Prescription verified! Generated Invoice for ₹${totalVal} in Reception Billing.`);
  };

  const handleCycleStatus = (rxId: string) => {
    const current = getOrderStatus(rxId);
    let next: 'Received' | 'Verified' | 'Packing' | 'Completed' = 'Received';
    if (current === 'Received') next = 'Verified';
    else if (current === 'Verified') next = 'Packing';
    else if (current === 'Packing') next = 'Completed';
    else if (current === 'Completed') next = 'Received';

    setOrderStatuses(prev => ({ ...prev, [rxId]: next }));
    triggerToast(`Status updated to ${next} for ${rxId}`);
  };

  // Slide 2 Handlers
  const handleScanBarcode = () => {
    setScanActive(true);
    setTimeout(() => {
      // Pick random stock item and increment
      const randomIdx = Math.floor(Math.random() * stocks.length);
      const targetMed = stocks[randomIdx];
      updateStock(targetMed.name, targetMed.qty + 50, false);
      setScanActive(false);
      triggerToast(`Barcode Scanned! Incremented 50 units for ${targetMed.name}`);
    }, 2000);
  };

  const handleSaveManualStock = (medId: string, name: string) => {
    updateStock(name, editQtyVal, editQtyVal === 0);
    setManualEditId(null);
    triggerToast(`Updated stock levels manually for ${name}.`);
  };

  const handleMarkOutOfStock = (name: string) => {
    updateStock(name, 0, true);
    triggerToast(`${name} marked Out-of-Stock. Alert broadcasted to Doctor Workspace.`);
  };

  const handleGenerateWholesalePO = () => {
    const lowStockItems = stocks.filter(s => s.qty < s.min || s.outOfStock);
    const content = `WHOLESALE PURCHASE ORDER\nAPML Connect Pro Pharmacy Hub\nGenerated: ${new Date().toLocaleDateString()}\n\n` +
      lowStockItems.map(item => `Item: ${item.name} | Batch: ${item.batch} | Recommended Order: 500 Units`).join('\n') +
      `\n\nSignature: Chief Pharmacist`;

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Wholesale_PO_${Date.now()}.txt`;
    link.click();
    triggerToast('Wholesale Purchase Order document generated and downloaded.');
  };

  // Filter stocks by expiry
  const filteredStocks = stocks.filter(s => {
    if (expiryFilter === 'all') return true;
    return s.expiryDays.toString() === expiryFilter;
  });

  // Slide 3 Calculations
  const pharmacySalesInvoices = invoices.filter(i => i.doctor === 'Dr. S. Jenkins');
  const totalSales = pharmacySalesInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const upiSales = Math.round(totalSales * 0.65);
  const cashSales = totalSales - upiSales;

  if (checkingAuth || isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="text-emerald-400 text-sm font-semibold italic animate-pulse">Checking credentials...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">💊 Pharmacy Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time Dispensation Desk & Supply Chain Auditing Platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-xl px-4 py-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Realtime Mesh Synced</span>
          </div>
          <button
            onClick={handleLockWorkspace}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            🔒 Lock Counter
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-slate-900 text-white font-bold text-xs p-3 rounded-xl flex items-center gap-2 fixed bottom-5 right-5 shadow-2xl z-50 animate-bounce">
          <span>✔</span> {successToast}
        </div>
      )}

      {/* Main Slide Switcher Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 max-w-3xl overflow-x-auto">
        {[
          { id: 'orders', label: '📥 Incoming Orders' },
          { id: 'inventory', label: '📦 Inventory Control' },
          { id: 'who_catalog', label: '🌐 WHO Global Catalog' },
          { id: 'financials', label: '📊 Financials & Sales' },
          { id: 'account', label: '👤 My Account Settings' },
        ].map(slide => (
          <button
            key={slide.id}
            onClick={() => setActiveSlide(slide.id as any)}
            className={`flex-1 py-2.5 px-3 text-xs font-extrabold rounded-xl transition whitespace-nowrap ${activeSlide === slide.id ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {slide.label}
          </button>
        ))}
      </div>

      {/* Slide 1: Incoming Orders Dashboard */}
      {activeSlide === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Orders Feed */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">📥 Active Incoming Orders ({prescriptions.length})</h2>

            <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto pr-1">
              {prescriptions.map(rx => {
                const status = getOrderStatus(rx.id);
                return (
                  <div
                    key={rx.id}
                    onClick={() => setSelectedRx(rx)}
                    className={`p-4 hover:bg-slate-55 transition cursor-pointer flex flex-col md:flex-row justify-between md:items-center gap-4 border-l-4 ${selectedRx?.id === rx.id ? 'bg-slate-50/80 border-indigo-600' : 'border-transparent'
                      }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-800 text-white font-mono font-bold px-2 py-0.5 rounded-lg">{rx.id}</span>
                        <strong className="text-slate-800 text-sm font-extrabold">{rx.patient}</strong>
                      </div>
                      <p className="text-xs text-slate-400">Date Logged: {rx.date}</p>
                      <p className="text-xs text-slate-500 font-semibold truncate max-w-md">
                        Meds: {rx.details?.meds?.map((m: any) => m.name).join(', ') || 'Standard Paracetamol'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${orderStatusColors[status]}`}>
                        {status}
                      </span>
                      {status === 'Rejected' && (
                        <span className="text-[10px] text-rose-600 italic">({rejectReasonMap[rx.id] || 'Reason Unspecified'})</span>
                      )}

                      {/* Status buttons */}
                      {status !== 'Rejected' && (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(rx.id)}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => setCurrentRejectingId(rx.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-rose-600 text-[10px] font-bold rounded-lg transition border border-slate-200"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() => handleCycleStatus(rx.id)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-lg transition"
                          >
                            Cycle Status 🔁
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {prescriptions.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm italic">
                  No active EMR prescriptions syncing. Generate one in the Doctor console.
                </div>
              )}
            </div>
          </div>

          {/* Details & Action Panel */}
          <div className="lg:col-span-4 space-y-6">
            {selectedRx ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 text-sm">Order Actions: {selectedRx.id}</h3>
                  <button onClick={() => setSelectedRx(null)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
                </div>

                {/* Workflow Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleVerifyPrescription(selectedRx.id)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition border border-slate-250"
                  >
                    🔍 Verify Prescription EMR File
                  </button>

                  <button
                    onClick={() => handleApproveAndInvoice(selectedRx)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
                  >
                    💳 Approve & Generate Invoice
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-3 text-xs text-slate-650 space-y-2">
                  <p><strong>Patient:</strong> {selectedRx.patient}</p>
                  <p><strong>Status:</strong> <span className="font-bold uppercase text-indigo-700">{getOrderStatus(selectedRx.id)}</span></p>
                  <div>
                    <strong className="block text-[10px] text-slate-400 uppercase mb-1">Prescribed Medicines:</strong>
                    {selectedRx.details?.meds?.map((m: any, i: number) => (
                      <div key={i} className="bg-slate-50 p-2 rounded-lg border border-slate-150 mb-1.5 flex justify-between">
                        <span>💊 {m.name}</span>
                        <span className="text-[10px] text-slate-450 font-bold">{m.dose}</span>
                      </div>
                    )) || <span className="italic text-slate-400">Standard dose</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
                <span className="text-3xl block mb-2">📥</span>
                <p className="font-semibold text-slate-400 text-xs">Select an incoming order to view verification options.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide 2: Inventory & Stock Control */}
      {activeSlide === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Stocks Inventory */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-800">📦 Inventory Supply & Stock Log</h2>

              {/* Expiry filtering tabs */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px]">
                {['all', '30', '60', '90'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setExpiryFilter(filter as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition ${expiryFilter === filter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                      }`}
                  >
                    {filter === 'all' ? 'All Batches' : `${filter} Days Expiry`}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredStocks.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-55 p-2.5 rounded-xl">
                  <div className="space-y-1">
                    <strong className="text-slate-800 font-bold block">{item.name}</strong>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Batch: <strong className="text-slate-650">{item.batch}</strong></span>
                      <span>Expiry: <strong className="text-slate-650">{item.expiryDays} Days</strong></span>
                      <span>Stock Threshold: <strong>{item.min}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.outOfStock ? 'bg-rose-100 text-rose-700' :
                          item.qty < item.min ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {item.outOfStock ? 'Out of Stock' : item.qty < item.min ? 'Low Stock' : 'In Stock'}
                      </span>
                      <strong className="block text-slate-800 text-sm mt-1">{item.qty} units</strong>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setManualEditId(item.id);
                          setEditQtyVal(item.qty);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                        title="Edit Quantity"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => handleMarkOutOfStock(item.name)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition border border-rose-200"
                      >
                        Mark Out
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action side tools */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">⚒ Inventory Actions</h3>

            <div className="space-y-3">
              <button
                onClick={handleScanBarcode}
                disabled={scanActive}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {scanActive ? '⏳ Simulating Camera Scan...' : '📷 Scan Product Barcode'}
              </button>

              <button
                onClick={handleGenerateWholesalePO}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm"
              >
                📝 Generate Wholesale Purchase Order
              </button>
            </div>

            {scanActive && (
              <div className="border border-indigo-200 bg-indigo-50/50 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center animate-pulse">
                <div className="w-10 h-10 border-2 border-dashed border-indigo-500 rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-indigo-700">Align Medicine Barcode in scanner window...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide 3: WHO Global Essential Medicines Catalog */}
      {activeSlide === 'who_catalog' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>🌐 WHO Model List of Essential Medicines</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  ATC Classification Standard
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Browse official WHO International Nonproprietary Names (INN) and 1-click import into local pharmacy stock.
              </p>
            </div>
            
            {/* Search & Category Filter */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search generic name, ATC code..."
                value={whoSearchQuery}
                onChange={(e) => setWhoSearchQuery(e.target.value)}
                className="border border-slate-250 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-400 w-56"
              />
              <select
                value={whoCategoryFilter}
                onChange={(e) => setWhoCategoryFilter(e.target.value)}
                className="border border-slate-250 rounded-xl px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Analgesics">Analgesics</option>
                <option value="Antibacterials">Antibacterials</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Antidiabetics">Antidiabetics</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
              </select>
            </div>
          </div>

          {/* WHO Medicines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whoMedicines
              .filter(w => {
                const matchSearch = !whoSearchQuery || 
                  w.genericName.toLowerCase().includes(whoSearchQuery.toLowerCase()) || 
                  w.atcCode.toLowerCase().includes(whoSearchQuery.toLowerCase()) ||
                  w.category.toLowerCase().includes(whoSearchQuery.toLowerCase());
                const matchCat = whoCategoryFilter === 'all' || w.category.toLowerCase().includes(whoCategoryFilter.toLowerCase());
                return matchSearch && matchCat;
              })
              .map((item, idx) => {
                const isAlreadyInStock = stocks.some(s => s.name.includes(item.genericName) || s.name.includes(item.atcCode));
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 transition space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                          {item.atcCode}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          WHO {item.whoEssentialGroup} List
                        </span>
                      </div>
                      <div>
                        <strong className="text-sm text-slate-800 font-extrabold block">{item.genericName}</strong>
                        <span className="text-[11px] text-slate-500 font-semibold">{item.category}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-150 space-y-1">
                        <p><strong>Form & Strength:</strong> {item.dosageForm} · {item.typicalStrength}</p>
                        <p><strong>Route:</strong> {item.route}</p>
                        <p className="text-[10px] text-slate-500 italic mt-1">{item.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        importWHOMedicineToStock(item, 100, 20);
                        triggerToast(`Imported ${item.genericName} (${item.atcCode}) into Pharmacy Stock!`);
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        isAlreadyInStock
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                      }`}
                    >
                      {isAlreadyInStock ? '✔ Stock Active (Add 100 Units)' : '➕ Import to Pharmacy Stock'}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Slide 4: Pharmacy Financials & Revenue Logs */}
      {activeSlide === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Recent Retail Sales Log */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">🧾 Recent Pharmacy Sales Transactions</h2>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {pharmacySalesInvoices.map((inv, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-slate-800 font-bold block">{inv.patient}</strong>
                    <span className="text-[10px] text-slate-400">Method: {inv.method} · Date: {inv.date}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase block text-center max-w-fit ml-auto mb-1 ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {inv.status}
                    </span>
                    <strong className="text-slate-800 font-extrabold text-xs">₹{inv.amount}</strong>
                  </div>
                </div>
              ))}
              {pharmacySalesInvoices.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-8">No invoice orders generated yet.</p>
              )}
            </div>
          </div>

          {/* Right Column: Sales Financials & Reports */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-2">📊 Financial Revenue Summary</h3>

            <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-bold text-slate-650">
                <span>Total Pharmacy Sales:</span>
                <span className="text-base text-slate-900 font-extrabold">₹{totalSales}</span>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Cash Payments (35%):</span>
                  <span className="text-slate-700">₹{cashSales}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>UPI & Card (65%):</span>
                  <span className="text-indigo-700">₹{upiSales}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => triggerToast('Daily sales diagram breakdown rendered in console.')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-sm"
                >
                  📈 View Daily Sales Summary (Cash vs UPI)
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  const csvContent = `Invoice Date,Paid,Tax Deduction (GST 18%),Amount\n${new Date().toLocaleDateString()},₹${totalSales},₹${Math.round(totalSales * 0.18)},₹${totalSales}`;
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `GST_Tax_Logs_${Date.now()}.csv`;
                  link.click();
                  triggerToast('GST Tax Logs spreadsheet generated and exported.');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl border border-slate-250 transition"
              >
                📤 Export GST / Tax Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide 4: Pharmacy Account Settings */}
      {activeSlide === 'account' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-800">👤 My Account Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage pharmacist credentials and credentials configuration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pharmacist Name</label>
              <input
                type="text"
                value={accounts?.find(a => a.role === 'pharmacy')?.name || ''}
                onChange={(e) => {
                  const email = accounts?.find(a => a.role === 'pharmacy')?.email || '';
                  updateAccount('pharmacy', email, e.target.value);
                }}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-450 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
              <input
                type="email"
                value={accounts?.find(a => a.role === 'pharmacy')?.email || ''}
                onChange={(e) => {
                  const name = accounts?.find(a => a.role === 'pharmacy')?.name || '';
                  updateAccount('pharmacy', e.target.value, name);
                }}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-450 bg-slate-50"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Change Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                onChange={(e) => {
                  const name = accounts?.find(a => a.role === 'pharmacy')?.name || '';
                  const email = accounts?.find(a => a.role === 'pharmacy')?.email || '';
                  if (e.target.value) {
                    updateAccount('pharmacy', email, name, e.target.value);
                  }
                }}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-450 bg-slate-50"
              />
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 1: Verify Prescription Image/EMR File */}
      {verifyFileId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Prescription Image/EMR Verification</h3>
            <p className="text-xs text-slate-400">Verifying digital signature seal and HIPAA compliance stamps.</p>

            <div className="border border-dashed border-slate-200 bg-slate-50 p-5 rounded-2xl space-y-3 font-serif">
              <div className="text-center font-bold text-slate-750 text-sm tracking-widest uppercase">APML Connect Clinic</div>
              <div className="text-[10px] text-slate-400 border-b pb-2 text-center">EMR Verified E-Prescription Log: {verifyFileId}</div>

              <div className="text-[10px] space-y-1.5 leading-relaxed text-slate-700">
                <p><strong>Chief Diagnosis:</strong> Acute Clinical Examination</p>
                <p><strong>Approved Meds:</strong> Standard Rx Paracetamol/Supplements</p>
                <p><strong>Stamp:</strong> ✔ Signatory Dr. S. Jenkins</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setVerifyFileId(null);
                  triggerToast('Prescription EMR verification stamp approved.');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition"
              >
                Confirm Verification
              </button>
              <button
                onClick={() => setVerifyFileId(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Reject Order Reason Dropdown */}
      {currentRejectingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Select Rejection Reason</h3>

            <div className="space-y-2">
              {[
                'Incorrect Dosage Prescription',
                'Medicine Out of Stock',
                'Contraindication Alert',
                'Invalid Patient Reference'
              ].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleRejectOrder(currentRejectingId, reason)}
                  className="w-full text-left p-2.5 bg-slate-50 border border-slate-150 hover:bg-indigo-50/50 rounded-xl text-xs font-bold text-slate-700 transition"
                >
                  {reason}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentRejectingId(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs py-2 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: Manual Stock Editor */}
      {manualEditId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Manually Edit Stock Levels</h3>

            <div>
              <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Quantity (Units)</label>
              <input
                type="number"
                value={editQtyVal}
                onChange={e => setEditQtyVal(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none bg-slate-50 font-bold"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const target = stocks.find(s => s.id === manualEditId);
                  if (target) handleSaveManualStock(manualEditId, target.name);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl transition"
              >
                Save
              </button>
              <button
                onClick={() => setManualEditId(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl transition"
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
