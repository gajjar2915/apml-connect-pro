'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMeshSync } from '../../../meshSync';

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Medical Info' },
  { id: 3, label: 'Emergency & Family' },
  { id: 4, label: 'Insurance' },
  { id: 5, label: 'Review' },
];

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatientProfile } = useMeshSync();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    // Personal
    firstName: '', lastName: '', dob: '', gender: 'Female', phone: '', email: '', address: '',
    city: '', state: '', pincode: '', aadhaar: '',
    // Medical
    bloodGroup: 'A+', weight: '', height: '', allergies: '', medicalHistory: '', currentMedications: '',
    // Emergency & Family
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    familyName: '', familyAge: '', familyGender: '', familyRelation: '', familyPhone: '',
    // Insurance
    hasInsurance: 'no', insuranceProvider: '', policyNumber: '', validFrom: '', validTo: '', coverageDetails: '',
    // Notes
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    addPatientProfile({
      name: `${form.firstName} ${form.lastName}`,
      age: 28,
      gender: form.gender,
      phone: form.phone || '9988110022',
      blood: form.bloodGroup,
      status: 'Active',
      lastVisit: new Date().toISOString().split('T')[0],
      insurance: form.hasInsurance === 'yes',
    });

    setLoading(false);
    router.push('/dashboard/reception/patients');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/reception/patients" className="p-2 rounded-xl hover:bg-slate-200 transition text-slate-600">←</Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Register New Patient</h1>
          <p className="text-slate-500 text-sm">Complete patient profile registration</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${step === s.id ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                step > s.id ? 'bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200' :
                  'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold ${step > s.id ? 'bg-emerald-500 text-white' : step === s.id ? 'bg-white text-emerald-600' : 'bg-slate-300 text-slate-500'
                }`}>
                {step > s.id ? '✓' : s.id}
              </span>
              {s.label}
            </button>
            {i < steps.length - 1 && <div className={`w-6 h-0.5 ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">👤 Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name *</label>
                <input id="p-firstname" type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                  placeholder="First name" required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name *</label>
                <input id="p-lastname" type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Last name" required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth *</label>
                <input id="p-dob" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender *</label>
                <select id="p-gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition">
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number *</label>
                <input id="p-phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX" required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input id="p-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="patient@email.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                <input id="p-address" type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                <input id="p-city" type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pincode</label>
                <input id="p-pincode" type="text" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })}
                  placeholder="600001"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Aadhaar Number (Encrypted)</label>
                <input id="p-aadhaar" type="text" value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })}
                  placeholder="XXXX XXXX XXXX" maxLength={14}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Medical Info */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">🩺 Medical Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group</label>
                <select id="p-blood" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition">
                  <option value="">Unknown</option>
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Weight (kg)</label>
                <input id="p-weight" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
                  placeholder="70"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Height (cm)</label>
                <input id="p-height" type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })}
                  placeholder="170"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Known Allergies</label>
                <input id="p-allergies" type="text" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })}
                  placeholder="e.g., Penicillin, Peanuts, Latex..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Medical History</label>
                <textarea id="p-medical-history" value={form.medicalHistory} onChange={e => setForm({ ...form, medicalHistory: e.target.value })}
                  placeholder="Previous conditions, surgeries, chronic illnesses..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Medications</label>
                <textarea id="p-medications" value={form.currentMedications} onChange={e => setForm({ ...form, currentMedications: e.target.value })}
                  placeholder="List current medications and dosage..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Emergency & Family */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">🆘 Emergency Contact</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Name *</label>
                  <input id="ec-name" type="text" value={form.emergencyName} onChange={e => setForm({ ...form, emergencyName: e.target.value })}
                    placeholder="Emergency contact name"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Relationship</label>
                  <select id="ec-relation" value={form.emergencyRelation} onChange={e => setForm({ ...form, emergencyRelation: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition">
                    <option value="">Select</option>
                    <option>Spouse</option><option>Parent</option><option>Sibling</option><option>Child</option><option>Friend</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                  <input id="ec-phone" type="tel" value={form.emergencyPhone} onChange={e => setForm({ ...form, emergencyPhone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">👨‍👩‍👧 Family Member (Optional)</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Family Member Name</label>
                  <input id="fm-name" type="text" value={form.familyName} onChange={e => setForm({ ...form, familyName: e.target.value })}
                    placeholder="Full name"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Relation</label>
                  <select id="fm-relation" value={form.familyRelation} onChange={e => setForm({ ...form, familyRelation: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition">
                    <option value="">Select</option>
                    <option>Spouse</option><option>Parent</option><option>Sibling</option><option>Child</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                  <input id="fm-age" type="number" value={form.familyAge} onChange={e => setForm({ ...form, familyAge: e.target.value })}
                    placeholder="Age"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input id="fm-phone" type="tel" value={form.familyPhone} onChange={e => setForm({ ...form, familyPhone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Insurance */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">🛡️ Insurance Information</h2>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Does patient have insurance?</label>
              <div className="flex gap-3">
                {['yes', 'no'].map(v => (
                  <button key={v} type="button" id={`insurance-${v}`}
                    onClick={() => setForm({ ...form, hasInsurance: v })}
                    className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition ${form.hasInsurance === v ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {v === 'yes' ? '✅ Yes' : '❌ No'}
                  </button>
                ))}
              </div>
            </div>

            {form.hasInsurance === 'yes' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Insurance Provider</label>
                  <select id="ins-provider" value={form.insuranceProvider} onChange={e => setForm({ ...form, insuranceProvider: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition">
                    <option value="">Select provider</option>
                    <option>Star Health Insurance</option>
                    <option>HDFC ERGO Health</option>
                    <option>ICICI Lombard</option>
                    <option>Bajaj Allianz Health</option>
                    <option>New India Assurance</option>
                    <option>LIC Health</option>
                    <option>Niva Bupa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Policy Number</label>
                  <input id="ins-policy" type="text" value={form.policyNumber} onChange={e => setForm({ ...form, policyNumber: e.target.value })}
                    placeholder="Policy number"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Valid From</label>
                  <input id="ins-from" type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Valid To</label>
                  <input id="ins-to" type="date" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Coverage Details</label>
                  <textarea id="ins-coverage" value={form.coverageDetails} onChange={e => setForm({ ...form, coverageDetails: e.target.value })}
                    placeholder="Coverage amount, inclusions, exclusions..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-800 pb-3 border-b border-slate-100">✅ Review & Register</h2>

            {/* Generated ID */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Generated Patient ID</p>
                <p className="text-2xl font-extrabold text-emerald-700 font-mono">MRN-{Date.now().toString().slice(-6)}</p>
              </div>
              <button className="text-xs font-bold text-emerald-600 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">
                🖨️ Print Card
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Name', value: `${form.firstName} ${form.lastName}` || 'Not set' },
                { label: 'DOB', value: form.dob || 'Not set' },
                { label: 'Gender', value: form.gender || 'Not set' },
                { label: 'Phone', value: form.phone || 'Not set' },
                { label: 'Blood Group', value: form.bloodGroup || 'Unknown' },
                { label: 'Insurance', value: form.hasInsurance === 'yes' ? `${form.insuranceProvider} — ${form.policyNumber}` : 'None' },
                { label: 'Emergency Contact', value: form.emergencyName ? `${form.emergencyName} (${form.emergencyRelation})` : 'Not set' },
                { label: 'Allergies', value: form.allergies || 'None mentioned' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Receptionist Notes</label>
              <textarea id="p-notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional notes from receptionist..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none" />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-700 font-semibold">⚠️ HIPAA Notice: Patient data will be encrypted at rest and in transit. Only authorized staff can access this record.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                id="submit-patient"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering Patient...</>
                ) : '✅ Register Patient & Generate ID'}
              </button>
            </form>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>
          {step < 5 && (
            <button
              type="button"
              id={`next-step-${step}`}
              onClick={() => setStep(step + 1 as typeof step)}
              className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
