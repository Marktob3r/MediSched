import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search, Plus, User, Phone, Mail, Edit2, Trash2, Eye,
  Loader, X, Save, Calendar, Heart, AlertTriangle, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminLayout } from "../layout/AdminSidebar";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface Patient {
  id: string; name: string; email: string; phone: string;
  dob: string; gender: string; address: string; bloodType: string;
  allergies: string; medicalHistory: string[]; lastVisit: string | null; createdAt: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const COMMON_CONDITIONS = ["Hypertension", "Diabetes Type 2", "Asthma", "Arthritis", "Heart Disease", "Migraine", "Thyroid Disorder", "Anemia"];

export function PatientRecordsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", dob: "", gender: "Male", address: "", bloodType: "O+", allergies: "None", medicalHistory: [] as string[] });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/patient"); return; }
    loadPatients();
  }, [user]);

  const loadPatients = async () => {
    setLoading(true);
    try { setPatients(await apiFetch("/patients")); }
    catch { toast.error("Failed to load patients"); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", dob: "", gender: "Male", address: "", bloodType: "O+", allergies: "None", medicalHistory: [] });
    setShowModal(true);
  };

  const openEdit = (p: Patient) => {
    setEditing(p);
    setForm({ name: p.name, email: p.email, phone: p.phone, dob: p.dob, gender: p.gender, address: p.address, bloodType: p.bloodType, allergies: p.allergies, medicalHistory: p.medicalHistory || [] });
    setShowModal(true);
  };

  const openView = (p: Patient) => { setSelected(p); setShowView(true); };

  const toggleCondition = (cond: string) => {
    setForm((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.includes(cond)
        ? prev.medicalHistory.filter((c) => c !== cond)
        : [...prev.medicalHistory, cond],
    }));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Patient name is required."); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/patients/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast.success("Patient record updated!");
      } else {
        await apiFetch("/patients", { method: "POST", body: JSON.stringify(form) });
        toast.success("Patient record added!");
      }
      setShowModal(false);
      loadPatients();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this patient record?")) return;
    try { await apiFetch(`/patients/${id}`, { method: "DELETE" }); toast.success("Patient deleted"); loadPatients(); }
    catch { toast.error("Delete failed"); }
  };

  function formatDob(d: string) { return d ? new Date(d).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "N/A"; }
  function calcAge(d: string) { if (!d) return "N/A"; const diff = Date.now() - new Date(d).getTime(); return `${Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))} yrs`; }
  function formatDate(d: string | null) { return d ? new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "Never"; }

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Patient Records</h1>
            <p className="text-gray-500 text-sm">{patients.length} registered patients</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search by name, email, or phone..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 text-green-600 animate-spin" /></div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Patient", "Contact", "Age / Blood Type", "Medical History", "Last Visit", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No patients found.</td></tr>
                  ) : filtered.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">{p.name[0]}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-gray-700 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{p.phone || "N/A"}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{p.email || "N/A"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-700">{calcAge(p.dob)}</p>
                        <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold">{p.bloodType || "Unknown"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {p.medicalHistory?.length > 0
                            ? p.medicalHistory.slice(0, 2).map((c) => <span key={c} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">{c}</span>)
                            : <span className="text-xs text-gray-400">None</span>}
                          {p.medicalHistory?.length > 2 && <span className="text-xs text-gray-400">+{p.medicalHistory.length - 2}</span>}
                        </div>
                        {p.allergies && p.allergies !== "None" && (
                          <p className="text-xs text-orange-500 flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3" />Allergy: {p.allergies}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-700">{formatDate(p.lastVisit)}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openView(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                  <h2 className="font-bold text-gray-900">{editing ? "Edit Patient" : "Add Patient"}</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Full Name *", key: "name", type: "text", placeholder: "Juan dela Cruz", col: 2 },
                      { label: "Email", key: "email", type: "email", placeholder: "email@example.com", col: 1 },
                      { label: "Phone", key: "phone", type: "tel", placeholder: "+639XXXXXXXXX", col: 1 },
                      { label: "Date of Birth", key: "dob", type: "date", placeholder: "", col: 1 },
                      { label: "Address", key: "address", type: "text", placeholder: "Street, City, Province", col: 1 },
                    ].map(({ label, key, type, placeholder, col }) => (
                      <div key={key} className={col === 2 ? "col-span-2" : ""}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                        <input type={type} value={(form as any)[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                      <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        {["Male", "Female", "Other"].map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Blood Type</label>
                      <select value={form.bloodType} onChange={(e) => setForm((p) => ({ ...p, bloodType: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Allergies</label>
                      <input type="text" value={form.allergies} onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="List allergies or write 'None'" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Medical History</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_CONDITIONS.map((c) => (
                          <button key={c} type="button" onClick={() => toggleCondition(c)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${form.medicalHistory.includes(c) ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-300"}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 px-5 pb-5 sticky bottom-0 bg-white border-t pt-4">
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

        {/* View Modal */}
        <AnimatePresence>
          {showView && selected && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-5 border-b">
                  <h2 className="font-bold text-gray-900">Patient Profile</h2>
                  <button onClick={() => setShowView(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b">
                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-extrabold text-2xl">{selected.name[0]}</div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">{selected.name}</h3>
                      <p className="text-sm text-gray-500">{selected.gender} · {calcAge(selected.dob)} · {selected.bloodType}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Last visit: {formatDate(selected.lastVisit)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                      { label: "Phone", value: selected.phone, icon: Phone },
                      { label: "Email", value: selected.email, icon: Mail },
                      { label: "Date of Birth", value: formatDob(selected.dob), icon: Calendar },
                      { label: "Address", value: selected.address, icon: User },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-0.5"><Icon className="w-3 h-3" />{label}</p>
                        <p className="text-sm text-gray-900 font-semibold">{value || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1.5"><AlertTriangle className="w-3 h-3 text-orange-500" />Allergies</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${selected.allergies && selected.allergies !== "None" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                        {selected.allergies || "None"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1.5"><Heart className="w-3 h-3 text-red-400" />Medical History</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.medicalHistory?.length > 0
                          ? selected.medicalHistory.map((c) => <span key={c} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-medium">{c}</span>)
                          : <span className="text-sm text-gray-400">No conditions recorded</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 px-5 pb-5">
                  <button onClick={() => setShowView(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">Close</button>
                  <button onClick={() => { setShowView(false); openEdit(selected); }} className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 text-sm flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Record
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );

  function calcAge(d: string) { if (!d) return "N/A"; const diff = Date.now() - new Date(d).getTime(); return `${Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))} yrs`; }
  function formatDate(d: string | null) { return d ? new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "Never"; }
  function formatDob(d: string) { return d ? new Date(d).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "N/A"; }
}
