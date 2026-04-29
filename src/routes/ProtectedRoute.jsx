import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDefaultPathForRole } from "./routeConfig";

export default function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-10 text-center text-stone-500">Loading account...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to={getDefaultPathForRole(user?.role)} replace />;
  }

  return children;
}
