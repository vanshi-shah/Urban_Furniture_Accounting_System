import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Component,
  LogOut,
  User as UserIcon,
  Shield,
  Layers,
  Users,
  Box,
  FileText,
  BookOpen,
  PieChart
} from "lucide-react";
import logo from "@/assets/logo.png";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Contacts", path: "/contacts", icon: Users },
    { label: "Products", path: "/products", icon: Box },
    { label: "Chart of Accounts", path: "/chart-of-accounts", icon: FileText },
    { label: "Journals", path: "/journals", icon: BookOpen },
    { label: "Budgets", path: "/budgets", icon: PieChart },
    { label: "Components Gallery", path: "/components", icon: Component },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const userRole = user?.role ? user.role.toUpperCase() : "EMPLOYEE";

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/80 bg-card/70 backdrop-blur-md hidden md:flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/80">
          <div className="flex items-center gap-3 font-bold text-base tracking-tight">
            <img src={logo} alt="Urban Furniture Logo" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <span className="leading-tight uppercase tracking-wider text-xs font-bold text-foreground">
                Urban Furniture
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-normal">
                Financial Accounting
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-2.5 font-medium transition-all ${
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                asChild
              >
                <Link to={item.path}>
                  <Icon className="h-4 w-4 text-primary" />
                  {item.label}
                </Link>
              </Button>
            );
          })}

          <div className="pt-4 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground bg-secondary/40 rounded-lg border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <Layers className="h-3.5 w-3.5 text-accent" />
              <span>Quiet Luxury Design</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Double-entry ledger with real-time financial health intelligence.
            </p>
          </div>
        </nav>

        {/* User Profile & Sidebar Footer */}
        <div className="p-4 border-t border-border/80 bg-card/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/30">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.name || "Team Member"}
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 font-medium border-border/80 bg-background/50 text-muted-foreground"
                  >
                    <Shield className="h-2.5 w-2.5 mr-0.5 text-accent" />
                    {userRole}
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
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <span>Appearance</span>
            <ThemeToggle variant="icon" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border/80 flex items-center justify-between px-6 bg-card/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2 font-bold">
              <img src={logo} alt="Urban Furniture Logo" className="h-7 w-7 object-contain" />
              <span className="text-xs uppercase font-bold tracking-wider">Urban Furniture</span>
            </div>
            <h1 className="text-base font-semibold tracking-tight hidden md:block text-foreground">
              {location.pathname === "/components"
                ? "UI Components & Design System Gallery"
                : "Financial Overview & Double-Entry Ledger"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Navigation on Mobile */}
            <div className="flex md:hidden items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Dash</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/components">Components</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={handleLogout}
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Desktop User Tag */}
            <div className="hidden lg:flex items-center gap-2 border-r border-border/80 pr-3 mr-1 text-xs text-muted-foreground">
              <UserIcon className="h-3.5 w-3.5 text-primary" />
              <span>Signed in as <strong className="text-foreground">{user?.name || "User"}</strong></span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>

            {/* Segmented Theme Switcher */}
            <ThemeToggle variant="segmented" />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
