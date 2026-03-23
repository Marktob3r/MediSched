import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, Clock, User, Phone, ChevronRight, ChevronLeft,
  CheckCircle, HeartPulse, Stethoscope, AlertCircle, MessageSquare
} from "lucide-react";
import { PublicNavbar } from "../layout/PublicNavbar";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const APPOINTMENT_TYPES = [
  { id: "General Consultation", label: "General Consultation", icon: "🩺", desc: "For general health concerns and check-ups" },
  { id: "Physical Examination", label: "Physical Examination", icon: "📋", desc: "Annual physical exams or pre-employment" },
  { id: "Prenatal Check-up", label: "Prenatal Check-up", icon: "🤱", desc: "Routine prenatal care and monitoring" },
  { id: "Diabetes Management", label: "Diabetes Management", icon: "💉", desc: "Blood sugar monitoring and management" },
  { id: "Hypertension Management", label: "Hypertension Management", icon: "❤️", desc: "Blood pressure monitoring and care" },
  { id: "Laboratory Request", label: "Laboratory Request", icon: "🔬", desc: "Request for lab tests and diagnostics" },
  { id: "Pediatric Care", label: "Pediatric Care", icon: "👶", desc: "Healthcare for infants and children" },
  { id: "Follow-up", label: "Follow-up Visit", icon: "🔄", desc: "Follow-up after previous consultation" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function BookAppointment() {
  const [step, setStep] = useState(1);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "",
    date: "",
    time: "",
    name: user?.name || "",
    phone: "",
    email: user?.email || "",
    notes: "",
  });

  useEffect(() => {
    if (form.date) {
      apiFetch(`/appointments?date=${form.date}`)
        .then((data: any[]) => setBookedSlots(data.filter((a: any) => a.status !== "cancelled").map((a: any) => a.time)))
        .catch(() => {});
    }
  }, [form.date]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId: user?.patientId || `guest_${Date.now()}`,
          patientName: form.name,
          date: form.date,
          time: form.time,
          type: form.type,
          doctor: "Dr. Samuel P. Dizon",
          notes: form.notes,
          phone: form.phone,
        }),
      });
      setDone(true);
      toast.success("Appointment booked! An SMS confirmation will be sent to your phone.");
    } catch (err: any) {
      toast.error(err.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 1) return !!form.type;
    if (step === 2) return !!form.date && !!form.time;
    if (step === 3) return !!form.name && !!form.phone;
    return true;
  };

  const steps = ["Service", "Schedule", "Details", "Review"];

  if (done) {
    return (
      <div className="min-h-screen bg-green-50 font-[Montserrat]">
        <PublicNavbar />
        <div className="pt-24 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Appointment Booked!</h2>
            <p className="text-gray-500 mb-2">
              Your appointment request has been submitted.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 my-6 text-left space-y-2">
              <div className="flex gap-2 text-sm">
                <span className="font-semibold text-gray-700 w-20">Service:</span>
                <span className="text-gray-600">{form.type}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="font-semibold text-gray-700 w-20">Date:</span>
                <span className="text-gray-600">{formatDate(form.date)}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="font-semibold text-gray-700 w-20">Time:</span>
                <span className="text-gray-600">{formatTime(form.time)}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="font-semibold text-gray-700 w-20">Doctor:</span>
                <span className="text-gray-600">Dr. Samuel P. Dizon</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-left">
              <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-blue-700 text-xs">An SMS confirmation will be sent to <strong>{form.phone}</strong> once your appointment is confirmed by the clinic.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setDone(false); setStep(1); setForm({ type: "", date: "", time: "", name: user?.name || "", phone: "", email: user?.email || "", notes: "" }); }} className="border border-green-300 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50 transition-all text-sm">
                Book Another
              </button>
              <button onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/patient") : "/")} className="bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-all text-sm">
                {user ? "My Portal" : "Go Home"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 font-[Montserrat]">
      <PublicNavbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-3">
              <Stethoscope className="w-4 h-4" />
              Online Appointment Booking
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Book an Appointment</h1>
            <p className="text-gray-500 mt-2 text-sm">Samuel P. Dizon Medical Clinic · Available Mon–Fri, 8AM–5PM</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  i + 1 < step ? "bg-green-600 text-white" : i + 1 === step ? "bg-green-600 text-white ring-4 ring-green-100" : "bg-gray-200 text-gray-500"
                }`}>
                  {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`hidden sm:block mx-2 text-xs font-semibold ${i + 1 === step ? "text-green-700" : "text-gray-400"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-1 ${i + 1 < step ? "bg-green-500" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="p-6 sm:p-8"
              >
                {/* Step 1: Service Type */}
                {step === 1 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Select Service</h2>
                    <p className="text-sm text-gray-500 mb-5">What type of appointment do you need?</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {APPOINTMENT_TYPES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => update("type", t.id)}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                            form.type === t.id
                              ? "border-green-500 bg-green-50"
                              : "border-gray-100 hover:border-green-200 hover:bg-green-50/50"
                          }`}
                        >
                          <span className="text-2xl">{t.icon}</span>
                          <div>
                            <p className={`text-sm font-bold ${form.type === t.id ? "text-green-700" : "text-gray-800"}`}>{t.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                          </div>
                          {form.type === t.id && <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0 mt-0.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Choose Schedule</h2>
                    <p className="text-sm text-gray-500 mb-5">Select your preferred date and time slot.</p>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-600" /> Appointment Date
                        </label>
                        <input
                          type="date" value={form.date} min={getMinDate()}
                          onChange={(e) => { update("date", e.target.value); update("time", ""); }}
                          className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                        />
                      </div>
                      {form.date && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" /> Available Time Slots
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {TIME_SLOTS.map((t) => {
                              const taken = bookedSlots.includes(t);
                              return (
                                <button
                                  key={t}
                                  disabled={taken}
                                  onClick={() => update("time", t)}
                                  className={`py-2.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                                    taken ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                                    : form.time === t ? "border-green-500 bg-green-600 text-white"
                                    : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
                                  }`}
                                >
                                  {formatTime(t)}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-400 mt-3">
                            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 border border-gray-200 rounded inline-block" /> Taken</span>
                            {" · "}
                            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 bg-green-600 rounded inline-block" /> Selected</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Patient Details */}
                {step === 3 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Your Details</h2>
                    <p className="text-sm text-gray-500 mb-5">Please provide your contact information.</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                            placeholder="Juan dela Cruz" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number * <span className="text-gray-400 font-normal">(for SMS notifications)</span></label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                            placeholder="+639XXXXXXXXX" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes / Chief Complaint <span className="text-gray-400 font-normal">(optional)</span></label>
                        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3}
                          className="w-full border border-gray-200 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 resize-none"
                          placeholder="Briefly describe your concern..." />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Review & Confirm</h2>
                    <p className="text-sm text-gray-500 mb-5">Please review your appointment details before confirming.</p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
                      {[
                        { label: "Service", value: form.type },
                        { label: "Date", value: formatDate(form.date) },
                        { label: "Time", value: formatTime(form.time) },
                        { label: "Doctor", value: "Dr. Samuel P. Dizon" },
                        { label: "Patient", value: form.name },
                        { label: "Mobile", value: form.phone },
                        ...(form.notes ? [{ label: "Notes", value: form.notes }] : []),
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-3 text-sm">
                          <span className="font-semibold text-gray-600 w-16 flex-shrink-0">{label}:</span>
                          <span className="text-gray-800">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-700 text-xs">Your appointment status will be <strong>pending</strong> until confirmed by the clinic staff. You will receive an SMS notification.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="px-6 sm:px-8 pb-6 flex gap-3">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <div className="flex-1" />
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext()}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm ml-auto"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold px-8 py-3 rounded-xl transition-all text-sm"
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {submitting ? "Submitting..." : "Confirm Appointment"}
                </button>
              )}
            </div>
          </div>

          {/* Login prompt */}
          {!user && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Have an account? <Link to="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link> to track your appointments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
