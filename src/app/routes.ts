import { createBrowserRouter } from "react-router";
import { Root } from "./components/layout/Root";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginPage } from "./components/pages/LoginPage";
import { BookAppointment } from "./components/pages/BookAppointment";
import { PatientPortal } from "./components/pages/PatientPortal";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { AppointmentsPage } from "./components/pages/AppointmentsPage";
import { PatientRecordsPage } from "./components/pages/PatientRecordsPage";
import { SchedulePage } from "./components/pages/SchedulePage";
import { ReportsPage } from "./components/pages/ReportsPage";
import { NotificationsPage } from "./components/pages/NotificationsPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { NotFoundPage } from "./components/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "book", Component: BookAppointment },
      { path: "patient", Component: PatientPortal },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/appointments", Component: AppointmentsPage },
      { path: "admin/patients", Component: PatientRecordsPage },
      { path: "admin/schedule", Component: SchedulePage },
      { path: "admin/reports", Component: ReportsPage },
      { path: "admin/notifications", Component: NotificationsPage },
      { path: "admin/settings", Component: SettingsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
