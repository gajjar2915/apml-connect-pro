'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(formData.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (strength < 3) {
      setError('Please choose a stronger password');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1200));
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push('/login'), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">✚</div>
            <span className="text-xl font-extrabold text-white">APML Connect <span className="text-emerald-400">Pro</span></span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {!done ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🛡️</div>
                <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
                <p className="text-slate-400 text-sm">Create a new secure password for your account</p>
              </div>

              {error && (
                <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm px-4 py-3 rounded-xl mb-4">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="Enter new password"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${strength >= i ? strengthColors[strength] : 'bg-white/20'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">Password strength: <span className={`font-semibold ${strength >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>{strengthLabels[strength]}</span></p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    placeholder="Repeat new password"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-rose-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-300 text-xs font-semibold mb-1">Password requirements:</p>
                  <ul className="text-slate-400 text-xs space-y-0.5">
                    {[
                      { label: 'At least 8 characters', met: formData.password.length >= 8 },
                      { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
                      { label: 'One number', met: /[0-9]/.test(formData.password) },
                      { label: 'One special character', met: /[^A-Za-z0-9]/.test(formData.password) },
                    ].map(r => (
                      <li key={r.label} className="flex items-center gap-2">
                        <span>{r.met ? '✅' : '⭕'}</span> {r.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  id="reset-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                  ) : '🔐 Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse">✅</div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-slate-400 text-sm mb-4">Your password has been updated successfully. Redirecting to login...</p>
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm">
                Go to Login →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
