import { projectId, publicAnonKey } from "/utils/supabase/info";

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e89e5eb2`;

// Mock data for demo purposes when backend is unavailable
const MOCK_DATA: Record<string, any> = {
  "/schedule": {
    monday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    tuesday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    wednesday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    thursday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    friday: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    saturday: [],
    sunday: [],
  },
  "/appointments": [],
  "/notifications": [],
  "/patients": [
    { id: "pat_001", name: "Juan dela Cruz", email: "patient@example.com", phone: "+639171234567", dob: "1990-01-15", gender: "Male", address: "123 Main St, Manila", bloodType: "O+", allergies: "None", medicalHistory: ["Hypertension"], lastVisit: "2026-03-20", createdAt: "2025-06-01T08:00:00Z" },
  ],
};

export function apiHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || publicAnonKey}`,
  };
}

export async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...apiHeaders(token), ...(options.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    // Fallback to mock data for demo purposes
    const basePath = path.split("?")[0]; // Remove query params
    if (MOCK_DATA[basePath] !== undefined) {
      return MOCK_DATA[basePath];
    }
    throw err;
  }
}
