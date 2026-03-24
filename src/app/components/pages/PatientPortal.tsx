import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  Plus, Bell, User, LogOut, HeartPulse,
  FileText, Phone, Loader
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/client";

interface Appointment {
  id: string; patientId: string; patientName: string;
  date: string; time: string; type: string; doctor: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string; phone: string; createdAt: string;
}

interface Notification {
  id: string; message: string; status: string; sentAt: string; type: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending:   { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertCircle, label: "Pending" },
  confirmed: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, label: "Confirmed" },
  cancelled: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Cancelled" },
  completed: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle, label: "Completed" },
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function formatTime(t: string) {
  const [h] = t.split(":"); const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${t.split(":")[1]} ${hour >= 12 ? "PM" : "AM"}`;
}

export function PatientPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "history" | "notifications">("upcoming");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role === "admin") { navigate("/admin"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apts, notifs] = await Promise.all([
        apiFetch(`/appointments${user?.patientId ? `?patientId=${user.patientId}` : ""}`),
        apiFetch(`/notifications${user?.patientId ? `?patientId=${user.patientId}` : ""}`),
      ]);
      setAppointments(apts);
      setNotifications(notifs);
    } catch (err) {
      console.error("Failed to load patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter((a) => a.date >= today && a.status !== "cancelled" && a.status !== "completed");
  const history = appointments.filter((a) => a.date < today || a.status === "completed" || a.status === "cancelled");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-[Montserrat]">
      <div>
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-green-200 text-sm font-medium">Patient Portal</p>
                  <h1 className="text-xl sm:text-2xl font-extrabold">Hello, {user.name.split(" ")[0]}! 👋</h1>
                  <p className="text-green-200 text-sm">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Upcoming", value: upcoming.length, color: "bg-white/10" },
                { label: "Completed", value: appointments.filter((a) => a.status === "completed").length, color: "bg-white/10" },
                { label: "Notifications", value: notifications.length, color: "bg-white/10" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`${color} rounded-xl p-3 text-center`}>
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-green-200 text-xs font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Book Button */}
          <div className="mb-6">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-5 h-5" />
              Book New Appointment
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-5 w-full sm:w-auto sm:inline-flex gap-1">
            {(["upcoming", "history", "notifications"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  tab === t ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "upcoming" && upcoming.length > 0 && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}>{upcoming.length}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Upcoming Appointments */}
              {tab === "upcoming" && (
                <div className="space-y-4">
                  {upcoming.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                      <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No upcoming appointments</p>
                      <p className="text-gray-400 text-sm mt-1">Book one to get started!</p>
                      <Link to="/book" className="inline-flex items-center gap-2 mt-4 bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 text-sm">
                        <Plus className="w-4 h-4" /> Book Now
                      </Link>
                    </div>
                  ) : upcoming.map((apt, i) => (
                    <AppointmentCard key={apt.id} apt={apt} index={i} />
                  ))}
                </div>
              )}

              {/* History */}
              {tab === "history" && (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                      <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No appointment history yet</p>
                    </div>
                  ) : history.map((apt, i) => (
                    <AppointmentCard key={apt.id} apt={apt} index={i} />
                  ))}
                </div>
              )}

              {/* Notifications */}
              {tab === "notifications" && (
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                      <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No notifications yet</p>
                    </div>
                  ) : notifications.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.sentAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {" · "}
                          <span className="text-green-600 font-semibold">✓ {notif.status}</span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ apt, index }: { apt: Appointment; index: number }) {
  const cfg = statusConfig[apt.status] || statusConfig.pending;
  const Icon = cfg.icon;
  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }
  function formatTime(t: string) {
    const [h] = t.split(":"); const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${t.split(":")[1]} ${hour >= 12 ? "PM" : "AM"}`;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-5 h-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{apt.type}</p>
            <p className="text-sm text-gray-500">{apt.doctor}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(apt.date)}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" /> {formatTime(apt.time)}
              </span>
            </div>
            {apt.notes && <p className="text-xs text-gray-400 mt-1.5 italic">"{apt.notes}"</p>}
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex-shrink-0 ${cfg.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </span>
      </div>
    </motion.div>
  );
}
