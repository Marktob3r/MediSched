import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Phone, Send, CheckCircle, Loader, Search, Bell, Plus, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { AdminLayout } from "../layout/AdminSidebar";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface Notification {
  id: string; patientId: string; patientName: string; phone: string;
  type: string; message: string; status: string; sentAt: string;
}

interface Patient { id: string; name: string; phone: string; }

const MESSAGE_TEMPLATES = [
  { label: "Appointment Confirmed", text: "Your appointment on {date} at {time} has been confirmed. Please arrive 10 minutes early. - Samuel P. Dizon Medical Clinic" },
  { label: "Appointment Reminder", text: "Reminder: You have an appointment tomorrow at {time}. - Samuel P. Dizon Medical Clinic" },
  { label: "Appointment Cancelled", text: "We regret to inform you that your appointment on {date} has been cancelled. Please call us to reschedule. - Samuel P. Dizon Medical Clinic" },
  { label: "General Notice", text: "Important notice from Samuel P. Dizon Medical Clinic: {message}" },
  { label: "Follow-up", text: "Dear {name}, please don't forget your follow-up appointment. - Samuel P. Dizon Medical Clinic" },
];

// Note: This page is deprecated as SMS features have been removed from the system.
// Kept for reference but no longer in use.
export function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ patientId: "", patientName: "", phone: "", message: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/patient"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifs, pats] = await Promise.all([apiFetch("/notifications"), apiFetch("/patients")]);
      setNotifications(notifs);
      setPatients(pats);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!form.phone || !form.message) { toast.error("Phone and message are required."); return; }
    setSending(true);
    try {
      await apiFetch("/notifications/send", {
        method: "POST",
        body: JSON.stringify({ patientId: form.patientId, patientName: form.patientName || "Unknown", type: "email", message: form.message }),
      });
      toast.success("Notification sent!");
      setShowModal(false);
      setForm({ patientId: "", patientName: "", phone: "", message: "" });
      loadData();
    } catch { toast.error("Send failed"); }
    finally { setSending(false); }
  };

  const selectPatient = (p: Patient) => {
    setForm((prev) => ({ ...prev, patientId: p.id, patientName: p.name, phone: p.phone }));
  };

  const filtered = notifications.filter((n) =>
    n.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    n.message?.toLowerCase().includes(search.toLowerCase()) ||
    n.phone?.includes(search)
  );

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm">{notifications.length} messages sent</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
            <Send className="w-4 h-4" /> Send Notification
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Sent", value: notifications.length, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
            { label: "Today", value: notifications.filter((n) => n.sentAt?.startsWith(new Date().toISOString().split("T")[0])).length, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
            { label: "Delivered", value: notifications.filter((n) => n.status === "sent").length, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`bg-white border ${border} rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search by patient or message..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 text-green-600 animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No notifications found</p>
              </div>
            ) : filtered.map((notif, i) => (
              <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{notif.patientName}</p>
                    <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                      <CheckCircle className="w-3 h-3" /> {notif.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {notif.phone}
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border-l-4 border-green-400">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(notif.sentAt)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Send Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-5 border-b">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2"><Send className="w-4 h-4 text-green-600" /> Send Notification</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Select Patient</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-50">
                      {patients.map((p) => (
                        <button key={p.id} onClick={() => selectPatient(p)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-green-50 transition-colors ${form.patientId === p.id ? "bg-green-50" : ""}`}>
                          <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">{p.name[0]}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.phone}</p>
                          </div>
                          {form.patientId === p.id && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!form.patientId && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Name (manual)</label>
                        <input value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Patient name" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                        <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="+639XXXXXXXXX" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Message Templates</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {MESSAGE_TEMPLATES.map((t) => (
                        <button key={t.label} onClick={() => setForm((p) => ({ ...p, message: t.text }))} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 rounded-lg font-medium transition-colors">
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={4} placeholder="Type your message here..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                    <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length} characters</p>
                  </div>
                </div>
                <div className="flex gap-3 px-5 pb-5">
                  <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
                  <button onClick={handleSend} disabled={sending} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
