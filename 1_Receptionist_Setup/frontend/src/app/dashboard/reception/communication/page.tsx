'use client';

import { useState } from 'react';

const templates = [
  { id: 'T001', name: 'Appointment Confirmation', channel: 'WhatsApp', preview: 'Dear {name}, your appointment with {doctor} is confirmed for {date} at {time}. Token: {token}. Apollo Metro Clinic.' },
  { id: 'T002', name: 'Appointment Reminder', channel: 'SMS', preview: 'Reminder: Your appointment with {doctor} is tomorrow at {time}. Please arrive 10 min early. Reply CANCEL to cancel.' },
  { id: 'T003', name: 'Payment Reminder', channel: 'Email', preview: 'Dear {name}, invoice {invoice_id} of ₹{amount} is due. Pay online at apml-connect.app or visit the clinic.' },
  { id: 'T004', name: 'Lab Report Ready', channel: 'WhatsApp', preview: 'Your lab report is ready. View it here: {report_link}. For queries, call 1800-XXX-XXXX.' },
  { id: 'T005', name: 'Follow-Up Reminder', channel: 'SMS', preview: 'Hi {name}, time for your follow-up with {doctor}. Book now: {booking_link}' },
];

const channelColors: Record<string, string> = {
  WhatsApp: 'bg-green-100 text-green-700',
  SMS: 'bg-blue-100 text-blue-700',
  Email: 'bg-violet-100 text-violet-700',
};

const channelIcons: Record<string, string> = {
  WhatsApp: '💬',
  SMS: '📱',
  Email: '📧',
};

export default function CommunicationPage() {
  const [activeChannel, setActiveChannel] = useState<'WhatsApp' | 'SMS' | 'Email' | 'Broadcast'>('WhatsApp');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [composing, setComposing] = useState({ to: '', message: '', subject: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Communication Module</h1>
        <p className="text-slate-500 text-sm mt-1">WhatsApp · SMS · Email notifications & broadcast messaging</p>
      </div>

      {/* Channel selector */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { id: 'WhatsApp', label: 'WhatsApp', icon: '💬', color: 'emerald', sent: 234 },
          { id: 'SMS', label: 'SMS', icon: '📱', color: 'blue', sent: 89 },
          { id: 'Email', label: 'Email', icon: '📧', color: 'violet', sent: 156 },
          { id: 'Broadcast', label: 'Broadcast All', icon: '📢', color: 'amber', sent: 12 },
        ].map(ch => (
          <button key={ch.id} id={`channel-${ch.id}`}
            onClick={() => setActiveChannel(ch.id as typeof activeChannel)}
            className={`p-4 rounded-2xl border-2 text-left transition ${activeChannel === ch.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <span className="text-3xl">{ch.icon}</span>
            <p className="font-bold text-slate-800 mt-2">{ch.label}</p>
            <p className="text-xs text-slate-400">{ch.sent} sent today</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Compose panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Templates */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h2 className="font-bold text-slate-800 mb-3">📋 Message Templates</h2>
            <div className="space-y-2">
              {templates.filter(t => activeChannel === 'Broadcast' || t.channel === activeChannel).map(t => (
                <button key={t.id} id={`template-${t.id}`}
                  onClick={() => { setSelectedTemplate(t); setComposing({ ...composing, message: t.preview }); }}
                  className={`w-full text-left p-3 rounded-xl border transition hover:shadow-sm ${selectedTemplate?.id === t.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800">{t.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${channelColors[t.channel]}`}>
                      {channelIcons[t.channel]} {t.channel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{t.preview}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Compose */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h2 className="font-bold text-slate-800 mb-4">✉️ Compose Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {activeChannel === 'Broadcast' ? 'Send To' : 'Recipient'}
                </label>
                <input id="msg-to" type="text" value={composing.to}
                  onChange={e => setComposing({ ...composing, to: e.target.value })}
                  placeholder={activeChannel === 'Broadcast' ? 'All patients / specific group' : activeChannel === 'Email' ? 'patient@email.com' : '+91 XXXXX XXXXX'}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
              </div>

              {activeChannel === 'Email' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                  <input id="msg-subject" type="text" value={composing.subject}
                    onChange={e => setComposing({ ...composing, subject: e.target.value })}
                    placeholder="Email subject..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                <textarea id="msg-body" value={composing.message}
                  onChange={e => setComposing({ ...composing, message: e.target.value })}
                  placeholder={`Type your ${activeChannel} message here...`}
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none" />
                <p className="text-xs text-slate-400 mt-1">{composing.message.length} / 1000 characters</p>
              </div>

              {sent && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-emerald-700 font-semibold text-sm">Message sent successfully!</p>
                </div>
              )}

              <div className="flex gap-3">
                <button id="send-message" onClick={handleSend} disabled={sending || !composing.message}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                  {sending ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : `${channelIcons[activeChannel] || '📤'} Send ${activeChannel} Message`}
                </button>
                <button id="schedule-message" className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">
                  ⏰ Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Recent messages */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-3">📬 Recent Messages</h3>
            <div className="space-y-3">
              {[
                { to: 'Ravi Kumar', channel: 'WhatsApp', msg: 'Appointment confirmed for 2 PM', time: '5m ago', status: 'Delivered' },
                { to: 'All Patients', channel: 'SMS', msg: 'Holiday announcement: Clinic closed...', time: '1h ago', status: 'Sent' },
                { to: 'Priya Nair', channel: 'Email', msg: 'Lab report ready — please download', time: '2h ago', status: 'Opened' },
              ].map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-lg">{channelIcons[m.channel]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{m.to}</p>
                    <p className="text-xs text-slate-500 truncate">{m.msg}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.time} · {m.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-3">📊 Today's Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'WhatsApp Sent', value: 234, icon: '💬', color: 'bg-green-500' },
                { label: 'SMS Sent', value: 89, icon: '📱', color: 'bg-blue-500' },
                { label: 'Emails Sent', value: 156, icon: '📧', color: 'bg-violet-500' },
                { label: 'Delivery Rate', value: '97.2%', icon: '✅', color: 'bg-emerald-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>{s.label}</span>
                      <span>{s.value}</span>
                    </div>
                    {typeof s.value === 'number' && (
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full`} style={{ width: `${Math.min((s.value / 250) * 100, 100)}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
