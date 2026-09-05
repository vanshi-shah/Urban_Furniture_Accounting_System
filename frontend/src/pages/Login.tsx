import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLogin } from "@/hooks/useAuth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
      onError: (err: any) => {
        const message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid email or password. Please try again.";
        setServerError(message);
      },
    });
  };

  const handleQuickDemo = (role: "admin" | "employee") => {
    setServerError(null);
    const email = role === "admin" ? "admin@urbanfurniture.com" : "designer@urbanfurniture.com";
    setValue("email", email);
    setValue("password", "password123");
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background text-foreground selection:bg-primary/20">
      {/* Top Navigation Bar */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Urban Furniture Logo" className="h-9 w-9 object-contain" />
          <div>
            <span className="font-bold text-sm tracking-wider uppercase text-foreground">
              Urban Furniture
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-muted-foreground border-l border-border pl-2">
              Accounting System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">Theme:</span>
          <ThemeToggle variant="segmented" />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Card Wrapper */}
          <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-200">
            {/* Header / Brand Sub-mark */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center p-2.5 rounded-xl bg-secondary/80 text-secondary-foreground mb-2">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Sign in to your ledger
              </h1>
              <p className="text-sm text-muted-foreground">
                Financial clarity and real-time accounting for every piece.
              </p>
            </div>

            {/* Quick Demo Pre-fill Pill */}
            <div className="mb-6 p-3 rounded-xl border border-border/70 bg-secondary/40 space-y-2">
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
                  className="text-xs h-8 justify-center bg-card hover:bg-secondary/80"
                  onClick={() => handleQuickDemo("admin")}
                >
                  Admin Account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 justify-center bg-card hover:bg-secondary/80"
                  onClick={() => handleQuickDemo("employee")}
                >
                  Employee Account
                </Button>
              </div>
            </div>

            {/* Server Error Alert */}
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
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@urbanfurniture.com"
                    className={`pl-9 bg-background/50 border-border/80 h-10 ${
                      errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                    autoComplete="email"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="password">
                    Password
                  </label>
                  <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    Forgot password?
                  </span>
                </div>
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

              {/* Remember Me */}
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="remember" defaultChecked />
                <label
                  htmlFor="remember"
                  className="text-xs font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember this workstation
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold tracking-wide bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition-all mt-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In to Ledger
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Bottom Redirect */}
            <div className="mt-6 pt-5 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an account yet?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-primary hover:underline underline-offset-4 ml-1"
                >
                  Create company account
                </Link>
              </p>
            </div>
          </div>

          {/* Security Assurance Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>Double-entry ledger with encrypted session token</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 border-t border-border/50 text-center text-xs text-muted-foreground">
        © 2026 Urban Furniture Accounting System • Quiet Luxury &amp; Financial Precision
      </footer>
    </div>
  );
}
