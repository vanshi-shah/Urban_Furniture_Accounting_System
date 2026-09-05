import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  User,
  Mail,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import logo from "@/assets/logo.png";

const forgotSchema = z.object({
  identifier: z.string().min(1, "Please enter your Login Id or Email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = () => {
    setIsSubmitted(true);
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
            to="/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block mr-2"
          >
            ← Back to Sign In
          </Link>
          <ThemeToggle variant="segmented" />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-5">
          <div className="bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Centered App Logo & Title */}
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center p-2.5 shadow-xs">
                <img src={logo} alt="App Logo" className="h-11 w-11 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Forgot Password
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter your Login Id or Email to receive password recovery instructions
                </p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="space-y-4 text-center py-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 space-y-2">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-xs font-semibold">
                    Recovery Request Dispatched
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If an account matching the provided Login Id or Email exists, a secure reset link has been dispatched.
                  </p>
                </div>

                <Button
                  className="w-full h-10 text-xs font-bold uppercase bg-primary text-primary-foreground"
                  asChild
                >
                  <Link to="/login">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Return to Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground" htmlFor="identifier">
                    Enter Login Id or Email Id -
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="e.g. designer@urbanfurniture.com"
                      className={`pl-9 bg-background/50 border-border/80 h-10 ${
                        errors.identifier ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                      {...register("identifier")}
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-xs text-destructive mt-1">{errors.identifier.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-bold tracking-wider uppercase bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition-all mt-3"
                >
                  <span className="flex items-center gap-2">
                    RESET PASSWORD
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>

                <div className="mt-4 pt-3 border-t border-border/60 text-center">
                  <Link
                    to="/login"
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>Encrypted Token-Based Reset Security</span>
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
