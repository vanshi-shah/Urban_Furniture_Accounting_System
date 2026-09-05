import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowRight,
  Sparkles,
  Scale,
  Layers,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo.png";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans">
      {/* Ambient background visual glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
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
      <header className="relative w-full flex items-center justify-between px-6 sm:px-10 py-5 border-b border-border/40 backdrop-blur-md z-50 sticky top-0">
        <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
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
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle variant="segmented" />
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:opacity-90 font-medium px-4 shadow-sm text-xs h-9 rounded-xl flex items-center gap-1.5 transition-transform hover:scale-105"
            onClick={() => navigate("/welcome")}
          >
            <span>Enter App</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 z-10 min-h-[85vh]">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-10">
          
          <div className="relative group animate-float">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl opacity-80 group-hover:opacity-100 animate-spin-slow" />
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-card border border-border/80 shadow-xl flex items-center justify-center p-3 transition-transform duration-500 group-hover:scale-105">
              <img src={logo} alt="Modura Emblem" className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-sm" />
            </div>
          </div>

          <div className="space-y-5 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span>Quiet Luxury • Financial Precision</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Accounting refined for <span className="shimmer-text block sm:inline">Furniture Ateliers.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the clarity of a strict double-entry ledger fused with premium architectural design aesthetics. Built specifically for urban furniture design studios to track BOM, sales, and complex accounting effortlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:opacity-95 font-semibold text-base h-14 px-8 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 hover:-translate-y-1"
              onClick={() => navigate("/welcome")}
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-card hover:bg-secondary/70 border-border/90 text-foreground font-semibold text-base h-14 px-8 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-105 hover:-translate-y-1"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span>Explore Features</span>
            </Button>
          </div>
          
          {/* Mock Floating Ribbon Component */}
          <div className="mt-12 p-4 rounded-xl border border-border/70 bg-card/80 backdrop-blur-md shadow-2xl animate-float-delayed flex items-center gap-4 max-w-md w-full justify-between transform rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary text-secondary-foreground border border-border/40 shadow-sm">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">INV-2026-0042</p>
                <p className="text-[11px] text-muted-foreground font-mono">Aura Architecture Studio</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono">DR 1400</span>
              <span className="text-muted-foreground font-bold">⇄</span>
              <span className="px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 text-[11px] font-mono">CR 1400</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative w-full py-24 bg-secondary/30 z-10 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Precision at every level</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              We've stripped away the noise. What remains is a powerful, compliant accounting engine dressed in warm linen and deep olive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group/box relative p-8 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start overflow-hidden after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-primary after:scale-x-0 group-hover/box:after:scale-x-100 after:origin-left after:transition-transform after:duration-500">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-6 ring-1 ring-primary/20">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Double-Entry Ledger</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                Every transaction automatically generates perfectly balanced debits and credits, ensuring 100% compliance and flawless trial balances.
              </p>
              <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                <div className="w-full h-full bg-primary/40 rounded-full" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group/box relative p-8 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start overflow-hidden after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-accent after:scale-x-0 group-hover/box:after:scale-x-100 after:origin-left after:transition-transform after:duration-500">
              <div className="p-3 rounded-2xl bg-accent/10 text-accent mb-6 ring-1 ring-accent/20">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">BOM & Stock Valuation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                Manage complex Bills of Materials for custom furniture pieces. Track raw materials and finished goods with real-time valuation.
              </p>
              <div className="w-full p-3 rounded-xl border border-border/50 bg-secondary/50 flex items-center justify-between">
                <span className="text-xs font-medium">Lounge Chair V2</span>
                <span className="text-xs font-mono font-bold text-accent">₹ 42,500</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group/box relative p-8 rounded-2xl bg-card border border-border/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start overflow-hidden after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-primary after:scale-x-0 group-hover/box:after:scale-x-100 after:origin-left after:transition-transform after:duration-500">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-6 ring-1 ring-primary/20">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Financial Analytics</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                Interactive P&L, Balance Sheets, and KPI widgets. Click any figure to drill down instantly into the underlying journal lines.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+12.4% Revenue Growth</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Luxury Banner */}
      <section className="relative w-full py-20 bg-[#454D35] text-[#F7F5EF] z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,transparent_100%)] blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
          <img src={logo} alt="Modura White" className="h-16 w-16 mx-auto drop-shadow-sm rounded-lg" />
          <h2 className="text-3xl sm:text-4xl font-light tracking-wide font-serif italic opacity-90">
            "Design is intelligence made visible. So is your ledger."
          </h2>
          <div className="flex items-center justify-center gap-4 pt-4 opacity-80">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm uppercase tracking-[0.2em]">Bank-grade Security</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-24 z-10">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to refine your studio?</h2>
          <p className="text-muted-foreground">Join the exclusive network of ateliers using Modura.</p>
          <div className="pt-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:opacity-95 font-semibold text-lg h-16 px-10 rounded-2xl shadow-xl transition-all hover:scale-105 hover:-translate-y-1"
              onClick={() => navigate("/welcome")}
            >
              <span>Launch Financial OS</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full py-6 px-6 border-t border-border/40 text-center text-xs text-muted-foreground backdrop-blur-sm z-20 bg-card/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Modura" className="h-4 w-4 grayscale opacity-50" />
            <span>© 2026 Modura Accounting System</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
