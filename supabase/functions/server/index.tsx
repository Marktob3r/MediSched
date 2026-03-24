import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ─── KV Keys ────────────────────────────────────────────────
const USERS_KEY = "medisched:users";
const PATIENTS_KEY = "medisched:patients";
const APPOINTMENTS_KEY = "medisched:appointments";
const NOTIFICATIONS_KEY = "medisched:notifications";
const SCHEDULE_KEY = "medisched:schedule";

// ─── Seed Data ───────────────────────────────────────────────
const SEED_USERS = [
  { id: "usr_admin001", email: "admin@spdclinic.com", password: "admin123", role: "admin", name: "Admin User" },
  { id: "usr_pat001", email: "patient@example.com", password: "patient123", role: "patient", name: "Juan dela Cruz", patientId: "pat_001" },
];

const SEED_PATIENTS = [
  { id: "pat_001", name: "Juan dela Cruz", email: "patient@example.com", phone: "+639171234567", dob: "1990-05-15", gender: "Male", address: "123 Rizal St., Quezon City", bloodType: "O+", allergies: "Penicillin", medicalHistory: ["Hypertension", "Diabetes Type 2"], lastVisit: "2026-03-10", createdAt: "2025-01-15T08:00:00Z" },
  { id: "pat_002", name: "Maria Santos", email: "maria.santos@gmail.com", phone: "+639289876543", dob: "1985-11-23", gender: "Female", address: "45 Mabini Ave., Pasig City", bloodType: "A+", allergies: "None", medicalHistory: ["Asthma"], lastVisit: "2026-03-15", createdAt: "2025-02-10T09:00:00Z" },
  { id: "pat_003", name: "Roberto Reyes", email: "rob.reyes@yahoo.com", phone: "+639501112233", dob: "1975-03-08", gender: "Male", address: "78 Luna St., Marikina City", bloodType: "B-", allergies: "Aspirin, Sulfa drugs", medicalHistory: ["Hypertension", "Arthritis"], lastVisit: "2026-02-28", createdAt: "2025-03-05T10:00:00Z" },
  { id: "pat_004", name: "Ana Reyes", email: "ana.reyes@gmail.com", phone: "+639175556677", dob: "1998-07-19", gender: "Female", address: "22 Bonifacio Rd., Taguig City", bloodType: "AB+", allergies: "Latex", medicalHistory: [], lastVisit: "2026-03-20", createdAt: "2025-04-12T11:00:00Z" },
  { id: "pat_005", name: "Carlos Mendoza", email: "cmendoza@gmail.com", phone: "+639264449988", dob: "1965-12-30", gender: "Male", address: "99 Aguilar St., Caloocan City", bloodType: "O-", allergies: "Ibuprofen", medicalHistory: ["Diabetes Type 2", "Heart Disease"], lastVisit: "2026-03-18", createdAt: "2025-05-20T12:00:00Z" },
  { id: "pat_006", name: "Liza Garcia", email: "liza.garcia@hotmail.com", phone: "+639381112244", dob: "1993-04-05", gender: "Female", address: "55 Osmena Blvd., Cebu City", bloodType: "A-", allergies: "None", medicalHistory: ["Migraine"], lastVisit: "2026-03-12", createdAt: "2025-06-01T08:30:00Z" },
];

