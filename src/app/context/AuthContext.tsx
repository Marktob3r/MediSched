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

// Mock users for demo - allows testing without backend
const MOCK_USERS = [
  { id: "admin_001", email: "admin@spdclinic.com", password: "admin123", role: "admin" as const, name: "Dr. Samuel P. Dizon", patientId: undefined },
  { id: "pat_001", email: "patient@example.com", password: "patient123", role: "patient" as const, name: "Juan dela Cruz", patientId: "pat_001" },
];

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
      // Try mock users first (for demo)
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (mockUser) {
        const authUser: AuthUser = {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          name: mockUser.name,
          patientId: mockUser.patientId,
          token: `token_${mockUser.id}_${Date.now()}`,
        };
        setUser(authUser);
        localStorage.setItem("medisched_user", JSON.stringify(authUser));
        return {};
      }

      // Otherwise try backend (for production)
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
      // Try backend first
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
      // Fallback to mock registration for demo
      const patientId = `pat_${Date.now()}`;
      const userId = `usr_${Date.now()}`;
      const authUser: AuthUser = {
        id: userId,
        email,
        role: "patient",
        name,
        patientId,
        token: `token_${userId}_${Date.now()}`,
      };
      setUser(authUser);
      localStorage.setItem("medisched_user", JSON.stringify(authUser));
      return {};
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
