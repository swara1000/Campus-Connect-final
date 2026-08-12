import { Navigate, Outlet } from "react-router-dom";

// Ported from the Admin project. Guards every /admin/* route and bounces
// back to the login screen if there is no stored admin session token.
export default function AdminProtectedRoute() {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
