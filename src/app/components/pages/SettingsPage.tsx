import { useState } from "react";
import { User, Lock, Bell, Shield, Save } from "lucide-react";
import { AdminLayout } from "../layout/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"profile" | "notifications" | "security">("profile");
  const [reminderHours, setReminderHours] = useState(24);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ] as const;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm">Manage clinic and account settings</p>
        </div>

        <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-full sm:w-auto sm:inline-flex">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none justify-center ${tab === id ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-white font-extrabold text-2xl">
                {user?.name?.[0] || "A"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
                <p className="text-green-600 text-sm font-semibold capitalize">{user?.role}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Clinic Name</label>
                <input defaultValue="Samuel P. Dizon Medical Clinic" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Number</label>
                  <input defaultValue="(02) 8123-4567" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input defaultValue="info@spdclinic.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                <textarea defaultValue="123 Magsaysay Blvd., Quezon City, Metro Manila" rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <button onClick={() => toast.success("Profile saved!")} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-gray-900">Notification Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reminder Lead Time</label>
                <div className="flex gap-2">
                  {[12, 24, 48].map((h) => (
                    <button key={h} onClick={() => setReminderHours(h)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${reminderHours === h ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}>
                      {h} hrs
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => toast.success("Notification settings saved!")} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-gray-900">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-semibold text-green-800">Access Control</p>
                </div>
                <p className="text-xs text-green-700">Patient records are accessible only to credentialed personnel with admin privileges. All data is encrypted in transit.</p>
              </div>
              <button onClick={() => toast.success("Password updated successfully!")} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
                <Save className="w-4 h-4" /> Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
