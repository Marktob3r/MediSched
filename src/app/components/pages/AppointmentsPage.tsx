import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search, Filter, Plus, Calendar, Clock, Phone, Edit2, Trash2,
  CheckCircle, XCircle, AlertCircle, ChevronDown, Loader, X, Save,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminLayout } from "../layout/AdminSidebar";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface Appointment {
  id: string; patientId: string; patientName: string;
  date: string; time: string; type: string; doctor: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string; phone: string; createdAt: string;
}

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];
const TYPES = ["General Consultation", "Physical Examination", "Prenatal Check-up", "Diabetes Management", "Hypertension Management", "Laboratory Request", "Pediatric Care", "Follow-up"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const statusCfg: Record<string, { color: string; icon: React.ElementType }> = {
  pending:   { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: AlertCircle },
  confirmed: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  cancelled: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  completed: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
};

function formatDate(d: string) { return d ? new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : ""; }
function formatTime(t: string) { if (!t) return ""; const [h] = t.split(":"); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour || 12}:${t.split(":")[1]} ${hour >= 12 ? "PM" : "AM"}`; }
function getMinDate() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; }

export function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ patientName: "", phone: "", date: "", time: "", type: "General Consultation", notes: "", status: "pending" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/patient"); return; }
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/appointments");
      setAppointments(data);
    } catch (err) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm({ patientName: "", phone: "", date: "", time: "", type: "General Consultation", notes: "", status: "pending" }); setShowModal(true); };
  const openEdit = (apt: Appointment) => { setEditing(apt); setForm({ patientName: apt.patientName, phone: apt.phone, date: apt.date, time: apt.time, type: apt.type, notes: apt.notes, status: apt.status }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.patientName || !form.date || !form.time) { toast.error("Please fill in all required fields."); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/appointments/${editing.id}`, { method: "PUT", body: JSON.stringify({ ...form }) });
        toast.success("Appointment updated!");
      } else {
        await apiFetch("/appointments", { method: "POST", body: JSON.stringify({ ...form, patientId: `guest_${Date.now()}`, doctor: "Dr. Samuel P. Dizon" }) });
        toast.success("Appointment added!");
      }
      setShowModal(false);
      loadAppointments();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await apiFetch(`/appointments/${id}`, { method: "DELETE" });
      toast.success("Appointment deleted");
      loadAppointments();
    } catch { toast.error("Delete failed"); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/appointments/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      toast.success(`Status updated to ${status}`);
      loadAppointments();
    } catch { toast.error("Update failed"); }
  };

  const filtered = appointments.filter((a) => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Appointments</h1>
            <p className="text-gray-500 text-sm">{appointments.length} total appointments</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
            <Plus className="w-4 h-4" /> Add Appointment
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient name or service..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
          </div>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${filterStatus === s ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Patient", "Service", "Date & Time", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No appointments found.</td></tr>
                  ) : filtered.map((apt, i) => {
                    const cfg = statusCfg[apt.status] || statusCfg.pending;
                    const Icon = cfg.icon;
                    return (
                      <motion.tr key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">{apt.patientName[0]}</div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{apt.patientName}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{apt.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{apt.type}</p>
                          <p className="text-xs text-gray-400">{apt.doctor}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-green-500" />{formatDate(apt.date)}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(apt.time)}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="relative group">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer ${cfg.color}`}>
                              <Icon className="w-3 h-3" />
                              {apt.status}
                              <ChevronDown className="w-3 h-3" />
                            </span>
                            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 hidden group-hover:block min-w-32">
                              {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                                <button key={s} onClick={() => updateStatus(apt.id, s)} className="block w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 capitalize first:rounded-t-xl last:rounded-b-xl">{s}</button>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(apt)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(apt.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
              >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">{editing ? "Edit Appointment" : "Add Appointment"}</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Patient Name *</label>
                      <input value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Full name" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                      <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="+639XXXXXXXXX" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
                      <input type="date" value={form.date} min={getMinDate()} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Time *</label>
                      <select value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select time</option>
                        {TIME_SLOTS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Service Type</label>
                      <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    {editing && (
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                        <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                          {["pending", "confirmed", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                      <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="Additional notes..." />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 px-5 pb-5">
                  <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:bg-green-400">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save"}
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
