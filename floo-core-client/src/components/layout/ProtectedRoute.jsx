import { Navigate } from "react-router-dom";
import { getRole, isLoggedIn } from "../../utils/auth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const role = getRole();

  if (!isLoggedIn()) {
    return <Navigate to="/" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
