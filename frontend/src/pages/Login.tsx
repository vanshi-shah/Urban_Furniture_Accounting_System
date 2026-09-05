import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLogin } from "@/hooks/useAuth";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo.png";

const loginSchema = z.object({
  loginId: z.string().min(1, "Please enter your Login Id or Email"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    loginMutation.mutate(
      { email: data.loginId, password: data.password },
      {
        onSuccess: (userData) => {
          navigate(from || (userData.role === "USER" ? "/my-invoices" : "/dashboard"), { replace: true });
        },
        onError: (err: any) => {
          const message = err.message || "Invalid Login Id or Password";
          setServerError(message.includes("database") ? message : "Invalid Login Id or Password");
        },
      }
    );
  };

  const handleQuickDemo = (role: "admin" | "employee") => {
    setServerError(null);
    const email = role === "admin" ? "admin@urbanfurniture.com" : "designer@urbanfurniture.com";
    setValue("loginId", email);
    setValue("password", "password123");
  };

  useEffect(() => {
    if (location.state?.prefillRole) {
      handleQuickDemo(location.state.prefillRole);
    }
  }, [location.state]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-primary/20">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm z-10">
        <Link to="/welcome" className="flex items-center gap-3 group">
          <img src={logo} alt="Modura Logo" className="h-9 w-9 object-contain group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider uppercase text-foreground">
                Modura
              </span>
              <span className="text-[10px] uppercase font-semibold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                Ledger
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-muted-foreground">
              Urban Furniture Accounting
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/welcome"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block mr-2"
          >
            ← Back to Welcome
          </Link>
          <ThemeToggle variant="segmented" />
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-5">
          {/* Card Wrapper matching the wireframe */}
          <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* Centered App Logo & Title */}
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center p-2.5 shadow-xs">
                <img src={logo} alt="App Logo" className="h-11 w-11 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Login Page
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sign in to access your double-entry accounting workspace
                </p>
              </div>
            </div>

            {/* Quick Demo Pre-fill Box */}
            <div className="mb-5 p-3 rounded-xl border border-border/70 bg-secondary/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Quick Demo Access
                </span>
                <span>Click to auto-fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 justify-center bg-card hover:bg-secondary/80 font-medium"
                  onClick={() => handleQuickDemo("admin")}
                >
                  Admin Account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 justify-center bg-card hover:bg-secondary/80 font-medium"
                  onClick={() => handleQuickDemo("employee")}
                >
                  Employee Account
                </Button>
              </div>
            </div>

            {/* Error Alert */}
            {serverError && (
              <Alert variant="destructive" className="mb-5 bg-destructive/10 border-destructive/30 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium ml-2">
                  {serverError}
                </AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Login Id Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="loginId">
                  Login Id -
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="loginId"
                    type="text"
                    placeholder="Enter your Login Id or Email"
                    className={`pl-9 bg-background/50 border-border/80 h-10 ${
                      errors.loginId ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                    autoComplete="username"
                    {...register("loginId")}
                  />
                </div>
                {errors.loginId && (
                  <p className="text-xs text-destructive mt-1">{errors.loginId.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="password">
                  Password -
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-9 pr-9 bg-background/50 border-border/80 h-10 ${
                      errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                    autoComplete="current-password"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* SIGN IN Button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-bold tracking-wider uppercase bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition-all mt-3"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    SIGN IN
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Bottom Links: Forgot Password | Sign Up */}
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-center gap-3 text-xs">
              <Link
                to="/forgot-password"
                className="font-medium text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Forgot Password
              </Link>
              <span className="text-border">|</span>
              <Link
                to="/signup"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Security Assurance */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>Encrypted Double-Entry Authentication</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-border/50 text-center text-xs text-muted-foreground">
        © 2026 Modura Accounting System • Quiet Luxury &amp; Financial Precision
      </footer>
    </div>
  );
}
