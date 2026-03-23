import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Calendar, Users, ClipboardList, BarChart3,
  MessageSquare, Settings, LogOut, HeartPulse, Menu, X, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Calendar, label: "Appointments", href: "/admin/appointments" },
  { icon: Users, label: "Patient Records", href: "/admin/patients" },
  { icon: ClipboardList, label: "Schedule", href: "/admin/schedule" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: MessageSquare, label: "Notifications", href: "/admin/notifications" },
];

interface Props { children: React.ReactNode; }

export function AdminLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate("/"); };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-green-700/30 ${collapsed && !mobile ? "justify-center" : ""}`}>
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <HeartPulse className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">MediSched</p>
            <p className="text-green-200 text-xs">Admin Panel</p>
          </div>
        )}
      </div>

      {/* User Info */}
      {(!collapsed || mobile) && (
        <div className="px-4 py-3 bg-green-800/30 border-b border-green-700/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name || "Admin"}</p>
              <p className="text-green-300 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              onClick={() => mobile && setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                active
                  ? "bg-white text-green-700 shadow-sm font-semibold"
                  : "text-green-100 hover:bg-white/10 hover:text-white"
              } ${collapsed && !mobile ? "justify-center" : ""}`}
              title={collapsed && !mobile ? label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-green-600" : ""}`} />
              {(!collapsed || mobile) && <span className="text-sm">{label}</span>}
              {active && !collapsed && !mobile && <ChevronRight className="w-4 h-4 ml-auto text-green-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`px-3 py-4 border-t border-green-700/30 space-y-1 ${collapsed && !mobile ? "flex flex-col items-center" : ""}`}>
        <Link
          to="/admin/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-100 hover:bg-white/10 hover:text-white transition-all ${collapsed && !mobile ? "justify-center" : ""}`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all w-full ${collapsed && !mobile ? "justify-center" : ""}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || mobile) && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-[Montserrat]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-green-700 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-green-600 border border-green-500 rounded-r-lg p-1 shadow-md hover:bg-green-500 transition-colors z-10"
          style={{ marginLeft: collapsed ? "72px" : "256px" }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-green-700 z-50 lg:hidden flex flex-col"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-green-50 text-green-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-800 text-sm">MediSched Admin</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0] || "A"}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
