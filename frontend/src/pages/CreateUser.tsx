import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo.png";

const createUserSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    loginId: z
      .string()
      .min(6, "Login Id must be between 6-12 characters")
      .max(12, "Login Id must be between 6-12 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Login Id can only contain letters, numbers, and underscores"),
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["USER", "ACCOUNTANT", "ADMIN"]),
    password: z
      .string()
      .min(8, "Password must have more than 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character (!@#$%^&*)"),
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function CreateUser() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      loginId: "",
      email: "",
      role: "USER",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: CreateUserFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      // Create user via backend auth/register or master user endpoint
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        })
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/contacts");
      }, 1500);
    } catch (err: any) {
      const message = err.message || "Unable to create user. Email or Login Id may already be in use.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Centered App Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6 pb-4 border-b border-border/60">
          <div className="h-16 w-16 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center p-2.5 shadow-xs">
            <img src={logo} alt="App Logo" className="h-11 w-11 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create User
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Provision internal team credentials and role permissions
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <Alert className="mb-5 bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold ml-2">
              User account successfully created! Redirecting...
            </AlertDescription>
          </Alert>
        )}

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
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="name">
              Name -
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Full Name (e.g. Alex Morgan)"
                className={`pl-9 bg-background/50 border-border/80 h-10 ${
                  errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Login Id */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="loginId">
              Login Id -
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="loginId"
                type="text"
                placeholder="Unique Login Id (6-12 characters)"
                className={`pl-9 bg-background/50 border-border/80 h-10 ${
                  errors.loginId ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                {...register("loginId")}
              />
            </div>
            {errors.loginId && (
              <p className="text-xs text-destructive mt-1">{errors.loginId.message}</p>
            )}
          </div>

          {/* Email Id */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="email">
              Email Id -
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
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground">
              Role -
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Role: User */}
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "USER"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border/80 bg-background/40 text-muted-foreground hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="USER"
                    className="text-primary focus:ring-primary h-3.5 w-3.5"
                    {...register("role")}
                  />
                  <span className="text-xs font-bold text-foreground">User</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
                  Portal client / Invoicing user. Can view paid/unpaid status and pay dues directly.
                </p>
              </label>

              {/* Role: Accountant */}
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "ACCOUNTANT"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border/80 bg-background/40 text-muted-foreground hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="ACCOUNTANT"
                    className="text-primary focus:ring-primary h-3.5 w-3.5"
                    {...register("role")}
                  />
                  <span className="text-xs font-bold text-foreground">Accountant</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
                  Manage master data, post journal entries, invoices, bills, payments &amp; financial reports.
                </p>
              </label>

              {/* Role: Administrator */}
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "ADMIN"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border/80 bg-background/40 text-muted-foreground hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="ADMIN"
                    className="text-primary focus:ring-primary h-3.5 w-3.5"
                    {...register("role")}
                  />
                  <span className="text-xs font-bold text-foreground">Administrator</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
                  Full system oversight, chart of accounts governance, user roles, and security audit.
                </p>
              </label>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="password">
              Password -
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
                placeholder="Re-enter password"
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

          {/* Action Buttons: Create and Cancel */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <Button
              type="submit"
              className="h-11 font-bold text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-95 shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-11 font-bold text-xs uppercase tracking-wider border-border/80 hover:bg-secondary/80"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
