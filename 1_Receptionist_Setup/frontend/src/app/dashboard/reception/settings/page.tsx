'use client';

import { useState } from 'react';
import { useMeshSync } from '../../meshSync';

export default function SettingsPage() {
  const { settings, updateClinicSettings, accounts, updateAccount } = useMeshSync();
  const [activeSection, setActiveSection] = useState('clinic');
  const [saved, setSaved] = useState(false);
  const [clinicSettings, setClinicSettings] = useState({
    name: 'Apollo Metro Clinic',
    phone: settings.clinicPhone || '+91 9988221100',
    email: 'apollo.metro@clinic.com',
    address: settings.clinicAddress || '12, Green Park Avenue, Metro Hub',
    workStartTime: '08:00', workEndTime: '20:00',
    slotDuration: '15', maxPatientsPerSlot: '3', breakStart: '13:00', breakEnd: '14:00',
    gstNumber: '27ABCDE1234F1Z5', gstRate: '18',
    whatsappEnabled: settings.notificationsEnabled,
    smsEnabled: settings.smsTemplatesEnabled,
    emailEnabled: true,
    reminderHours: '24', enableTwoFactor: true, allowOAuth: true,
  });

  const handleSave = async () => {
    updateClinicSettings({
      notificationsEnabled: clinicSettings.whatsappEnabled,
      smsTemplatesEnabled: clinicSettings.smsEnabled,
      clinicAddress: clinicSettings.address,
      clinicPhone: clinicSettings.phone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: 'clinic', icon: '🏥', label: 'Clinic Settings' },
    { id: 'working-hours', icon: '⏰', label: 'Working Hours' },
    { id: 'billing', icon: '💳', label: 'Billing Settings' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'security', icon: '🔒', label: 'Security' },
    { id: 'users', icon: '👥', label: 'User Management' },
    { id: 'devices', icon: '📱', label: 'Device Management' },
    { id: 'activity', icon: '📋', label: 'Activity Logs' },
    { id: 'branding', icon: '🎨', label: 'Branding' },
    { id: 'profile', icon: '👤', label: 'My Account Settings' },
  ];

  const devices = [
    { id: 'D001', name: 'Chrome — Windows 11', location: 'Mumbai, India', lastActive: '2 min ago', current: true },
    { id: 'D002', name: 'Safari — iPhone 14', location: 'Mumbai, India', lastActive: '3 hours ago', current: false },
    { id: 'D003', name: 'Chrome — MacBook Pro', location: 'Pune, India', lastActive: '2 days ago', current: false },
  ];

  const activityLogs = [
    { action: 'Logged in', ip: '103.1.2.3', time: '10:02 AM today', icon: '🔐' },
    { action: 'Registered patient Ravi Kumar', ip: '103.1.2.3', time: '10:15 AM today', icon: '👤' },
    { action: 'Created invoice INV-001234', ip: '103.1.2.3', time: '10:45 AM today', icon: '💳' },
    { action: 'Sent WhatsApp to 45 patients', ip: '103.1.2.3', time: '11:00 AM today', icon: '💬' },
    { action: 'Updated clinic working hours', ip: '103.1.2.3', time: '11:30 AM today', icon: '⚙️' },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic configuration, security, and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-0.5">
            {sections.map(s => (
              <button key={s.id} id={`settings-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition ${activeSection === s.id ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-5">
          {activeSection === 'profile' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">👤 My Account Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={accounts?.find(a => a.role === 'receptionist')?.name || ''}
                    onChange={(e) => {
                      const email = accounts?.find(a => a.role === 'receptionist')?.email || '';
                      updateAccount('receptionist', email, e.target.value);
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={accounts?.find(a => a.role === 'receptionist')?.email || ''}
                    onChange={(e) => {
                      const name = accounts?.find(a => a.role === 'receptionist')?.name || '';
                      updateAccount('receptionist', e.target.value, name);
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Change Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    onChange={(e) => {
                      const name = accounts?.find(a => a.role === 'receptionist')?.name || '';
                      const email = accounts?.find(a => a.role === 'receptionist')?.email || '';
                      if (e.target.value) {
                        updateAccount('receptionist', email, name, e.target.value);
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'clinic' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">🏥 Clinic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'clinic-name', label: 'Clinic Name', key: 'name', type: 'text' },
                  { id: 'clinic-phone', label: 'Phone Number', key: 'phone', type: 'tel' },
                  { id: 'clinic-email', label: 'Email Address', key: 'email', type: 'email' },
                  { id: 'clinic-gst', label: 'GSTIN', key: 'gstNumber', type: 'text' },
                ].map(f => (
                  <div key={f.id}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label}</label>
                    <input id={f.id} type={f.type}
                      value={clinicSettings[f.key as keyof typeof clinicSettings] as string}
                      onChange={e => setClinicSettings({ ...clinicSettings, [f.key]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                  <textarea id="clinic-address" value={clinicSettings.address}
                    onChange={e => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                    rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'working-hours' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">⏰ Working Hours & Slots</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'work-start', label: 'Clinic Opens', key: 'workStartTime' },
                  { id: 'work-end', label: 'Clinic Closes', key: 'workEndTime' },
                  { id: 'break-start', label: 'Break Starts', key: 'breakStart' },
                  { id: 'break-end', label: 'Break Ends', key: 'breakEnd' },
                  { id: 'slot-duration', label: 'Slot Duration (min)', key: 'slotDuration' },
                  { id: 'max-patients', label: 'Max Patients / Slot', key: 'maxPatientsPerSlot' },
                ].map(f => (
                  <div key={f.id}>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label}</label>
                    <input id={f.id} type="text"
                      value={clinicSettings[f.key as keyof typeof clinicSettings] as string}
                      onChange={e => setClinicSettings({ ...clinicSettings, [f.key]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition" />
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-700 mb-3">Working Days</p>
                <div className="flex gap-2 flex-wrap">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                    <button key={d} id={`day-${d}`}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition ${i < 6 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">🔔 Notification Settings</h2>
              <div className="space-y-4">
                {[
                  { key: 'whatsappEnabled', label: 'WhatsApp Notifications', desc: 'Send automated WhatsApp messages to patients', icon: '💬' },
                  { key: 'smsEnabled', label: 'SMS Notifications', desc: 'Send SMS alerts and reminders', icon: '📱' },
                  { key: 'emailEnabled', label: 'Email Notifications', desc: 'Send email invoices, reports and reminders', icon: '📧' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{n.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-800">{n.label}</p>
                        <p className="text-xs text-slate-500">{n.desc}</p>
                      </div>
                    </div>
                    <button
                      id={`toggle-${n.key}`}
                      onClick={() => setClinicSettings({ ...clinicSettings, [n.key]: !clinicSettings[n.key as keyof typeof clinicSettings] })}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${clinicSettings[n.key as keyof typeof clinicSettings] ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${clinicSettings[n.key as keyof typeof clinicSettings] ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">🔒 Security Settings</h2>
              <div className="space-y-4">
                {[
                  { key: 'enableTwoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA for all logins', icon: '🔐' },
                  { key: 'allowOAuth', label: 'Allow OAuth Login', desc: 'Allow Google/Microsoft SSO login', icon: '🌐' },
                ].map(s => (
                  <div key={s.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-800">{s.label}</p>
                        <p className="text-xs text-slate-500">{s.desc}</p>
                      </div>
                    </div>
                    <button
                      id={`toggle-${s.key}`}
                      onClick={() => setClinicSettings({ ...clinicSettings, [s.key]: !clinicSettings[s.key as keyof typeof clinicSettings] })}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${clinicSettings[s.key as keyof typeof clinicSettings] ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${clinicSettings[s.key as keyof typeof clinicSettings] ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="font-semibold text-rose-800">Change Password</p>
                  <p className="text-xs text-rose-600 mb-3">Last changed 30 days ago</p>
                  <button id="change-password-btn" className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl transition">
                    🔑 Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'devices' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">📱 Device Management</h2>
              <div className="space-y-3">
                {devices.map(d => (
                  <div key={d.id} className={`p-4 rounded-xl border ${d.current ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{d.name.includes('iPhone') ? '📱' : d.name.includes('Mac') ? '💻' : '🖥️'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800 text-sm">{d.name}</p>
                            {d.current && <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Current</span>}
                          </div>
                          <p className="text-xs text-slate-500">{d.location} · Last active: {d.lastActive}</p>
                        </div>
                      </div>
                      {!d.current && (
                        <button id={`revoke-${d.id}`} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition">
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'activity' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">📋 Activity & Audit Logs</h2>
              <div className="space-y-3">
                {activityLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-xl">{log.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                      <p className="text-xs text-slate-400">IP: {log.ip} · {log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5">👥 User Management</h2>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Jenkins', role: 'Senior Receptionist', email: 'sarah@clinic.com', status: 'Active' },
                  { name: 'Pradeep Kumar', role: 'Billing Officer', email: 'pradeep@clinic.com', status: 'Active' },
                  { name: 'Rekha Sharma', role: 'Front Desk', email: 'rekha@clinic.com', status: 'Inactive' },
                ].map((user, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.role} · {user.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {user.status}
                    </span>
                    <button id={`edit-user-${i}`} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition">Edit</button>
                  </div>
                ))}
                <button id="invite-user" className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition">
                  + Invite New User
                </button>
              </div>
            </div>
          )}

          {!['clinic', 'working-hours', 'notifications', 'security', 'devices', 'activity', 'users'].includes(activeSection) && (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <p className="font-bold text-slate-600 text-lg capitalize">{activeSection.replace('-', ' ')} Settings</p>
              <p className="text-slate-400 text-sm mt-2">Configure {activeSection.replace('-', ' ')} options here</p>
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4">
            {saved && (
              <div className="flex items-center gap-2 text-emerald-600">
                <span>✅</span>
                <span className="text-sm font-semibold">Settings saved successfully!</span>
              </div>
            )}
            <div className="ml-auto flex gap-3">
              <button className="px-6 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition">
                Discard
              </button>
              <button id="save-settings" onClick={handleSave}
                className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition">
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
