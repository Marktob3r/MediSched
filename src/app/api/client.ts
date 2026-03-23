import { projectId, publicAnonKey } from "/utils/supabase/info";

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e89e5eb2`;

export function apiHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || publicAnonKey}`,
  };
}

export async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...apiHeaders(token), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
