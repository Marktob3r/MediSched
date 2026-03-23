import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Clock, CheckCircle, Save, Loader, Calendar, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { AdminLayout } from "../layout/AdminSidebar";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 7;
  return { value: `${h.toString().padStart(2, "0")}:00`, label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}` };
});

interface Schedule {
  workDays: string[]; startTime: string; endTime: string;
  slotDurationMinutes: number; breakStart: string; breakEnd: string; maxPatientsPerDay: number;
}

const DEFAULT_SCHEDULE: Schedule = {
  workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startTime: "08:00", endTime: "17:00", slotDurationMinutes: 60,
  breakStart: "12:00", breakEnd: "13:00", maxPatientsPerDay: 20,
};

function generateSlots(start: string, end: string, duration: number, breakS: string, breakE: string): string[] {
  const slots: string[] = [];
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const [bsh, bsm] = breakS.split(":").map(Number);
  const [beh, bem] = breakE.split(":").map(Number);
  const endMin = eh * 60 + em;
  while (h * 60 + m < endMin) {
    const isBreak = (h * 60 + m >= bsh * 60 + bsm) && (h * 60 + m < beh * 60 + bem);
    if (!isBreak) slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    m += duration;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}

function formatT(t: string) {
  const [h] = t.split(":"); const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${t.split(":")[1]} ${hour >= 12 ? "PM" : "AM"}`;
}

function getWeekDates(offset = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [tab, setTab] = useState<"calendar" | "settings">("calendar");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/patient"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sch, apts] = await Promise.all([apiFetch("/schedule"), apiFetch("/appointments")]);
      setSchedule(sch);
      setAppointments(apts);
    } catch { toast.error("Failed to load schedule"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/schedule", { method: "PUT", body: JSON.stringify(schedule) });
      toast.success("Schedule settings saved!");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const toggleDay = (day: string) => {
    setSchedule((p) => ({
      ...p,
      workDays: p.workDays.includes(day) ? p.workDays.filter((d) => d !== day) : [...p.workDays, day],
    }));
  };

  const weekDates = getWeekDates(weekOffset);
  const slots = generateSlots(schedule.startTime, schedule.endTime, schedule.slotDurationMinutes, schedule.breakStart, schedule.breakEnd);

  const getAptForSlot = (date: Date, time: string) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((a) => a.date === dateStr && a.time === time && a.status !== "cancelled");
  };

  const statusColor: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Schedule Management</h1>
            <p className="text-gray-500 text-sm">Manage clinic hours and view appointment calendar</p>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {(["calendar", "settings"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{t === "calendar" ? "📅 Calendar" : "⚙️ Settings"}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 text-green-600 animate-spin" /></div>
        ) : tab === "calendar" ? (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* Week Nav */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <div className="text-center">
                <p className="font-bold text-gray-900">
                  {weekDates[0].toLocaleDateString("en-PH", { month: "long", day: "numeric" })} – {weekDates[6].toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                {weekOffset === 0 && <span className="text-xs text-green-600 font-semibold">This Week</span>}
              </div>
              <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Day Headers */}
                <div className="grid grid-cols-8 border-b border-gray-100">
                  <div className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</div>
                  {weekDates.map((date, i) => {
                    const dayName = DAYS[i];
                    const isWorkDay = schedule.workDays.includes(dayName);
                    const isToday = date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
                    return (
                      <div key={i} className={`px-2 py-3 text-center border-l border-gray-100 ${!isWorkDay ? "bg-gray-50" : ""}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-green-600" : "text-gray-500"}`}>{dayName.slice(0, 3)}</p>
                        <p className={`text-lg font-extrabold mt-0.5 ${isToday ? "text-green-600 bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : "text-gray-900"}`}>
                          {date.getDate()}
                        </p>
                        {!isWorkDay && <span className="text-xs text-gray-300 font-medium">Off</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Slots */}
                {slots.map((slot) => (
                  <div key={slot} className="grid grid-cols-8 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-r border-gray-100 flex items-center">
                      {formatT(slot)}
                    </div>
                    {weekDates.map((date, i) => {
                      const dayName = DAYS[i];
                      const isWorkDay = schedule.workDays.includes(dayName);
                      const apts = getAptForSlot(date, slot);
                      return (
                        <div key={i} className={`px-1 py-1.5 border-l border-gray-100 min-h-[44px] ${!isWorkDay ? "bg-gray-50" : ""}`}>
                          {isWorkDay && apts.map((apt) => (
                            <div key={apt.id} className={`text-xs px-2 py-1 rounded-lg border font-medium truncate ${statusColor[apt.status] || "bg-gray-100 text-gray-600"}`} title={`${apt.patientName} - ${apt.type}`}>
                              {apt.patientName.split(" ")[0]}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
              {Object.entries(statusColor).map(([status, cls]) => (
                <span key={status} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${cls}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              ))}
              <span className="text-xs text-gray-400 ml-auto">Click status dot to update</span>
            </div>
          </div>
        ) : (
          // Settings Tab
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" /> Working Days
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {DAYS.map((day) => (
                  <button key={day} onClick={() => toggleDay(day)} className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${schedule.workDays.includes(day) ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-200"}`}>
                    {schedule.workDays.includes(day) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" /> Clinic Hours
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Open</label>
                    <select value={schedule.startTime} onChange={(e) => setSchedule((p) => ({ ...p, startTime: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      {HOURS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Close</label>
                    <select value={schedule.endTime} onChange={(e) => setSchedule((p) => ({ ...p, endTime: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      {HOURS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Break Time</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Break Start</label>
                    <select value={schedule.breakStart} onChange={(e) => setSchedule((p) => ({ ...p, breakStart: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      {HOURS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Break End</label>
                    <select value={schedule.breakEnd} onChange={(e) => setSchedule((p) => ({ ...p, breakEnd: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      {HOURS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
              <h3 className="font-bold text-gray-900 text-lg">Slot Configuration</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 60, 90].map((d) => (
                    <button key={d} onClick={() => setSchedule((p) => ({ ...p, slotDurationMinutes: d }))} className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${schedule.slotDurationMinutes === d ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-200"}`}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Patients Per Day</label>
                <input type="number" value={schedule.maxPatientsPerDay} min={1} max={50} onChange={(e) => setSchedule((p) => ({ ...p, maxPatientsPerDay: parseInt(e.target.value) || 1 }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Generated Slots Preview</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl max-h-40 overflow-y-auto">
                  {slots.map((s) => (
                    <span key={s} className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-lg font-semibold">{formatT(s)}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{slots.length} slots available per working day</p>
              </div>

              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">Changes to schedule will take effect for new bookings. Existing appointments are not affected.</p>
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-end">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Schedule Settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
