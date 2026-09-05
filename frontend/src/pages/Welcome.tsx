import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  ShieldCheck,
  Scale,
  Compass,
  Layers,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import logo from "@/assets/logo.png";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const loginMutation = useLogin();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("USER");


  useEffect(() => {
    // Check if user has previously visited or stored session info
    const token = localStorage.getItem("token");
    const remembered = localStorage.getItem("last_active_user");
    if (token || remembered || isAuthenticated) {
      setIsReturningUser(true);
    }
  }, [isAuthenticated]);



  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Ambient background visual glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft radial glow top-center */}
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[750px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        {/* Warm accent glow bottom-right */}
        <div className="absolute -bottom-[20%] right-[10%] w-[500px] h-[450px] bg-accent/10 rounded-full blur-[100px] animate-float-delayed" />
        {/* Subtle grid pattern overlay */}
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
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md group-hover:scale-125 transition-transform duration-300" />
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
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-primary/15 text-primary border border-primary/25">
                Financial OS
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block tracking-normal">
              Urban Furniture Accounting &amp; Ledger
            </p>
          </div>
        </div>

        {/* Right Header Navigation & Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle variant="segmented" />

          {isAuthenticated ? (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:opacity-90 font-medium px-4 shadow-sm text-xs h-9 rounded-xl flex items-center gap-1.5"
              onClick={() => navigate(user?.role === "USER" ? "/my-invoices" : "/dashboard")}
            >
              <span>{user?.role === "USER" ? "My Invoices" : "Dashboard"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex border-border/80 hover:bg-secondary/70 text-xs h-9 rounded-xl font-medium px-4"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Welcome Experience */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 z-10">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center space-y-8">
          
          {/* Animated Brand Emblem & Aura */}
          <div className="relative group">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl opacity-80 group-hover:opacity-100 animate-spin-slow" />
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-card border border-border/80 shadow-xl flex items-center justify-center p-3 transition-transform duration-500 hover:scale-105">
              <img
                src={logo}
                alt="Modura Emblem"
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-sm"
              />
            </div>
          </div>

          {/* Dynamic Welcome Heading */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/80 border border-border text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span>{isReturningUser ? `${getTimeGreeting()} • Returning Session` : "Quiet Luxury • Double-Entry Precision"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {isReturningUser ? (
                <>
                  Welcome back to <span className="shimmer-text">Modura</span>
                </>
              ) : (
                <>
                  Welcome to <span className="shimmer-text">Modura</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              The dedicated double-entry accounting engine and real-time financial ledger designed exclusively for urban furniture design ateliers.
            </p>
          </div>

          {/* Authenticated State Quick Banner */}
          {isAuthenticated ? (
            <div className="w-full max-w-md p-5 rounded-2xl bg-card border border-border/80 shadow-md space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Active session as {user?.email || "User"}</span>
              </div>
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:opacity-95 font-semibold text-sm h-12 rounded-xl shadow-md flex items-center justify-center gap-2"
                onClick={() => navigate(user?.role === "USER" ? "/my-invoices" : "/dashboard")}
              >
                <span>{user?.role === "USER" ? "View My Invoices" : "Enter Modura Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            /* Unauthenticated Primary Actions Container */
            <div className="w-full max-w-md space-y-4">
              {/* Primary Dual Actions: Sign In / Create Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:opacity-95 font-semibold text-sm h-12 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Ledger</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-card hover:bg-secondary/70 border-border/90 text-foreground font-semibold text-sm h-12 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px]"
                  onClick={() => navigate("/register", { state: { role: selectedRole } })}
                >
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span>Create Account</span>
                </Button>
              </div>

              {/* Role Selection for New Account */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2 text-center">Select role for new account:</p>
                <div className="flex items-center justify-center gap-2">
                  {["USER", "ADMIN", "ACCOUNTANT"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        selectedRole === role
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary"
                      }`}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>


            </div>
          )}

          {/* Floating Key Pillars / Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border/60 text-xs font-medium text-muted-foreground shadow-xs">
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>Double-Entry Balanced Ledger</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border/60 text-xs font-medium text-muted-foreground shadow-xs">
              <Layers className="h-3.5 w-3.5 text-accent" />
              <span>Furniture BOM &amp; Stock Valuation</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 border border-border/60 text-xs font-medium text-muted-foreground shadow-xs">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Financial Health &amp; Analytics</span>
            </div>
          </div>

          {/* Security & Audit Assurance */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>Bank-grade Double-Entry Ledger Security • Role-Governed Access</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full py-4 px-6 border-t border-border/40 text-center text-xs text-muted-foreground backdrop-blur-sm z-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Modura Accounting System • Quiet Luxury &amp; Financial Precision</span>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <span>•</span>
            <Link to="/register" className="hover:text-foreground transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
