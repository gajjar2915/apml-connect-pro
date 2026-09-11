'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    clinicName: '', clinicCode: '', designation: '',
    agreeTerms: false, enableTwoFactor: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName) e.firstName = 'First name is required';
    if (!formData.lastName) e.lastName = 'Last name is required';
    if (!formData.email.includes('@')) e.email = 'Valid email required';
    if (formData.phone.length < 10) e.phone = 'Valid phone required';
    if (formData.password.length < 8) e.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validate()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      router.push('/verify-email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30">✚</div>
            <span className="text-xl font-extrabold text-white">APML Connect <span className="text-emerald-400">Pro</span></span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? 'bg-emerald-500 text-white' : 'bg-white/20 text-slate-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-white/20'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Personal Information</h1>
              <p className="text-slate-400 text-sm mb-6">Create your receptionist account</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">First Name</label>
                    <input id="reg-firstname" type="text" value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Sarah" className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                    {errors.firstName && <p className="text-rose-400 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Last Name</label>
                    <input id="reg-lastname" type="text" value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Jenkins" className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                    {errors.lastName && <p className="text-rose-400 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                  <input id="reg-email" type="email" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@clinic.com" className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Mobile Number</label>
                  <input id="reg-phone" type="tel" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9999999999" className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                  {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <input id="reg-password" type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 characters" className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                  <input id="reg-confirm-password" type="password" value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password" className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                  {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Clinic Details</h1>
              <p className="text-slate-400 text-sm mb-6">Link your account to a clinic</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Clinic / Hospital Name</label>
                  <input id="reg-clinic" type="text" value={formData.clinicName}
                    onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="Apollo Metro Clinic" className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Clinic Registration Code</label>
                  <input id="reg-clinic-code" type="text" value={formData.clinicCode}
                    onChange={e => setFormData({ ...formData, clinicCode: e.target.value })}
                    placeholder="CLINIC-XXXX (given by admin)" className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Designation</label>
                  <select id="reg-designation" value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition">
                    <option value="" className="bg-slate-800">Select designation</option>
                    <option value="front-desk" className="bg-slate-800">Front Desk Officer</option>
                    <option value="senior-receptionist" className="bg-slate-800">Senior Receptionist</option>
                    <option value="supervisor" className="bg-slate-800">Reception Supervisor</option>
                    <option value="billing" className="bg-slate-800">Billing Officer</option>
                  </select>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">Enable Two-Factor Auth</p>
                      <p className="text-slate-400 text-xs mt-0.5">Recommended for enhanced security</p>
                    </div>
                    <button
                      type="button"
                      id="toggle-2fa"
                      onClick={() => setFormData({ ...formData, enableTwoFactor: !formData.enableTwoFactor })}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${formData.enableTwoFactor ? 'bg-emerald-500' : 'bg-white/20'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${formData.enableTwoFactor ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-2xl font-bold text-white mb-1">Review & Confirm</h1>
              <p className="text-slate-400 text-sm mb-6">Verify your details before submitting</p>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'Name', value: `${formData.firstName} ${formData.lastName}` },
                  { label: 'Email', value: formData.email },
                  { label: 'Phone', value: formData.phone },
                  { label: 'Clinic', value: formData.clinicName || 'Not specified' },
                  { label: 'Role', value: formData.designation || 'Not specified' },
                  { label: '2FA', value: formData.enableTwoFactor ? '✅ Enabled' : '❌ Disabled' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-slate-400 text-sm">{item.label}</span>
                    <span className="text-white text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input type="checkbox" id="agree-terms" checked={formData.agreeTerms}
                  onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-white/30 bg-white/10 text-emerald-500" />
                <span className="text-slate-300 text-sm">
                  I agree to the{' '}
                  <Link href="/terms" className="text-emerald-400 underline">Terms of Service</Link> and{' '}
                  <Link href="/privacy" className="text-emerald-400 underline">Privacy Policy</Link>. I confirm this account will handle HIPAA-protected health information.
                </span>
              </label>

              <button type="submit" disabled={loading || !formData.agreeTerms} id="register-submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
                ) : '🚀 Create Receptionist Account'}
              </button>
            </form>
          )}

          {step < 3 && (
            <button type="button" id={`step-${step}-next`} onClick={handleNext}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
              Continue → Step {step + 1}
            </button>
          )}

          {step > 1 && (
            <button type="button" onClick={() => setStep((step - 1) as 1 | 2)}
              className="w-full mt-3 text-slate-400 hover:text-white text-sm font-semibold py-2 transition">
              ← Back
            </button>
          )}

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
