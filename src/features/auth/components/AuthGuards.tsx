import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { continueTo } from "../continueTo";

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status !== "authenticated") {
    const intended = `${location.pathname}${location.search}`;
    const to =
      intended === "/"
        ? "/welcome"
        : `/login?next=${encodeURIComponent(intended)}`;
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
}

export function GuestOnly() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "authenticated") {
    return <Navigate to={continueTo(location.search)} replace />;
  }

  return <Outlet />;
}
