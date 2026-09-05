import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types/auth";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

/**
 * RoleRoute — renders children only if the authenticated user's role
 * is in the `allowedRoles` list. Otherwise redirects to /unauthorized.
 */
export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-md animate-pulse">
            UF
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Verifying access...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role as UserRole;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
