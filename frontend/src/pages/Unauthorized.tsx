import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
        {/* Icon */}
        <div className="h-20 w-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <Shield className="h-10 w-10 text-destructive" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Access Restricted
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You don't have permission to view this page. This area requires a higher access level.
          </p>
        </div>

        {/* Role badge */}
        {user && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/60 text-sm">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              You are signed in as{" "}
              <strong className="text-foreground">{user.name}</strong>
              {" "}with role{" "}
              <span className="font-semibold text-primary">{user.role}</span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button asChild variant="default">
            <Link to={user?.role === "USER" ? "/my-invoices" : "/dashboard"}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {user?.role === "USER" ? "Back to My Invoices" : "Back to Dashboard"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
