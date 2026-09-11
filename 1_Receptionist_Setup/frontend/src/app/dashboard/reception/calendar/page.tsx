'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMeshSync, AppointmentItem } from '../../meshSync';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];

const doctorColors: Record<string, string> = {
  'Dr. Sharma': 'bg-blue-500 text-white',
  'Dr. Mehta': 'bg-emerald-500 text-white',
  'Dr. Gupta': 'bg-violet-500 text-white',
  'Dr. Patel': 'bg-amber-500 text-white',
  'Dr. Joshi': 'bg-teal-500 text-white',
};

export default function CalendarPage() {
  const { appointments, addAppointment } = useMeshSync();
  const [view, setView] = useState<'week' | 'day' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date('2026-06-19'));
  const [isSyncing, setIsSyncing] = useState(false);

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const exists = appointments.some(a => a.patient === 'Seminar: Pediatric Care');
    if (!exists) {
      addAppointment({
        patient: 'Seminar: Pediatric Care',
        doctor: 'Dr. Joshi',
        date: '2026-06-19',
        time: '09:30 AM',
        type: 'Pediatrics',
        status: 'CONFIRMED',
        payStatus: 'PAID',
      });
      addAppointment({
        patient: 'Star Health Audit',
        doctor: 'Dr. Sharma',
        date: '2026-06-19',
        time: '02:00 PM',
        type: 'Cardiology',
        status: 'CONFIRMED',
        payStatus: 'PAID',
      });
      alert('Google Calendar Sync Complete:\n2 external meetings successfully imported.');
    } else {
      alert('Google Calendar Sync is already up to date.');
    }
    setIsSyncing(false);
  };

  const getDateForDay = (dayIndex: number) => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = dayIndex - day;
    date.setDate(date.getDate() + diff);
    return date;
  };

  const getHourIndex = (timeStr: string) => {
    const cleanTime = timeStr.toUpperCase();
    if (cleanTime.startsWith('08') || cleanTime.startsWith('8')) return 0;
    if (cleanTime.startsWith('09') || cleanTime.startsWith('9')) return 1;
    if (cleanTime.startsWith('10')) return 2;
    if (cleanTime.startsWith('11')) return 3;
    if (cleanTime.startsWith('12')) return 4;
    if (cleanTime.startsWith('01') || cleanTime.startsWith('1:')) return 5;
    if (cleanTime.startsWith('02') || cleanTime.startsWith('2:')) return 6;
    if (cleanTime.startsWith('03') || cleanTime.startsWith('3:')) return 7;
    if (cleanTime.startsWith('04') || cleanTime.startsWith('4:')) return 8;
    if (cleanTime.startsWith('05') || cleanTime.startsWith('5:')) return 9;
    if (cleanTime.startsWith('06') || cleanTime.startsWith('6:')) return 10;
    return 2; // default 10 AM
  };

  const getDayIndex = (dateStr: string) => {
    return new Date(dateStr).getDay();
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 7);
    setCurrentDate(nextDate);
  };

  const handlePrev = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 7);
    setCurrentDate(prevDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-06-19'));
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">
            {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · Interactive Scheduler
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
            {(['week', 'day', 'month'] as const).map(v => (
              <button key={v} id={`cal-view-${v}`} onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition ${view === v ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                {v}
              </button>
            ))}
          </div>
          <button id="google-sync-btn" onClick={handleGoogleSync} disabled={isSyncing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-705 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50">
            {isSyncing ? '⏳ Syncing...' : '📅 Google Calendar Sync'}
          </button>
          <Link href="/dashboard/reception/appointments/new" id="cal-new-appt"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-750 hover:bg-emerald-700 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm">
            + Book Appointment
          </Link>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center justify-between shadow-sm">
        <button id="cal-prev" onClick={handlePrev} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-650 font-bold">← Prev Week</button>
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-extrabold text-slate-850">
            {getDateForDay(0).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {getDateForDay(6).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </h2>
          <button id="cal-today" onClick={handleToday} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition">
            Reset to Demo Date
          </button>
        </div>
        <button id="cal-next" onClick={handleNext} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-650 font-bold">Next Week →</button>
      </div>

      {/* Week view */}
      {view === 'week' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/50">
            <div className="p-3 text-center" />
            {days.map((day, i) => {
              const date = getDateForDay(i);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={day} className={`p-3 text-center border-l border-slate-200 ${isToday ? 'bg-emerald-50/30' : ''}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day}</p>
                  <p className={`text-base font-extrabold mt-0.5 ${isToday ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {date.getDate()}
                  </p>
                  {isToday && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mt-0.5" />}
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          <div className="overflow-y-auto max-h-[60vh]">
            {hours.map((hour, hi) => (
              <div key={hour} className="grid grid-cols-8 border-b border-slate-100 min-h-[70px]">
                <div className="p-2 flex items-start justify-end pr-3 border-r border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{hour}</span>
                </div>
                {days.map((_, di) => {
                  const dayDateStr = getDateForDay(di).toISOString().split('T')[0];
                  const appts = appointments.filter(a => a.date === dayDateStr && getHourIndex(a.time) === hi && a.status !== 'CANCELLED');
                  
                  return (
                    <div key={di} className="p-1.5 border-r border-slate-100 relative min-h-[70px] bg-slate-50/10">
                      {appts.map((a: AppointmentItem) => (
                        <div key={a.id} className={`p-2 rounded-xl text-[10px] shadow-sm font-semibold truncate ${doctorColors[a.doctor] || 'bg-slate-700 text-white'}`}
                          title={`${a.patient} with ${a.doctor} at ${a.time} - ${a.status}`}>
                          <strong className="block text-white truncate">{a.patient}</strong>
                          <span className="opacity-90 block truncate">{a.doctor} · {a.time}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback for Month and Day view */}
      {view !== 'week' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <span className="text-3xl block mb-2">📅</span>
          <p className="font-semibold text-slate-500 text-sm">Please toggle back to Week View to inspect scheduled time slots.</p>
        </div>
      )}
    </div>
  );
}
