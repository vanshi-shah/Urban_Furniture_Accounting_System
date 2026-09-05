import { useState } from "react";
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
} from "lucide-react";

// Realistic Modura Atelier Financial Data
const monthlyFinancials = [
  { month: "Apr", revenue: 2800000, cogs: 1850000, profit: 950000 },
  { month: "May", revenue: 3200000, cogs: 2100000, profit: 1100000 },
  { month: "Jun", revenue: 2950000, cogs: 1900000, profit: 1050000 },
  { month: "Jul", revenue: 3600000, cogs: 2350000, profit: 1250000 },
  { month: "Aug", revenue: 3900000, cogs: 2500000, profit: 1400000 },
  { month: "Sep", revenue: 4285000, cogs: 2840000, profit: 1445000 },
];

const categoryDistribution = [
  { name: "Executive Desks", value: 1650000, color: "hsl(var(--primary))" },
  { name: "Living Credenzas", value: 1120000, color: "hsl(var(--accent))" },
  { name: "Dining Sets", value: 940000, color: "hsl(77 22% 48%)" },
  { name: "Custom Millwork", value: 575000, color: "hsl(105 7% 35%)" },
];

const recentTransactions = [
  {
    id: "INV-2026-089",
    contact: "Aura Architecture Studio",
    type: "CUSTOMER_INVOICE",
    item: "Teak Bespoke Executive Desk (x2)",
    amount: 240000,
    status: "POSTED",
    date: "Today, 2:15 PM",
    debit: "1200 Accounts Receivable",
    credit: "4000 Sales Revenue",
  },
  {
    id: "BILL-2026-042",
    contact: "Mysore Teak & Hardwoods",
    type: "VENDOR_BILL",
    item: "Kiln-Dried Teak Timber Planks (400 sq.ft)",
    amount: 145000,
    status: "POSTED",
    date: "Today, 11:30 AM",
    debit: "1500 Inventory / Raw Lumber",
    credit: "2100 Accounts Payable",
  },
  {
    id: "PAY-2026-031",
    contact: "Vayu Penthouse Project",
    type: "PAYMENT",
    item: "Brass Inlay Credenza Settlement",
    amount: 185000,
    status: "RECONCILED",
    date: "Yesterday",
    debit: "1010 Bank Account",
    credit: "1200 Accounts Receivable",
  },
  {
    id: "INV-2026-088",
    contact: "Oberoi Luxury Residences",
    type: "CUSTOMER_INVOICE",
    item: "Solid Oak Dining Suite & 8 Chairs",
    amount: 320000,
    status: "POSTED",
    date: "2 days ago",
    debit: "1200 Accounts Receivable",
    credit: "4000 Sales Revenue",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [explainModalOpen, setExplainModalOpen] = useState(false);
  const [explainTopic, setExplainTopic] = useState<"profit" | "health" | "receivables" | "cogs">("profit");

  // Fetch real master data / order counts if connected to live backend
  const { data: ordersData } = useQuery({
    queryKey: ["orders-dashboard"],
    queryFn: async () => {
      try {
        const data = await apiFetch("/orders");
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Quick Financial Health Radar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Financial Overview
            </h1>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 gap-1">
              <Sparkles className="h-3 w-3" /> Modura Double-Entry OS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Real-time balance sheet integrity, inventory valuation, and cash flow clarity for your furniture atelier.
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
            <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" onClick={() => navigate("/journals")}>
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
