'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
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
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔑</div>
                <h1 className="text-2xl font-bold text-white mb-1">Forgot Password?</h1>
                <p className="text-slate-400 text-sm">Enter your email and we'll send a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Registered Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="receptionist@clinic.com"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : '📧 Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✉️</div>
              <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-slate-400 text-sm mb-4">
                We sent a password reset link to <span className="text-emerald-400 font-semibold">{email}</span>
              </p>
              <p className="text-slate-500 text-xs mb-6">Didn't receive? Check your spam folder or</p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition"
              >
                Try another email →
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/login" className="text-slate-400 hover:text-white text-sm transition">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
