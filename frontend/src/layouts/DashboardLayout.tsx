import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
import {
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  CreditCard,
  Users,
  Box,
  Layers,
  PieChart,
  FileText,
  BookOpen,
  Scale,
  TrendingUp,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface NavLinkItem {
  label: string;
  path: string;
  icon: React.ElementType;
  description?: string;
}

interface NavCategory {
  title: string;
  key: "sales" | "purchase" | "account" | "report";
  roles: UserRole[];
  links: NavLinkItem[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    title: "Sales",
    key: "sales",
    roles: ["ADMIN", "ACCOUNTANT", "USER"],
    links: [
      { label: "Sales order", path: "/sales-orders", icon: ShoppingCart, description: "Bespoke client contracts & quotes" },
      { label: "Sale Invoice", path: "/sales-invoices", icon: Receipt, description: "Customer billings & payment status" },
      { label: "Receipt", path: "/receipts", icon: CreditCard, description: "Payment settlements & cash receipts" },
    ],
  },
  {
    title: "Purchase",
    key: "purchase",
    roles: ["ADMIN", "ACCOUNTANT"],
    links: [
      { label: "Purchase Order", path: "/purchase-orders", icon: ShoppingCart, description: "Raw timber & material orders" },
      { label: "Purchase Bill", path: "/vendor-bills", icon: Receipt, description: "Vendor bills & supplier payables" },
      { label: "Payment", path: "/vendor-bills?tab=payments", icon: CreditCard, description: "Vendor payment execution" },
    ],
  },
  {
    title: "Account",
    key: "account",
    roles: ["ADMIN", "ACCOUNTANT"],
    links: [
      { label: "Contact", path: "/contacts", icon: Users, description: "Clients, architects & suppliers" },
      { label: "Product", path: "/products", icon: Box, description: "Master inventory & specifications" },
      { label: "Analyticals", path: "/analytic-accounts", icon: Layers, description: "Project & atelier cost centers" },
      { label: "Budget", path: "/budgets", icon: PieChart, description: "Spending limits & stage workflows" },
      { label: "Chart of Account", path: "/chart-of-accounts", icon: FileText, description: "Double-entry general ledger" },
      { label: "Journals", path: "/journals", icon: BookOpen, description: "Cash, Bank, Sales & Purchase journals" },
      { label: "Journal Entries", path: "/journal-entries", icon: FileText, description: "Balanced debit & credit journal lines" },
    ],
  },
  {
    title: "Report",
    key: "report",
    roles: ["ADMIN", "ACCOUNTANT"],
    links: [
      { label: "Balancesheet", path: "/reports/balance-sheet", icon: Scale, description: "Assets, liabilities & atelier equity" },
      { label: "Profit and Loss", path: "/reports/profit-and-loss", icon: TrendingUp, description: "Net atelier operating profit" },
      { label: "Budget Report", path: "/reports/budget-report", icon: PieChart, description: "Budget vs actual expenditure" },
      { label: "Trial Balance", path: "/reports/trial-balance", icon: BookOpen, description: "Debit & Credit ledger balancing proof" },
    ],
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  ACCOUNTANT: "Accountant",
  USER: "User",
};

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "text-rose-500",
  ACCOUNTANT: "text-violet-500",
  USER: "text-sky-500",
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userRole = (user?.role as UserRole) || "USER";
  const dashboardLink = userRole === "USER" ? "/my-invoices" : "/dashboard";
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const visibleCategories = NAV_CATEGORIES.filter((cat) => cat.roles.includes(userRole));

  const getCurrentCategoryKey = () => {
    const p = location.pathname;
    if (p.includes("sales") || p.includes("receipts")) return "sales";
    if (p.includes("purchase") || p.includes("vendor-bill")) return "purchase";
    if (p.includes("reports")) return "report";
    if (
      p.includes("contacts") ||
      p.includes("products") ||
      p.includes("analytic") ||
      p.includes("budgets") ||
      p.includes("chart-of-accounts") ||
      p.includes("journals") ||
      p.includes("journal-entries")
    ) {
      return "account";
    }
    return null;
  };

  const currentCategory = getCurrentCategoryKey();

  useEffect(() => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target as Node) &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setMegaMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMegaMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleCategory = (catKey: string) => {
    if (megaMenuOpen && activeCategory === catKey) {
      setMegaMenuOpen(false);
    } else {
      setActiveCategory(catKey);
      setMegaMenuOpen(true);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const roleColor = ROLE_COLORS[userRole] || "text-muted-foreground";

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <header
        ref={headerRef}
        className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/90 backdrop-blur-xl shadow-xs transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 shrink-0">
            <Link to={dashboardLink} className="flex items-center gap-2.5 group">
              <img
                src={logo}
                alt="Modura Logo"
                className="h-8 w-8 object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold uppercase tracking-wider text-xs text-foreground">
                    Modura
                  </span>
                  <span className="text-[9px] uppercase font-bold text-primary px-1 rounded bg-primary/10 border border-primary/20">
                    OS
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">
                  Urban Furniture Ledger
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-border/70">
              <Link
                to={dashboardLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${location.pathname === "/dashboard" || location.pathname === "/my-invoices"
                    ? "bg-secondary text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              {visibleCategories.map((cat) => {
                const isSelectedCategory = currentCategory === cat.key;
                const isOpenCategory = megaMenuOpen && activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleCategory(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isOpenCategory
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : isSelectedCategory
                          ? "bg-secondary/80 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                  >
                    <span>{cat.title}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${isOpenCategory ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <ThemeToggle variant="icon" />
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border/70">
              <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs border border-primary/25">
                {userInitial}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">
                  {user?.name || "Team Member"}
                </span>
                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className={`text-[10px] py-0 px-1.5 font-medium border-border/80 bg-background/50 ${roleColor}`}
                  >
                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                    {roleLabel}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {megaMenuOpen && (
          <div
            ref={megaMenuRef}
            className="absolute top-16 left-0 w-full border-b border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 transition-all z-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {visibleCategories.map((cat) => {
                  const isHighlightedCategory = activeCategory === cat.key;
                  return (
                    <div
                      key={cat.key}
                      className={`p-3 rounded-xl transition-colors ${isHighlightedCategory
                          ? "bg-primary/5 border border-primary/20 shadow-xs"
                          : "border border-border/40 hover:border-border/80"
                        }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                        <span
                          className={`text-sm font-bold tracking-tight ${isHighlightedCategory ? "text-primary" : "text-foreground"
                            }`}
                        >
                          {cat.title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {cat.links.length}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        {cat.links.map((link) => {
                          const Icon = link.icon;
                          const isActive = location.pathname === link.path;
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setMegaMenuOpen(false)}
                              className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-all group ${isActive
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "text-foreground hover:bg-muted/60 hover:text-foreground"
                                }`}
                            >
                              <div
                                className={`p-1 rounded-md shrink-0 mt-0.5 ${isActive
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                  }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{link.label}</p>
                                {link.description && (
                                  <p
                                    className={`text-[10px] truncate ${isActive
                                        ? "text-primary-foreground/80"
                                        : "text-muted-foreground group-hover:text-foreground/70"
                                      }`}
                                  >
                                    {link.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/80 bg-card/95 backdrop-blur-xl p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <Link
              to={dashboardLink}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary text-foreground text-xs font-semibold"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Dashboard
            </Link>

            {visibleCategories.map((cat) => (
              <div key={cat.key} className="space-y-1.5 pt-2 border-t border-border/50">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {cat.title}
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {cat.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs ${isActive ? "bg-primary text-white font-semibold" : "text-foreground hover:bg-muted"
                          }`}
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {megaMenuOpen && (
        <div
          className="fixed inset-0 top-16 bg-background/50 backdrop-blur-xs z-30 transition-opacity duration-200"
          onClick={() => setMegaMenuOpen(false)}
        />
      )}

      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
