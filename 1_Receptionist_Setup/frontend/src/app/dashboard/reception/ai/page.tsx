'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'ai'; content: string; time: string };

const aiResponses: Record<string, string> = {
  default: "I'm your AI Receptionist Assistant. I can help you with appointment scheduling, patient queries, billing insights, and workflow optimization. What would you like to know?",
  appointments: "Based on today's data, I recommend:\n\n📅 **Schedule Optimization:**\n• Dr. Sharma has a 45-min gap at 11:30 AM — consider filling with a walk-in\n• 3 patients are 10+ minutes late for their 10 AM slots\n• Follow-up suggestions for 5 patients due this week\n\nWould you like me to send reminder messages?",
  revenue: "📊 **Revenue Insights for June 2026:**\n\n• Today's collection: ₹48,500 (12% above target)\n• 7 pending invoices totaling ₹12,200\n• Dr. Gupta generates highest revenue (₹23,000/week)\n• Recommend Razorpay for faster collection on pending invoices\n\nShould I generate a detailed report?",
  noshow: "🚫 **No-Show Prediction:**\n\nHigh risk patients for today:\n• Anita Joshi (10:45 AM) — 3 prior no-shows, no confirmation received\n• Mohan Singh (11:00 AM) — appointment booked 2 weeks ago\n\n**Recommended actions:**\n1. Send WhatsApp reminder to Anita\n2. Call Mohan to confirm\n3. Keep walk-in slots ready",
  workflow: "⚡ **Workflow Optimization Suggestions:**\n\n1. **Queue bottleneck detected** at Dr. Mehta's counter — average wait 22 min\n2. **Pre-registration forms** could reduce check-in time by 40%\n3. **Batch lab reports** for 3 patients ready — notify simultaneously\n4. **Insurance verification** pending for 2 patients before billing\n\nWant me to implement any of these?",
};

const quickPrompts = [
  { icon: '📅', label: 'Appointment suggestions', key: 'appointments' },
  { icon: '💰', label: 'Revenue insights', key: 'revenue' },
  { icon: '🚫', label: 'No-show prediction', key: 'noshow' },
  { icon: '⚡', label: 'Workflow optimization', key: 'workflow' },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: aiResponses.default, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 1200));

    const key = Object.keys(aiResponses).find(k => text.toLowerCase().includes(k)) || 'default';
    const aiMsg: Message = { role: 'ai', content: aiResponses[key], time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(m => [...m, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">AI Receptionist Assistant</h1>
        <p className="text-slate-500 text-sm mt-1">Powered by GPT-4o · Appointment scheduling, insights & workflow optimization</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-5 min-h-0">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">AI Capabilities</p>
            <div className="space-y-2">
              {[
                { icon: '📅', label: 'Smart Scheduling' },
                { icon: '🔮', label: 'No-Show Prediction' },
                { icon: '💰', label: 'Revenue Insights' },
                { icon: '⚡', label: 'Workflow Optimizer' },
                { icon: '👥', label: 'Patient Prioritization' },
                { icon: '📊', label: 'Report Summaries' },
                { icon: '💊', label: 'Med Reminders' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
                  <span>{f.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Today's AI Insights</p>
            <div className="space-y-3">
              {[
                { icon: '⚠️', text: '2 high no-show risk patients today', urgent: true },
                { icon: '💡', text: 'Revenue 12% above target', urgent: false },
                { icon: '⏰', text: 'Queue backlog at Dr. Mehta (22 min avg wait)', urgent: true },
              ].map((ins, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${ins.urgent ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-100'}`}>
                  <span className="text-sm">{ins.icon}</span>
                  <p className="text-xs text-slate-700">{ins.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-xl">🤖</div>
            <div>
              <p className="font-bold text-slate-800">APML Connect AI</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-xs text-emerald-600 font-semibold">Online · GPT-4o</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '55vh' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${msg.role === 'ai' ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 'bg-slate-800 text-white'
                  }`}>
                  {msg.role === 'ai' ? '🤖' : 'SJ'}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'ai' ? 'bg-slate-50 text-slate-800 rounded-tl-sm' : 'bg-emerald-500 text-white rounded-tr-sm'
                    }`}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-slate-400 px-1">{msg.time}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-sm">🤖</div>
                <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 flex gap-2 flex-wrap border-t border-slate-50 pt-3">
            {quickPrompts.map(q => (
              <button key={q.key} id={`ai-prompt-${q.key}`}
                onClick={() => sendMessage(q.label)}
                className="text-xs font-bold px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full transition border border-emerald-100">
                {q.icon} {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <input
                id="ai-chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask anything about appointments, revenue, patients..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
              <button id="ai-send" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl flex items-center justify-center transition text-xl">
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
