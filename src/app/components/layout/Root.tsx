import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import { Toaster } from "sonner";

function RouteGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Store for use by child components; actual route guarding is done in each page
  return <Outlet />;
}

export function Root() {
  return (
    <AuthProvider>
      <div className="font-[Montserrat]">
        <RouteGuard />
        <Toaster position="top-right" richColors closeButton />
      </div>
    </AuthProvider>
  );
}
