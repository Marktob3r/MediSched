import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { HeartPulse, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        const { error: err } = await login(form.email, form.password);
        if (err) { setError(err); return; }
        toast.success("Welcome back!");
        // Redirect based on stored user
        const stored = localStorage.getItem("medisched_user");
        if (stored) {
          const u = JSON.parse(stored);
          navigate(u.role === "admin" ? "/admin" : "/patient");
        }
      } else {
        if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
        const { error: err } = await register(form.name, form.email, "", form.password);
        if (err) { setError(err); return; }
        toast.success("Account created! Welcome to MediSched.");
        navigate("/patient");
      }
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email: string, password: string) => {
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) { toast.error(err); return; }
    toast.success("Demo login successful!");
    const stored = localStorage.getItem("medisched_user");
    if (stored) {
      const u = JSON.parse(stored);
      navigate(u.role === "admin" ? "/admin" : "/patient");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 font-[Montserrat] select-none">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p className="font-extrabold text-green-800 text-xl leading-tight">MediSched</p>
              <p className="text-green-600 text-xs font-medium">SPD Medical Clinic</p>
            </div>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-4 text-sm font-bold transition-all capitalize ${
                  mode === m
                    ? "text-green-700 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                  {mode === "login" ? "Welcome back!" : "Join MediSched"}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {mode === "login" ? "Sign in to access your health portal." : "Create an account to book appointments online."}
                </p>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-red-600 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" name="name" value={form.name} onChange={handleChange}
                          required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                          placeholder="Juan dela Cruz"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" name="email" value={form.email} onChange={handleChange}
                        required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>



                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPwd ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                        required className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                          required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      mode === "login" ? "Sign In" : "Create Account"
                    )}
                  </button>
                </form>

                {mode === "login" && (
                  <>
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs text-gray-400 font-medium">Demo Accounts</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => demoLogin("admin@spdclinic.com", "admin123")}
                        className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-bold py-2.5 rounded-xl transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Admin Demo
                      </button>
                      <button
                        onClick={() => demoLogin("patient@example.com", "patient123")}
                        className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold py-2.5 rounded-xl transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Patient Demo
                      </button>
                    </div>
                  </>
                )}

                <p className="text-center text-xs text-gray-400 mt-5">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-green-600 hover:underline">
                    {mode === "login" ? "Register here" : "Sign in"}
                  </button>
                </p>

                {/* <div className="text-center mt-3">
                  <Link to="/book" className="text-xs text-gray-400 hover:text-green-600 transition-colors">
                    Book without an account →
                  </Link>
                </div> */}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Samuel P. Dizon Medical Clinic · MediSched
        </p>
      </div>
    </div>
  );
}
