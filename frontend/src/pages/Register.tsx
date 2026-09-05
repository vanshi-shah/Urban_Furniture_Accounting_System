import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRegister } from "@/hooks/useAuth";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import logo from "@/assets/logo.png";

// Validation schema matching the exact wireframe criteria:
// 1. Login Id should be unique and must be between 6-12 characters
// 2. Email Id should be a valid email format
// 3. Password must contain a small case, a large case, a special character and length must be > 8 characters (min 9 chars or min 8 with all 3 conditions)
const signUpSchema = z
  .object({
    loginId: z
      .string()
      .min(6, "Login Id must be between 6-12 characters")
      .max(12, "Login Id must be between 6-12 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Login Id can only contain letters, numbers, and underscores"),
    email: z
      .string()
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must have more than 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character (!@#$%^&*)"),
    confirmPassword: z
      .string()
      .min(1, "Please re-enter your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      loginId: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    setServerError(null);
    registerMutation.mutate(
      {
        name: data.loginId,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          navigate("/dashboard", { replace: true });
        },
        onError: (err: any) => {
          const message = err.message || "Unable to complete sign up. Email or Login Id may already exist.";
          setServerError(message);
        },
      }
    );
  };

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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-5">
          {/* Card matching the wireframe */}
          <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* Centered App Logo & Title */}
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center p-2.5 shadow-xs">
                <img src={logo} alt="App Logo" className="h-11 w-11 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Sign Up Page
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Create a standard user account in the Modura accounting system
                </p>
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
              {/* Enter Login Id */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="loginId">
                  Enter Login Id -
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="loginId"
                    type="text"
                    placeholder="6 to 12 characters"
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

              {/* Enter Email Id */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="email">
                  Enter Email Id -
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

              {/* Enter Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="password">
                  Enter Password -
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, uppercase, lowercase, special"
                    className={`pl-9 pr-9 bg-background/50 border-border/80 h-10 ${
                      errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                    autoComplete="new-password"
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

              {/* Re-Enter Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="confirmPassword">
                  Re-Enter Password -
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className={`pl-9 bg-background/50 border-border/80 h-10 ${
                      errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Requirements Helper */}
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground">Password criteria:</div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span>Length &gt; 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  <span>Uppercase (A-Z), lowercase (a-z) and special character</span>
                </div>
              </div>

              {/* SIGN UP Button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-bold tracking-wider uppercase bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition-all mt-3"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating User Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    SIGN UP
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Bottom Redirect */}
            <div className="mt-6 pt-4 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:underline underline-offset-4 ml-1"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Security Assurance */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>Standard invoicing user account created upon signup</span>
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
