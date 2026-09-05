import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import logo from "@/assets/logo.png";

const registerSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid business email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms of service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: true,
    },
  });

  const acceptTerms = watch("acceptTerms");

  const onSubmit = (data: RegisterFormData) => {
    setServerError(null);
    registerMutation.mutate(
      {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          navigate("/dashboard", { replace: true });
        },
        onError: (err: any) => {
          const message =
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Unable to complete registration. Email may already be registered.";
          setServerError(message);
        },
      }
    );
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
                Create Team Account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join Urban Furniture&apos;s financial and inventory management system.
              </p>
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
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Anaya Sharma"
                    className={`pl-9 bg-background/50 border-border/80 h-10 ${
                      errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                    autoComplete="name"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

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
                <label className="text-xs font-medium text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
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

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="confirmPassword">
                  Confirm Password
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

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2 pt-1">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setValue("acceptTerms", checked === true)}
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-xs font-normal text-muted-foreground leading-snug cursor-pointer"
                >
                  I agree to the Urban Furniture accounting governance policies and double-entry auditing guidelines.
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs text-destructive mt-0.5">{errors.acceptTerms.message}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold tracking-wide bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition-all mt-2"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Bottom Redirect */}
            <div className="mt-6 pt-5 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:underline underline-offset-4 ml-1"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Role Governance Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>New accounts are assigned standard employee permissions by default</span>
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