const SEED_APPOINTMENTS = [
  { id: "apt_001", patientId: "pat_001", patientName: "Juan dela Cruz", date: "2026-03-25", time: "09:00", type: "General Consultation", doctor: "Dr. Samuel P. Dizon", status: "confirmed", notes: "Follow-up for hypertension", phone: "+639171234567", createdAt: "2026-03-20T08:00:00Z" },
  { id: "apt_002", patientId: "pat_002", patientName: "Maria Santos", date: "2026-03-25", time: "10:00", type: "Prenatal Check-up", doctor: "Dr. Samuel P. Dizon", status: "confirmed", notes: "", phone: "+639289876543", createdAt: "2026-03-21T09:00:00Z" },
  { id: "apt_003", patientId: "pat_003", patientName: "Roberto Reyes", date: "2026-03-25", time: "11:00", type: "Physical Examination", doctor: "Dr. Samuel P. Dizon", status: "pending", notes: "Annual PE for work", phone: "+639501112233", createdAt: "2026-03-22T10:00:00Z" },
  { id: "apt_004", patientId: "pat_004", patientName: "Ana Reyes", date: "2026-03-26", time: "09:30", type: "General Consultation", doctor: "Dr. Samuel P. Dizon", status: "confirmed", notes: "Skin rash complaint", phone: "+639175556677", createdAt: "2026-03-22T11:00:00Z" },
  { id: "apt_005", patientId: "pat_005", patientName: "Carlos Mendoza", date: "2026-03-26", time: "14:00", type: "Diabetes Management", doctor: "Dr. Samuel P. Dizon", status: "pending", notes: "3-month diabetes review", phone: "+639264449988", createdAt: "2026-03-23T07:00:00Z" },
  { id: "apt_006", patientId: "pat_006", patientName: "Liza Garcia", date: "2026-03-24", time: "10:30", type: "General Consultation", doctor: "Dr. Samuel P. Dizon", status: "completed", notes: "Migraine treatment", phone: "+639381112244", createdAt: "2026-03-18T14:00:00Z" },
  { id: "apt_007", patientId: "pat_001", patientName: "Juan dela Cruz", date: "2026-03-10", time: "09:00", type: "Follow-up", doctor: "Dr. Samuel P. Dizon", status: "completed", notes: "BP monitoring", phone: "+639171234567", createdAt: "2026-03-05T08:00:00Z" },
  { id: "apt_008", patientId: "pat_003", patientName: "Roberto Reyes", date: "2026-03-27", time: "15:00", type: "Laboratory Request", doctor: "Dr. Samuel P. Dizon", status: "confirmed", notes: "CBC and lipid panel", phone: "+639501112233", createdAt: "2026-03-23T09:00:00Z" },
];

const SEED_NOTIFICATIONS = [];

const SEED_SCHEDULE = {
  workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startTime: "08:00",
  endTime: "17:00",
  slotDurationMinutes: 60,
  breakStart: "12:00",
  breakEnd: "13:00",
  maxPatientsPerDay: 20,
};

async function initData() {
  try {
    const users = await kv.get(USERS_KEY);
    if (!users) await kv.set(USERS_KEY, SEED_USERS);

    const patients = await kv.get(PATIENTS_KEY);
    if (!patients) await kv.set(PATIENTS_KEY, SEED_PATIENTS);

    const appointments = await kv.get(APPOINTMENTS_KEY);
    if (!appointments) await kv.set(APPOINTMENTS_KEY, SEED_APPOINTMENTS);

    const notifications = await kv.get(NOTIFICATIONS_KEY);
    if (!notifications) await kv.set(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);

    const schedule = await kv.get(SCHEDULE_KEY);
    if (!schedule) await kv.set(SCHEDULE_KEY, SEED_SCHEDULE);

    console.log("MediSched data initialized successfully");
  } catch (err) {
    console.log("Error initializing data:", err);
  }
}

initData();

// ─── Health Check ────────────────────────────────────────────
app.get("/make-server-e89e5eb2/health", (c) => c.json({ status: "ok", app: "MediSched" }));

// ─── AUTH ────────────────────────────────────────────────────
app.post("/make-server-e89e5eb2/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const users: any[] = (await kv.get(USERS_KEY)) || SEED_USERS;
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) return c.json({ error: "Invalid email or password" }, 401);
    const { password: _, ...safeUser } = user;
    return c.json({ user: safeUser, token: `token_${user.id}_${Date.now()}` });
  } catch (err) {
    console.log("Login error:", err);
    return c.json({ error: `Login failed: ${err}` }, 500);
  }
});

app.post("/make-server-e89e5eb2/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const users: any[] = (await kv.get(USERS_KEY)) || [];
    const exists = users.find((u: any) => u.email === body.email);
    if (exists) return c.json({ error: "Email already registered" }, 409);

    const patients: any[] = (await kv.get(PATIENTS_KEY)) || [];
    const patientId = `pat_${Date.now()}`;
    const newPatient = { id: patientId, name: body.name, email: body.email, phone: body.phone || "", dob: "", gender: "", address: "", bloodType: "", allergies: "None", medicalHistory: [], lastVisit: null, createdAt: new Date().toISOString() };
    patients.push(newPatient);
    await kv.set(PATIENTS_KEY, patients);

    const userId = `usr_${Date.now()}`;
    const newUser = { id: userId, email: body.email, password: body.password, role: "patient", name: body.name, patientId };
    users.push(newUser);
    await kv.set(USERS_KEY, users);

    const { password: _, ...safeUser } = newUser;
    return c.json({ user: safeUser, token: `token_${userId}_${Date.now()}` }, 201);
  } catch (err) {
    console.log("Register error:", err);
    return c.json({ error: `Registration failed: ${err}` }, 500);
  }
});

