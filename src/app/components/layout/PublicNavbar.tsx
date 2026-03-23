import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Menu, X, HeartPulse} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: "Home", href: "/" },
    // { label: "Book Appointment", href: "/book" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ];

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-green-700 transition-colors">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-green-800 text-sm leading-tight block">MediSched</span>
              <span className="text-green-600 text-xs font-medium">SPD Medical Clinic</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${location.pathname === link.href ? "text-green-600" : "text-gray-600 hover:text-green-600"}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate(user.role === "admin" ? "/admin" : "/patient")}
                  className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                >
                  My Portal
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-green-100 bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-gray-100 mt-2 space-y-2">
                {user ? (
                  <>
                    <button onClick={() => { navigate(user.role === "admin" ? "/admin" : "/patient"); setOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-green-700 hover:bg-green-50">My Portal</button>
                    <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-2 rounded-lg text-sm font-semibold text-green-700 hover:bg-green-50" onClick={() => setOpen(false)}>Login</Link>
                    {/* <Link to="/book" className="block px-3 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white text-center hover:bg-green-700" onClick={() => setOpen(false)}>Book Appointment</Link> */}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
