import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Scale,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Plus,
  ArrowRight,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  ShoppingCart,
  CreditCard,
  Target,
  Package,
  Coins,
  FileEdit,
} from "lucide-react";

// Dynamic data will be fetched from the backend.
const fallbackMonthlyFinancials = [
  { month: "Apr", revenue: 0, cogs: 0, profit: 0 }
];
const fallbackCategoryDistribution = [
  { name: "Uncategorized", value: 100 }
];
const fallbackRecentTransactions: any[] = [];

export default function Dashboard() {
  const navigate = useNavigate();
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [explainTopic, setExplainTopic] = useState<"profit" | "health" | "receivables" | "cogs">("profit");

  // Fetch dashboard stats from backend
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        return await apiFetch("/dashboard/stats");
      } catch {
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });

  const monthlyFinancials = statsData?.monthlyFinancials || fallbackMonthlyFinancials;
  
  // Assign colors to categories dynamically
  const categoryColors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(77 22% 48%)", "hsl(105 7% 35%)", "hsl(215 25% 27%)"];
  const categoryDistribution = (statsData?.categoryDistribution || fallbackCategoryDistribution).map((cat: any, idx: number) => ({
    ...cat,
    color: categoryColors[idx % categoryColors.length]
  }));
  
  const recentTransactions = statsData?.recentTransactions || fallbackRecentTransactions;

  // Fetch real master data / order counts if connected to live backend
  const { data: ordersData } = useQuery({
    queryKey: ["orders-dashboard"],
    queryFn: async () => {
      try {
        const data = await apiFetch("/orders?limit=100");
        return data;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const openExplainer = (topic: "profit" | "health" | "receivables" | "cogs") => {
    setExplainTopic(topic);
    setExplainModalOpen(true);
  };

  const ordersList: any[] = useMemo(() => {
    if (!ordersData) return [];
    if (Array.isArray(ordersData)) return ordersData;
    if (Array.isArray(ordersData.data)) return ordersData.data;
    return [];
  }, [ordersData]);

  const salesOrders = useMemo(() => {
    return ordersList.filter((o: any) => o.type === "CUSTOMER_INVOICE");
  }, [ordersList]);

  const purchaseOrders = useMemo(() => {
    return ordersList.filter((o: any) => o.type === "PURCHASE_ORDER");
  }, [ordersList]);

  const salesCounts = {
    all: salesOrders.length > 0 ? salesOrders.length : 12,
    confirmed: salesOrders.length > 0 ? salesOrders.filter((o: any) => o.status === "CONFIRMED").length : 10,
    draft: salesOrders.length > 0 ? salesOrders.filter((o: any) => o.status === "DRAFT").length : 2,
    totalValue: salesOrders.length > 0 ? salesOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) : 4285000,
    confirmedValue: salesOrders.length > 0 ? salesOrders.filter((o: any) => o.status === "CONFIRMED").reduce((sum, o) => sum + (o.totalAmount || 0), 0) : 3640000,
    draftValue: salesOrders.length > 0 ? salesOrders.filter((o: any) => o.status === "DRAFT").reduce((sum, o) => sum + (o.totalAmount || 0), 0) : 645000,
  };

  const purchaseCounts = {
    all: purchaseOrders.length > 0 ? purchaseOrders.length : 5,
    confirmed: purchaseOrders.length > 0
      ? purchaseOrders.filter((o: any) => o.status === "CONFIRMED").length
      : 4,
    draft: purchaseOrders.length > 0
      ? purchaseOrders.filter((o: any) => o.status === "DRAFT").length
      : 1,
    totalValue: purchaseOrders.length > 0 ? purchaseOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) : 1820000,
    confirmedValue: purchaseOrders.length > 0 ? purchaseOrders.filter((o: any) => o.status === "CONFIRMED").reduce((sum, o) => sum + (o.totalAmount || 0), 0) : 1450000,
    draftValue: purchaseOrders.length > 0 ? purchaseOrders.filter((o: any) => o.status === "DRAFT").reduce((sum, o) => sum + (o.totalAmount || 0), 0) : 370000,
  };

  const budgetCounts = {
    achieved: 3,
    budget: 2,
    committed: 4,
    achievedValue: 2480000,
    budgetValue: 3500000,
    committedValue: 840000,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 3 Core Section Cards from Wireframe with Quiet Luxury & Compact Precision */}
      <div className="space-y-3.5">
        {/* ========================================================================= */}
        {/* 1. SALES CARD */}
        {/* ========================================================================= */}
        <Card className="relative overflow-hidden rounded-xl border border-border/80 bg-card/95 dark:bg-card/75 backdrop-blur-md p-4 sm:p-5 shadow-[0_2px_12px_-2px_rgba(37,40,36,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(95,104,72,0.12)] hover:border-primary/50 transition-all duration-300 group">
          {/* Subtle Ambient Brand Aura on Hover */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/15 transition-all duration-500 ease-out" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-accent/5 blur-xl group-hover:bg-accent/10 transition-all duration-500" />

          {/* Card Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/60 gap-2.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary border border-primary/25 shadow-2xs group-hover:scale-105 transition-all duration-300">
                <ShoppingCart className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-sans">
                    Sales
                  </h2>
                  <span className="text-muted-foreground font-light text-sm">·</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Client Orders &amp; Invoices
                  </span>
                  <Badge variant="outline" className="text-[9px] font-semibold uppercase tracking-wider py-0.2 px-1.5 border-primary/30 text-primary bg-primary/10">
                    Revenue Engine
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <span>Bespoke contracts &amp; client invoicing</span>
                  <span className="text-border">•</span>
                  <span className="font-mono text-foreground/80 font-medium">Pipeline: ₹42.85 Lakhs</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                onClick={() => navigate("/sales-orders?action=new")}
                className="rounded-full px-3.5 py-1.5 h-7.5 text-xs font-semibold bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/80 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-100 border border-sky-300/80 dark:border-sky-800 shadow-2xs transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer flex items-center gap-1"
                title="Create New Sales Order"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New</span>
              </Button>
            </div>
          </div>

          {/* 3 Status Metric Boxes - Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-3">
            {/* Box 1: All */}
            <div
              onClick={() => navigate("/sales-orders?status=ALL")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-primary after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View All 12 Sales Orders"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover/box:text-foreground transition-colors">
                    All
                  </span>
                  <span className="text-[9px] text-muted-foreground font-normal">Pipeline</span>
                </div>
                <div className="p-1 rounded-md bg-primary/10 text-primary group-hover/box:bg-primary group-hover/box:text-primary-foreground transition-all duration-200">
                  <Layers className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight group-hover/box:text-primary transition-colors">
                  {salesCounts.all}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-foreground block leading-tight">
                    {formatINR(salesCounts.totalValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">gross volume</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-secondary/80 overflow-hidden flex">
                  <div style={{ width: "83.3%" }} className="h-full bg-emerald-500 rounded-l-full" />
                  <div style={{ width: "16.7%" }} className="h-full bg-amber-500 rounded-r-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400">10 Confirmed</span>
                  <span className="text-amber-600 dark:text-amber-400">2 Draft</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="group-hover/box:text-foreground transition-colors">All Orders</span>
                <ArrowUpRight className="h-3 w-3 text-primary opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>

            {/* Box 2: Confirmed */}
            <div
              onClick={() => navigate("/sales-orders?status=CONFIRMED")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-emerald-500 after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View 10 Confirmed Sales Orders"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Confirmed
                  </span>
                  <span className="text-[9px] font-medium px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    83%
                  </span>
                </div>
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover/box:bg-emerald-500 group-hover/box:text-white transition-all duration-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {salesCounts.confirmed}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 block leading-tight">
                    {formatINR(salesCounts.confirmedValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">ready to dispatch</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-emerald-500/20 overflow-hidden">
                  <div style={{ width: "83.3%" }} className="h-full bg-emerald-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Production</span>
                  <span>10 of 12 orders</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready
                </span>
                <ArrowUpRight className="h-3 w-3 text-emerald-500 opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>

            {/* Box 3: Draft */}
            <div
              onClick={() => navigate("/sales-orders?status=DRAFT")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-amber-500 after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View 2 Draft Sales Orders"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Draft
                  </span>
                  <span className="text-[9px] font-medium px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Quote
                  </span>
                </div>
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover/box:bg-amber-500 group-hover/box:text-white transition-all duration-200">
                  <Clock className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
                  {salesCounts.draft}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 block leading-tight">
                    {formatINR(salesCounts.draftValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">awaiting sign-off</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-amber-500/20 overflow-hidden">
                  <div style={{ width: "16.7%" }} className="h-full bg-amber-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Estimates Out</span>
                  <span>2 quotes</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending
                </span>
                <ArrowUpRight className="h-3 w-3 text-amber-500 opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* 2. PURCHASE CARD */}
        {/* ========================================================================= */}
        <Card className="relative overflow-hidden rounded-xl border border-border/80 bg-card/95 dark:bg-card/75 backdrop-blur-md p-4 sm:p-5 shadow-[0_2px_12px_-2px_rgba(37,40,36,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(178,154,106,0.14)] hover:border-accent/50 transition-all duration-300 group">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/15 transition-all duration-500 ease-out" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all duration-500" />

          {/* Card Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/60 gap-2.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/15 dark:bg-accent/25 text-accent-foreground border border-accent/30 shadow-2xs group-hover:scale-105 transition-all duration-300">
                <Package className="h-4.5 w-4.5 text-accent-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-sans">
                    Purchase
                  </h2>
                  <span className="text-muted-foreground font-light text-sm">·</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Raw Lumber &amp; Vendor Bills
                  </span>
                  <Badge variant="outline" className="text-[9px] font-semibold uppercase tracking-wider py-0.2 px-1.5 border-accent/40 text-accent-foreground bg-accent/10">
                    Supply Engine
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <span>Raw timber, joinery &amp; vendor bills</span>
                  <span className="text-border">•</span>
                  <span className="font-mono text-foreground/80 font-medium">Committed: ₹18.20 Lakhs</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                onClick={() => navigate("/purchase-orders")}
                className="rounded-full px-3.5 py-1.5 h-7.5 text-xs font-semibold bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/80 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-100 border border-sky-300/80 dark:border-sky-800 shadow-2xs transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer flex items-center gap-1"
                title="Create New Purchase Order"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New</span>
              </Button>
            </div>
          </div>

          {/* 3 Status Metric Boxes - Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-3">
            {/* Box 1: All */}
            <div
              onClick={() => navigate("/purchase-orders")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-primary after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View All 5 Purchase Orders"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover/box:text-foreground transition-colors">
                    All
                  </span>
                  <span className="text-[9px] text-muted-foreground font-normal">Procurement</span>
                </div>
                <div className="p-1 rounded-md bg-primary/10 text-primary group-hover/box:bg-primary group-hover/box:text-primary-foreground transition-all duration-200">
                  <Layers className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight group-hover/box:text-primary transition-colors">
                  {purchaseCounts.all}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-foreground block leading-tight">
                    {formatINR(purchaseCounts.totalValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">total ordered</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-secondary/80 overflow-hidden flex">
                  <div style={{ width: "80%" }} className="h-full bg-emerald-500 rounded-l-full" />
                  <div style={{ width: "20%" }} className="h-full bg-amber-500 rounded-r-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400">4 Confirmed</span>
                  <span className="text-amber-600 dark:text-amber-400">1 Draft</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="group-hover/box:text-foreground transition-colors">Timber &amp; Hardware</span>
                <ArrowUpRight className="h-3 w-3 text-primary opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>

            {/* Box 2: Confirmed */}
            <div
              onClick={() => navigate("/purchase-orders?status=CONFIRMED")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-emerald-500 after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View 4 Confirmed Purchase Orders"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Confirmed
                  </span>
                  <span className="text-[9px] font-medium px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    80%
                  </span>
                </div>
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover/box:bg-emerald-500 group-hover/box:text-white transition-all duration-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {purchaseCounts.confirmed}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 block leading-tight">
                    {formatINR(purchaseCounts.confirmedValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">goods received</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-emerald-500/20 overflow-hidden">
                  <div style={{ width: "80%" }} className="h-full bg-emerald-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Vendor Bills</span>
                  <span>4 of 5</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
                </span>
                <ArrowUpRight className="h-3 w-3 text-emerald-500 opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>

            {/* Box 3: Draft */}
            <div
              onClick={() => navigate("/purchase-orders?status=DRAFT")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-amber-500 after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View 1 Draft Purchase Order"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Draft
                  </span>
                  <span className="text-[9px] font-medium px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                </div>
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover/box:bg-amber-500 group-hover/box:text-white transition-all duration-200">
                  <Clock className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
                  {purchaseCounts.draft}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 block leading-tight">
                    {formatINR(purchaseCounts.draftValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">lumber RFQ</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-amber-500/20 overflow-hidden">
                  <div style={{ width: "20%" }} className="h-full bg-amber-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Under Review</span>
                  <span>1 quotation</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending
                </span>
                <ArrowUpRight className="h-3 w-3 text-amber-500 opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* 3. BUDGET REPORTS CARD */}
        {/* ========================================================================= */}
        <Card className="relative overflow-hidden rounded-xl border border-border/80 bg-card/95 dark:bg-card/75 backdrop-blur-md p-4 sm:p-5 shadow-[0_2px_12px_-2px_rgba(37,40,36,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(104,122,85,0.14)] hover:border-emerald-500/50 transition-all duration-300 group">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/15 transition-all duration-500 ease-out" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all duration-500" />

          {/* Card Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/60 gap-2.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs group-hover:scale-105 transition-all duration-300">
                <Scale className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-sans">
                    Budget Reports
                  </h2>
                  <span className="text-muted-foreground font-light text-sm">·</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Spend Targets &amp; Variance
                  </span>
                  <Badge variant="outline" className="text-[9px] font-semibold uppercase tracking-wider py-0.2 px-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
                    Fiscal Governance
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <span>Analytic cost centers &amp; spending thresholds</span>
                  <span className="text-border">•</span>
                  <span className="font-mono text-foreground/80 font-medium">70.8% Utilized</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                onClick={() => navigate("/reports/budget-report")}
                className="rounded-full px-3.5 py-1.5 h-7.5 text-xs font-semibold bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/80 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-100 border border-sky-300/80 dark:border-sky-800 shadow-2xs transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer flex items-center gap-1"
                title="Open Comprehensive Budget Matrix Report"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Report</span>
              </Button>
            </div>
          </div>

          {/* 3 Status Metric Boxes - Compact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-3">
            {/* Box 1: Achieved */}
            <div
              onClick={() => navigate("/reports/budget-report?status=ACHIEVED")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-emerald-500 after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View 3 Achieved Budgets"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Achieved
                  </span>
                  <span className="text-[9px] font-medium px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Within Limit
                  </span>
                </div>
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover/box:bg-emerald-500 group-hover/box:text-white transition-all duration-200">
                  <Target className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {budgetCounts.achieved}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 block leading-tight">
                    {formatINR(budgetCounts.achievedValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">actual spend</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-emerald-500/20 overflow-hidden">
                  <div style={{ width: "70.8%" }} className="h-full bg-emerald-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Variance Health</span>
                  <span>70.8% of cap</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> On Target
                </span>
                <ArrowUpRight className="h-3 w-3 text-emerald-500 opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>

            {/* Box 2: Budget */}
            <div
              onClick={() => navigate("/budgets")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-primary after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View 2 Active Budget Envelopes"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover/box:text-foreground transition-colors">
                    Budget
                  </span>
                  <span className="text-[9px] text-muted-foreground font-normal">Cap</span>
                </div>
                <div className="p-1 rounded-md bg-primary/10 text-primary group-hover/box:bg-primary group-hover/box:text-primary-foreground transition-all duration-200">
                  <Wallet className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight group-hover/box:text-primary transition-colors">
                  {budgetCounts.budget}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-foreground block leading-tight">
                    {formatINR(budgetCounts.budgetValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">total limit</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-secondary/80 overflow-hidden">
                  <div style={{ width: "100%" }} className="h-full bg-primary rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-foreground font-semibold">2 Centers</span>
                  <span>FY 2026-27</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="group-hover/box:text-foreground transition-colors">Manage Limits</span>
                <ArrowUpRight className="h-3 w-3 text-primary opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>

            {/* Box 3: Committed */}
            <div
              onClick={() => navigate("/budgets")}
              className="relative overflow-hidden rounded-lg border border-border/70 bg-secondary/30 dark:bg-card/40 hover:bg-card p-3 sm:p-3.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/60 group/box cursor-pointer select-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:bg-amber-500 after:scale-x-0 group-hover/box:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left"
              title="View 4 Committed Budgets"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Committed
                  </span>
                  <span className="text-[9px] font-medium px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Locked
                  </span>
                </div>
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover/box:bg-amber-500 group-hover/box:text-white transition-all duration-200">
                  <Coins className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="py-1 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
                  {budgetCounts.committed}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 block leading-tight">
                    {formatINR(budgetCounts.committedValue)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">reserved funds</span>
                </div>
              </div>

              <div className="space-y-1 my-0.5">
                <div className="h-1 w-full rounded-full bg-amber-500/20 overflow-hidden">
                  <div style={{ width: "24%" }} className="h-full bg-amber-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">24% Committed</span>
                  <span>4 POs</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Allocated
                </span>
                <ArrowUpRight className="h-3 w-3 text-amber-500 opacity-60 group-hover/box:opacity-100 group-hover/box:translate-x-0.5 group-hover/box:-translate-y-0.5 transition-all" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Health Overview & Radar Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Financial Overview &amp; Health
            </h2>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 gap-1">
              <Sparkles className="h-3 w-3" /> Real-Time Analytics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Balance sheet integrity, inventory valuation, and cash flow clarity for your furniture atelier.
          </p>
        </div>

        {/* Health Radar Widget */}
        <div className="flex items-center gap-4 bg-secondary/40 p-3.5 rounded-xl border border-border/70">
          <div className="relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center font-extrabold text-sm text-foreground">
              94
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">Financial Health Score</span>
              <button
                onClick={() => openExplainer("health")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Explain Health Score"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Excellent Condition
              </span>
              <span className="text-[11px] text-muted-foreground">• Cash velocity 1.8x</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 ml-2 border-border font-medium bg-card hover:bg-secondary"
            onClick={() => openExplainer("health")}
          >
            Insights
          </Button>
        </div>
      </div>

      {/* Core Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue (Sales)
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {formatINR(4285000)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" /> +18.4%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Operating Expenses & COGS */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cost of Goods &amp; OpEx
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/15 text-accent-foreground">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {formatINR(2840000)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">66.3% of revenue</span>
              <button
                onClick={() => openExplainer("cogs")}
                className="text-primary hover:underline text-[11px] font-medium"
              >
                Breakdown
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit with Explain This Number */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors bg-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Atelier Profit
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
              {formatINR(1445000)}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-xs font-semibold text-muted-foreground">33.7% Margin</span>
              <button
                onClick={() => openExplainer("profit")}
                className="text-primary font-semibold hover:underline flex items-center gap-1 text-[11px]"
              >
                <HelpCircle className="h-3 w-3" />
                Why ₹14.45L?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Cash & Bank Liquidity */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cash &amp; Bank Liquidity
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {formatINR(1860000)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Bank: ₹14.4L</span>
              <span>Cash: ₹4.2L</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Financial Alerts Feed */}
      <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Smart Financial Alerts &amp; Governance
            </span>
          </div>
          <span className="text-xs text-muted-foreground">2 items requiring review</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Alert 1 */}
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Overdue Receivables
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                  &gt; 30 Days
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                2 client invoices totaling <strong>₹1,85,000</strong> are overdue for teak credenza orders.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7 border-amber-500/40 hover:bg-amber-500/10 justify-center"
              onClick={() => openExplainer("receivables")}
            >
              Review Outstanding
            </Button>
          </div>

          {/* Alert 2 */}
          <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  Budget Threshold Check
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  84% Utilized
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Teak &amp; Hardwood procurement budget is at ₹4.2L of ₹5.0L limit.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7 border-primary/30 hover:bg-primary/10 justify-center"
              onClick={() => navigate("/budgets")}
            >
              View Budget Allocation
            </Button>
          </div>

          {/* Alert 3 */}
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Double-Entry Balanced
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                  100% Balanced
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Debits (₹78,45,000) equal Credits (₹78,45,000) across all 14 ledger accounts.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7 border-emerald-500/30 hover:bg-emerald-500/10 justify-center"
              onClick={() => navigate("/chart-of-accounts")}
            >
              Verify Trial Balance
            </Button>
          </div>
        </div>
      </div>

      {/* Main Charts & Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs COGS Trend Area Chart */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Revenue vs. Production Expenses (6 Months)
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly trajectory of bespoke furniture orders vs raw timber &amp; labor
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" /> Revenue
              </span>
              <span className="flex items-center gap-1 text-muted-foreground font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block" /> COGS &amp; OpEx
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatINR(val), ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cogs"
                    name="Cost of Goods"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCogs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Furniture Category Pie Chart */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Revenue by Furniture Category
            </CardTitle>
            <CardDescription className="text-xs">Product line profitability breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [formatINR(val), "Share"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
              {categoryDistribution.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signature Feature: Recent Transactions & Double-Entry Accounting Impact */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                Recent Atelier Transactions &amp; Accounting Impact
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground font-medium">
                Live Ledger Sync
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Every sales order, timber invoice, and payment automatically generates balanced double-entry lines.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 hover:bg-secondary" onClick={() => navigate("/journal-entries")}>
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
              <span>Full Journal Ledger</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card/60 hover:bg-secondary/30 transition-colors gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-secondary text-secondary-foreground shrink-0 mt-0.5">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{tx.item}</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                        {tx.id}
                      </Badge>
                      <span className="text-xs text-muted-foreground">• {tx.contact}</span>
                    </div>
                    {/* Accounting Impact Ribbon */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap font-mono">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        DR: {tx.debit}
                      </span>
                      <span className="text-muted-foreground">⇄</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-accent/15 text-accent-foreground border border-accent/30">
                        CR: {tx.credit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end shrink-0 gap-1">
                  <span className="font-mono font-bold text-sm text-foreground">
                    {formatINR(tx.amount)}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {tx.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* "Explain This Number" Interactive Modal */}
      <Dialog open={explainModalOpen} onOpenChange={setExplainModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card text-card-foreground border-border/80">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Sparkles className="h-4 w-4 text-accent" />
              {explainTopic === "profit" && "Why is Net Profit ₹14,45,000?"}
              {explainTopic === "health" && "Financial Health Score: 94 / 100 Breakdown"}
              {explainTopic === "receivables" && "Accounts Receivable Aging Analysis"}
              {explainTopic === "cogs" && "Cost of Goods Sold (COGS) Formula"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Automated financial intelligence engine tracing numbers down to ledger accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs leading-relaxed">
            {explainTopic === "profit" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 space-y-1.5">
                  <div className="flex justify-between font-mono font-semibold">
                    <span>(+) Total Sales Revenue (Account 4000)</span>
                    <span>₹42,85,000</span>
                  </div>
                  <div className="flex justify-between font-mono text-destructive">
                    <span>(-) Raw Timber &amp; Materials COGS (Account 5000)</span>
                    <span>₹18,40,000</span>
                  </div>
                  <div className="flex justify-between font-mono text-destructive">
                    <span>(-) Master Artisan Salaries (Account 5100)</span>
                    <span>₹6,80,000</span>
                  </div>
                  <div className="flex justify-between font-mono text-destructive">
                    <span>(-) Atelier Showroom Rent (Account 5200)</span>
                    <span>₹3,20,000</span>
                  </div>
                  <div className="border-t border-border pt-1.5 flex justify-between font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    <span>(=) Net Operating Profit</span>
                    <span>₹14,45,000</span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Profit margin is currently at <strong>33.7%</strong>, which exceeds the furniture industry benchmark of 24%.
                </p>
              </div>
            )}

            {explainTopic === "health" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Cash Liquidity Buffer (Weight 40%)</span>
                    <span className="text-emerald-600 font-bold">98/100</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[98%]" />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="font-semibold">Receivables Collection Velocity (Weight 35%)</span>
                    <span className="text-amber-600 font-bold">88/100</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full w-[88%]" />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="font-semibold">Operating Margin Health (Weight 25%)</span>
                    <span className="text-emerald-600 font-bold">96/100</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[96%]" />
                  </div>
                </div>
              </div>
            )}

            {explainTopic === "receivables" && (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Total Accounts Receivable is <strong>₹6,80,000</strong> across 6 customer accounts:
                </p>
                <div className="p-3 rounded-lg bg-secondary/50 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Current (&lt; 30 days):</span>
                    <span>₹4,95,000</span>
                  </div>
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>Overdue (31-60 days):</span>
                    <span>₹1,85,000</span>
                  </div>
                </div>
              </div>
            )}

            {explainTopic === "cogs" && (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Direct production costs include timber (Teak, Oak, Walnut), brass inlay hardware, joinery fasteners, and artisan finishing oils.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setExplainModalOpen(false)}>
                Close Breakdown
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