// ─── APPOINTMENTS ────────────────────────────────────────────
app.get("/make-server-e89e5eb2/appointments", async (c) => {
  try {
    const appointments: any[] = (await kv.get(APPOINTMENTS_KEY)) || [];
    const patientId = c.req.query("patientId");
    const date = c.req.query("date");
    let result = appointments;
    if (patientId) result = result.filter((a: any) => a.patientId === patientId);
    if (date) result = result.filter((a: any) => a.date === date);
    return c.json(result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (err) {
    console.log("Get appointments error:", err);
    return c.json({ error: `Failed to fetch appointments: ${err}` }, 500);
  }
});

app.post("/make-server-e89e5eb2/appointments", async (c) => {
  try {
    const body = await c.req.json();
    const appointments: any[] = (await kv.get(APPOINTMENTS_KEY)) || [];
    // Check for double-booking
    const conflict = appointments.find((a: any) => a.date === body.date && a.time === body.time && a.status !== "cancelled");
    if (conflict) return c.json({ error: "This time slot is already booked. Please choose another time." }, 409);

    const newApt = { id: `apt_${Date.now()}`, ...body, status: "pending", createdAt: new Date().toISOString() };
    appointments.push(newApt);
    await kv.set(APPOINTMENTS_KEY, appointments);

    // Note: SMS notifications removed - use email instead

    return c.json(newApt, 201);
  } catch (err) {
    console.log("Create appointment error:", err);
    return c.json({ error: `Failed to create appointment: ${err}` }, 500);
  }
});

app.put("/make-server-e89e5eb2/appointments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const appointments: any[] = (await kv.get(APPOINTMENTS_KEY)) || [];
    const idx = appointments.findIndex((a: any) => a.id === id);
    if (idx === -1) return c.json({ error: "Appointment not found" }, 404);
    appointments[idx] = { ...appointments[idx], ...body, id };
    await kv.set(APPOINTMENTS_KEY, appointments);

    // Send status notification if status changed
    if (body.status && body.status !== appointments[idx].status) {
      // Note: SMS notifications removed - use email instead
    }
    return c.json(appointments[idx]);
  } catch (err) {
    console.log("Update appointment error:", err);
    return c.json({ error: `Failed to update appointment: ${err}` }, 500);
  }
});

app.delete("/make-server-e89e5eb2/appointments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const appointments: any[] = (await kv.get(APPOINTMENTS_KEY)) || [];
    const filtered = appointments.filter((a: any) => a.id !== id);
    await kv.set(APPOINTMENTS_KEY, filtered);
    return c.json({ success: true });
  } catch (err) {
    console.log("Delete appointment error:", err);
    return c.json({ error: `Failed to delete appointment: ${err}` }, 500);
  }
});

// ─── PATIENTS ────────────────────────────────────────────────
app.get("/make-server-e89e5eb2/patients", async (c) => {
  try {
    const patients: any[] = (await kv.get(PATIENTS_KEY)) || [];
    return c.json(patients.sort((a: any, b: any) => a.name.localeCompare(b.name)));
  } catch (err) {
    return c.json({ error: `Failed to fetch patients: ${err}` }, 500);
  }
});

app.get("/make-server-e89e5eb2/patients/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const patients: any[] = (await kv.get(PATIENTS_KEY)) || [];
    const patient = patients.find((p: any) => p.id === id);
    if (!patient) return c.json({ error: "Patient not found" }, 404);
    return c.json(patient);
  } catch (err) {
    return c.json({ error: `Failed to fetch patient: ${err}` }, 500);
  }
});

app.post("/make-server-e89e5eb2/patients", async (c) => {
  try {
    const body = await c.req.json();
    const patients: any[] = (await kv.get(PATIENTS_KEY)) || [];
    const newPatient = { id: `pat_${Date.now()}`, ...body, createdAt: new Date().toISOString() };
    patients.push(newPatient);
    await kv.set(PATIENTS_KEY, patients);
    return c.json(newPatient, 201);
  } catch (err) {
    return c.json({ error: `Failed to create patient: ${err}` }, 500);
  }
});

