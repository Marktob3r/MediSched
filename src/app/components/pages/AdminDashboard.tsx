import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import {
  Calendar, Users, CheckCircle, Clock, AlertCircle, TrendingUp,
  Plus, Bell, Activity, BarChart3, ArrowRight, Loader
} from "lucide-react";
import { AdminLayout } from "../layout/AdminSidebar";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#16a34a",
  pending: "#f59e0b",
  completed: "#3b82f6",
  cancelled: "#ef4444",
};

const PIE_COLORS = ["#16a34a", "#f59e0b", "#3b82f6", "#ef4444"];

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/patient"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, apts] = await Promise.all([
        apiFetch("/reports/summary"),
        apiFetch("/appointments"),
      ]);
      setSummary(sum);
      setAppointments(apts);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayApts = appointments.filter((a) => a.date === today);
  const recentApts = appointments.slice(0, 5);

  const monthlyData = summary?.monthly
    ? Object.entries(summary.monthly).map(([k, v]) => ({
        name: new Date(k + "-01").toLocaleDateString("en-PH", { month: "short" }),
        appointments: v,
      }))
    : [];

  const statusData = summary?.byStatus
    ? Object.entries(summary.byStatus).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    : [];

  const kpiCards = [
    { title: "Today's Appointments", value: summary?.todayAppointments ?? 0, icon: Calendar, color: "bg-green-50 text-green-600", border: "border-green-200", change: "Scheduled today" },
    { title: "Pending Confirmation", value: summary?.todayPending ?? 0, icon: AlertCircle, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-200", change: "Awaiting approval" },
    { title: "Total Patients", value: summary?.totalPatients ?? 0, icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-200", change: "Registered" },
    { title: "This Month", value: summary?.monthAppointments ?? 0, icon: TrendingUp, color: "bg-purple-50 text-purple-600", border: "border-purple-200", change: "Appointments" },
  ];

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  }
  function formatTime(t: string) {
    const [h] = t.split(":"); const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${t.split(":")[1]} ${hour >= 12 ? "PM" : "AM"}`;
  }

  const statusBadge = (status: string) => {
    const cfg: Record<string, string> = {
      confirmed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return cfg[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              <Activity className="w-4 h-4" /> Refresh
            </button>
            <Link to="/admin/appointments" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all">
              <Plus className="w-4 h-4" /> New Appointment
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-10 h-10 text-green-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiCards.map(({ title, value, icon: Icon, color, border, change }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white border ${border} rounded-2xl p-5`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{title}</p>
                  <p className="text-xs text-gray-400 mt-1">{change}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly Chart */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Monthly Appointments</h3>
                    <p className="text-xs text-gray-400">Last 6 months</p>
                  </div>
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                    <YAxis tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                    <Tooltip contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="appointments" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Appointment Status</h3>
                    <p className="text-xs text-gray-400">Overall breakdown</p>
                  </div>
                  <Activity className="w-4 h-4 text-gray-400" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11, fontFamily: "Montserrat" }}>
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Today's Schedule + Recent */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Today's Schedule</h3>
                    <p className="text-xs text-gray-400">{todayApts.length} appointments</p>
                  </div>
                  <Link to="/admin/appointments" className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {todayApts.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No appointments today</p>
                    </div>
                  ) : todayApts.sort((a, b) => a.time.localeCompare(b.time)).map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                      <div className="text-center w-14 flex-shrink-0">
                        <p className="text-xs font-bold text-green-700">{formatTime(apt.time)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{apt.patientName}</p>
                        <p className="text-xs text-gray-400 truncate">{apt.type}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${statusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Recent Appointments</h3>
                    <p className="text-xs text-gray-400">Latest bookings</p>
                  </div>
                  <Link to="/admin/appointments" className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-1">
                    Manage <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentApts.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-bold text-sm">{apt.patientName[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{apt.patientName}</p>
                        <p className="text-xs text-gray-400">{formatDate(apt.date)} · {formatTime(apt.time)}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${statusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-1">Quick Actions</h3>
              <p className="text-green-200 text-sm mb-5">Common administrative tasks</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Add Appointment", icon: Calendar, href: "/admin/appointments" },
                  { label: "Patient Records", icon: Users, href: "/admin/patients" },
                  { label: "View Schedule", icon: Clock, href: "/admin/schedule" },
                  { label: "Send Notification", icon: Bell, href: "/admin/notifications" },
                ].map(({ label, icon: Icon, href }) => (
                  <Link key={label} to={href} className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-white transition-all group">
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-center leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
