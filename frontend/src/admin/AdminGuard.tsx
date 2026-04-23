import { Navigate } from "react-router-dom";
import { getToken } from "@/api/client";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const t = getToken();
  if (!t) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