app.put("/make-server-e89e5eb2/patients/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const patients: any[] = (await kv.get(PATIENTS_KEY)) || [];
    const idx = patients.findIndex((p: any) => p.id === id);
    if (idx === -1) return c.json({ error: "Patient not found" }, 404);
    patients[idx] = { ...patients[idx], ...body, id };
    await kv.set(PATIENTS_KEY, patients);
    return c.json(patients[idx]);
  } catch (err) {
    return c.json({ error: `Failed to update patient: ${err}` }, 500);
  }
});

app.delete("/make-server-e89e5eb2/patients/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const patients: any[] = (await kv.get(PATIENTS_KEY)) || [];
    const filtered = patients.filter((p: any) => p.id !== id);
    await kv.set(PATIENTS_KEY, filtered);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: `Failed to delete patient: ${err}` }, 500);
  }
});

// ─── NOTIFICATIONS ───────────────────────────────────────────
app.get("/make-server-e89e5eb2/notifications", async (c) => {
  try {
    const notifications: any[] = (await kv.get(NOTIFICATIONS_KEY)) || [];
    const patientId = c.req.query("patientId");
    let result = notifications;
    if (patientId) result = result.filter((n: any) => n.patientId === patientId);
    return c.json(result.sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
  } catch (err) {
    return c.json({ error: `Failed to fetch notifications: ${err}` }, 500);
  }
});

app.post("/make-server-e89e5eb2/notifications/send", async (c) => {
  try {
    const body = await c.req.json();
    const notifications: any[] = (await kv.get(NOTIFICATIONS_KEY)) || [];
    const notif = { id: `notif_${Date.now()}`, ...body, status: "sent", sentAt: new Date().toISOString() };
    notifications.push(notif);
    await kv.set(NOTIFICATIONS_KEY, notifications);
    return c.json(notif, 201);
  } catch (err) {
    return c.json({ error: `Failed to send notification: ${err}` }, 500);
  }
});

// ─── SCHEDULE ────────────────────────────────────────────────
app.get("/make-server-e89e5eb2/schedule", async (c) => {
  try {
    const schedule = (await kv.get(SCHEDULE_KEY)) || SEED_SCHEDULE;
    return c.json(schedule);
  } catch (err) {
    return c.json({ error: `Failed to fetch schedule: ${err}` }, 500);
  }
});

app.put("/make-server-e89e5eb2/schedule", async (c) => {
  try {
    const body = await c.req.json();
    const schedule = (await kv.get(SCHEDULE_KEY)) || SEED_SCHEDULE;
    const updated = { ...schedule, ...body };
    await kv.set(SCHEDULE_KEY, updated);
    return c.json(updated);
  } catch (err) {
    return c.json({ error: `Failed to update schedule: ${err}` }, 500);
  }
});

// ─── REPORTS ─────────────────────────────────────────────────
app.get("/make-server-e89e5eb2/reports/summary", async (c) => {
  try {
    const appointments: any[] = (await kv.get(APPOINTMENTS_KEY)) || [];
    const patients: any[] = (await kv.get(PATIENTS_KEY)) || [];
    const notifications: any[] = (await kv.get(NOTIFICATIONS_KEY)) || [];
    const today = new Date().toISOString().split("T")[0];
    const thisMonth = today.substring(0, 7);

    const todayApts = appointments.filter((a: any) => a.date === today);
    const monthApts = appointments.filter((a: any) => a.date.startsWith(thisMonth));

    const byStatus = appointments.reduce((acc: any, a: any) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const byType = appointments.reduce((acc: any, a: any) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});

    // Monthly data (last 6 months)
    const monthly: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().substring(0, 7);
      monthly[key] = appointments.filter((a: any) => a.date.startsWith(key)).length;
    }

    return c.json({
      totalAppointments: appointments.length,
      totalPatients: patients.length,
      totalNotifications: notifications.length,
      todayAppointments: todayApts.length,
      todayPending: todayApts.filter((a: any) => a.status === "pending").length,
      todayConfirmed: todayApts.filter((a: any) => a.status === "confirmed").length,
      monthAppointments: monthApts.length,
      byStatus,
      byType,
      monthly,
    });
  } catch (err) {
    return c.json({ error: `Failed to generate report: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);
