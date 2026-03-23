import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "patient";
  name: string;
  patientId?: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = `https://${projectId}.supabase.co/functions/v1/make-server-e89e5eb2`;
const HEADERS = { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("medisched_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Login failed" };
      const authUser: AuthUser = { ...data.user, token: data.token };
      setUser(authUser);
      localStorage.setItem("medisched_user", JSON.stringify(authUser));
      return {};
    } catch (err) {
      return { error: `Network error: ${err}` };
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Registration failed" };
      const authUser: AuthUser = { ...data.user, token: data.token };
      setUser(authUser);
      localStorage.setItem("medisched_user", JSON.stringify(authUser));
      return {};
    } catch (err) {
      return { error: `Network error: ${err}` };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("medisched_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
