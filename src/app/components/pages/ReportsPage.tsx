import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, Users, Calendar, CheckCircle,
  XCircle, Clock, Loader, Download, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { AdminLayout } from "../layout/AdminSidebar";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const COLORS = ["#16a34a", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"];

export function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/patient"); return; }
    loadReport();
  }, [user]);

  const loadReport = async () => {
    setLoading(true);
    try { setSummary(await apiFetch("/reports/summary")); }
    catch { toast.error("Failed to load reports"); }
    finally { setLoading(false); }
  };

  const monthlyData = summary?.monthly
    ? Object.entries(summary.monthly).map(([k, v]) => ({
        month: new Date(k + "-01").toLocaleDateString("en-PH", { month: "short", year: "2-digit" }),
        appointments: v,
      }))
    : [];

  const statusData = summary?.byStatus
    ? Object.entries(summary.byStatus).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), value,
      }))
    : [];

  const typeData = summary?.byType
    ? Object.entries(summary.byType)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 6)
    : [];

  const kpiCards = summary ? [
    { label: "Total Appointments", value: summary.totalAppointments, icon: Calendar, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { label: "Total Patients", value: summary.totalPatients, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "SMS Sent", value: summary.totalNotifications, icon: Activity, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
    { label: "This Month", value: summary.monthAppointments, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "Confirmed", value: summary.byStatus?.confirmed || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { label: "Pending", value: summary.byStatus?.pending || 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
    { label: "Completed", value: summary.byStatus?.completed || 0, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Cancelled", value: summary.byStatus?.cancelled || 0, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  ] : [];

  const completionRate = summary
    ? Math.round(((summary.byStatus?.completed || 0) / Math.max(summary.totalAppointments, 1)) * 100)
    : 0;

  const cancellationRate = summary
    ? Math.round(((summary.byStatus?.cancelled || 0) / Math.max(summary.totalAppointments, 1)) * 100)
    : 0;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-500 text-sm">Performance overview for Samuel P. Dizon Medical Clinic</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadReport} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              <Activity className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => toast.info("Export feature coming soon!")} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-10 h-10 text-green-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {kpiCards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white border ${border} rounded-2xl p-4`}
                >
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Performance Indicators */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Completion Rate", value: completionRate, color: "text-green-600", bg: "bg-green-600", track: "bg-green-100" },
                { label: "Cancellation Rate", value: cancellationRate, color: "text-red-500", bg: "bg-red-500", track: "bg-red-100" },
                { label: "Confirmation Rate", value: Math.round(((summary?.byStatus?.confirmed || 0) / Math.max(summary?.totalAppointments, 1)) * 100), color: "text-blue-600", bg: "bg-blue-600", track: "bg-blue-100" },
              ].map(({ label, value, color, bg, track }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className={`text-xl font-extrabold ${color}`}>{value}%</p>
                  </div>
                  <div className={`w-full ${track} rounded-full h-2`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`${bg} h-2 rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Monthly Trend */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Monthly Appointment Trend</h3>
                    <p className="text-xs text-gray-400">Last 6 months</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-green-500" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                    <YAxis tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                    <Tooltip contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                    <Area type="monotone" dataKey="appointments" stroke="#16a34a" strokeWidth={2.5} fill="url(#greenGrad)" dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">By Status</h3>
                    <p className="text-xs text-gray-400">All time</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {statusData.map(({ name, value }, i) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs font-medium text-gray-600">{name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{value as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Type Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Appointments by Service Type</h3>
                  <p className="text-xs text-gray-400">Top services requested</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fontFamily: "Montserrat" }} />
                  <Tooltip contentStyle={{ fontFamily: "Montserrat", fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="value" name="Appointments" radius={[0, 6, 6, 0]}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Footer Note */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Report generated on {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p className="text-xs text-green-600 mt-0.5">All data is sourced from the MediSched database. Use Export to download a PDF copy.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
