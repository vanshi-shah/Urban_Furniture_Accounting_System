import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, UserCircle, Briefcase, Settings, ShieldCheck, LogIn } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Default to ADMIN as requested
  const [selectedRole, setSelectedRole] = useState<string>("ADMIN");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === "USER" ? "/my-invoices" : "/dashboard");
    }
  }, [isAuthenticated, navigate, user]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background text-foreground selection:bg-primary/20 overflow-x-hidden font-sans">
      {/* Ambient background visual glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[750px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-[20%] right-[10%] w-[500px] h-[450px] bg-accent/10 rounded-full blur-[100px] animate-float-delayed" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative w-full flex items-center justify-between px-6 sm:px-10 py-5 border-b border-border/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative flex items-center justify-center">
            <img
              src={logo}
              alt="Modura Logo"
              className="relative h-10 w-10 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-wider uppercase text-foreground">
                Modura
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block tracking-normal">
              Workspace Setup
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle variant="segmented" />
        </div>
      </header>

      {/* Main Experience */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 z-10">
        <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Select your workspace role</h1>
            <p className="text-sm text-muted-foreground">
              Choose how you will interact with the Modura ledger. You can change this later.
            </p>
          </div>

          <div className="w-full space-y-4">
            {/* Roles Options */}
            
            <div
              onClick={() => setSelectedRole("ADMIN")}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                selectedRole === "ADMIN" 
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" 
                  : "bg-card border-border/50 hover:border-primary/50 hover:bg-secondary/20"
              }`}
            >
              <div className={`p-3 rounded-lg ${selectedRole === "ADMIN" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <Settings className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-sm">System Administrator</h3>
                <p className="text-xs text-muted-foreground">Full access to settings, master data, and user management.</p>
              </div>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedRole === "ADMIN" ? "border-primary" : "border-border"}`}>
                {selectedRole === "ADMIN" && <div className="h-2 w-2 bg-primary rounded-full" />}
              </div>
            </div>

            <div
              onClick={() => setSelectedRole("ACCOUNTANT")}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                selectedRole === "ACCOUNTANT" 
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" 
                  : "bg-card border-border/50 hover:border-primary/50 hover:bg-secondary/20"
              }`}
            >
              <div className={`p-3 rounded-lg ${selectedRole === "ACCOUNTANT" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-sm">Financial Accountant</h3>
                <p className="text-xs text-muted-foreground">Manage journals, ledgers, budgets, and view analytics.</p>
              </div>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedRole === "ACCOUNTANT" ? "border-primary" : "border-border"}`}>
                {selectedRole === "ACCOUNTANT" && <div className="h-2 w-2 bg-primary rounded-full" />}
              </div>
            </div>

            <div
              onClick={() => setSelectedRole("USER")}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                selectedRole === "USER" 
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20" 
                  : "bg-card border-border/50 hover:border-primary/50 hover:bg-secondary/20"
              }`}
            >
              <div className={`p-3 rounded-lg ${selectedRole === "USER" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <UserCircle className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-sm">Standard User</h3>
                <p className="text-xs text-muted-foreground">View invoices, submit requests, and handle basic sales tasks.</p>
              </div>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedRole === "USER" ? "border-primary" : "border-border"}`}>
                {selectedRole === "USER" && <div className="h-2 w-2 bg-primary rounded-full" />}
              </div>
            </div>

          </div>

          <div className="w-full pt-4 space-y-4">
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:opacity-95 font-semibold text-sm h-12 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              onClick={() => navigate("/register", { state: { role: selectedRole } })}
            >
              <span>Continue to Sign Up</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <p className="text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-foreground hover:underline inline-flex items-center gap-1">
                Log in here <LogIn className="h-3 w-3" />
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-4">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>Role-Governed Access Enforced</span>
          </div>
        </div>
      </main>

      <footer className="relative w-full py-6 text-center text-xs text-muted-foreground z-20">
        © 2026 Modura Accounting System
      </footer>
    </div>
  );
}
