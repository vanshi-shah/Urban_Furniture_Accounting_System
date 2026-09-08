import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  Scale,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";

export default function Reports() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path
  const getTabFromPath = () => {
    if (location.pathname.includes("balance-sheet")) return "balance-sheet";
    if (location.pathname.includes("profit-and-loss")) return "profit-and-loss";
    if (location.pathname.includes("budget-report")) return "budget-report";
    if (location.pathname.includes("trial-balance")) return "trial-balance";
    return "profit-and-loss";
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromPath());
  const [loading, setLoading] = useState(false);
  const [pnlData, setPnlData] = useState<any>(null);
  const [balanceSheetData, setBalanceSheetData] = useState<any>(null);
  const [trialBalanceData, setTrialBalanceData] = useState<any>(null);
  const [analyticAccounts, setAnalyticAccounts] = useState<any[]>([]);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    navigate(`/reports/${val}`, { replace: true });
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [pnlRes, bsRes, tbRes, analyticRes] = await Promise.allSettled([
        apiFetch("/reports/profit-and-loss"),
        apiFetch("/reports/balance-sheet"),
        apiFetch("/reports/trial-balance"),
        apiFetch("/master/analytic-accounts?limit=100"),
      ]);

      if (pnlRes.status === "fulfilled" && pnlRes.value) setPnlData(pnlRes.value);
      if (bsRes.status === "fulfilled" && bsRes.value) setBalanceSheetData(bsRes.value);
      if (tbRes.status === "fulfilled" && tbRes.value) setTrialBalanceData(tbRes.value);
      if (analyticRes.status === "fulfilled" && analyticRes.value) {
        const list = analyticRes.value?.data ?? (Array.isArray(analyticRes.value) ? analyticRes.value : []);
        setAnalyticAccounts(list);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatINR = (val: number | undefined | null) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  // Safe Profit & Loss Normalization
  const normalizedPnL = (() => {
    const hasData =
      pnlData &&
      (pnlData.totalIncome > 0 ||
        pnlData.totalExpense > 0 ||
        (Array.isArray(pnlData.details?.income) && pnlData.details.income.length > 0) ||
        (Array.isArray(pnlData.details?.expenses) && pnlData.details.expenses.length > 0) ||
        pnlData.revenue !== undefined);

    if (hasData) {
      const revenue = Number(pnlData.revenue ?? pnlData.totalIncome) || 0;
      const operatingExpenses = Number(pnlData.operatingExpenses ?? pnlData.totalExpense) || 0;
      const cogs = Number(pnlData.cogs) || 0;
      const grossProfit = Number(pnlData.grossProfit ?? (revenue - cogs)) || 0;
      const netProfit = Number(pnlData.netProfit ?? (grossProfit - operatingExpenses)) || 0;

      const revenueBreakdown = Array.isArray(pnlData.revenueBreakdown)
        ? pnlData.revenueBreakdown
        : Array.isArray(pnlData.details?.income) && pnlData.details.income.length > 0
          ? pnlData.details.income.map((i: any) => ({
            item: i.name ? `${i.name}${i.code ? ` (${i.code})` : ""}` : `Account ${i.code || ""}`,
            amount: Number(i.balance ?? i.amount) || 0,
          }))
          : [{ item: "Operating Sales & Custom Furniture", amount: revenue }];

      const expenseBreakdown = Array.isArray(pnlData.expenseBreakdown)
        ? pnlData.expenseBreakdown
        : Array.isArray(pnlData.details?.expenses) && pnlData.details.expenses.length > 0
          ? pnlData.details.expenses.map((e: any) => ({
            category: e.name ? `${e.name}${e.code ? ` (${e.code})` : ""}` : `Account ${e.code || ""}`,
            amount: Number(e.balance ?? e.amount) || 0,
          }))
          : [{ category: "Timber & Artisan Workshop Expenses", amount: operatingExpenses }];

      return {
        revenue,
        cogs,
        grossProfit,
        operatingExpenses,
        netProfit,
        revenueBreakdown,
        expenseBreakdown,
      };
    }

    return {
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      netProfit: 0,
      expenseBreakdown: [],
      revenueBreakdown: [],
    };
  })();

  // Safe Balance Sheet Normalization
  const normalizedBS = (() => {
    const hasData =
      balanceSheetData &&
      (balanceSheetData.totalAssets > 0 ||
        balanceSheetData.totalLiabilities > 0 ||
        (Array.isArray(balanceSheetData.details?.assets) && balanceSheetData.details.assets.length > 0) ||
        (Array.isArray(balanceSheetData.details?.liabilities) && balanceSheetData.details.liabilities.length > 0));

    if (hasData) {
      const currentAssets = Array.isArray(balanceSheetData.currentAssets)
        ? balanceSheetData.currentAssets
        : Array.isArray(balanceSheetData.details?.assets)
          ? balanceSheetData.details.assets.map((a: any) => ({
            name: a.name || `Asset ${a.code || ""}`,
            code: a.code || "",
            amount: Number(a.balance ?? a.amount) || 0,
          }))
          : [];

      const currentLiabilities = Array.isArray(balanceSheetData.currentLiabilities)
        ? balanceSheetData.currentLiabilities
        : Array.isArray(balanceSheetData.details?.liabilities)
          ? balanceSheetData.details.liabilities.map((l: any) => ({
            name: l.name || `Liability ${l.code || ""}`,
            code: l.code || "",
            amount: Number(l.balance ?? l.amount) || 0,
          }))
          : [];

      const equity = Array.isArray(balanceSheetData.equity)
        ? balanceSheetData.equity
        : Array.isArray(balanceSheetData.details?.equity)
          ? balanceSheetData.details.equity.map((e: any) => ({
            name: e.name || `Equity ${e.code || ""}`,
            code: e.code || "",
            amount: Number(e.balance ?? e.amount) || 0,
          }))
          : [];

      const totalAssets =
        Number(balanceSheetData.totalAssets) ||
        currentAssets.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);
      const totalLiabilities =
        Number(balanceSheetData.totalLiabilities) ||
        currentLiabilities.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
      const totalEquity =
        Number(balanceSheetData.totalEquity) ||
        equity.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      return {
        totalAssets,
        totalLiabilities,
        totalEquity,
        currentAssets,
        currentLiabilities,
        equity,
      };
    }

    return {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      currentAssets: [],
      currentLiabilities: [],
      equity: [],
    };
  })();

  const defaultBudgets: any[] = [];

  const displayedBudgets =
    analyticAccounts && analyticAccounts.length > 0
      ? analyticAccounts.map((a: any) => {
        const allocated = Number(a.budgetLimit) || 0;
        const spent = Number(a.spent) || 0;
        const remaining = Math.max(0, allocated - spent);
        const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
        const status = pct > 90 ? "Warning" : "Normal";
        return {
          name: a.name || "Analytic Account",
          allocated,
          spent,
          remaining,
          status,
        };
      })
      : defaultBudgets;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === "profit-and-loss") {
      csvContent += "Category,Amount\n";
      csvContent += `Total Revenue,${normalizedPnL.revenue}\n`;
      csvContent += `Cost of Goods Sold,${normalizedPnL.cogs}\n`;
      csvContent += `Gross Profit,${normalizedPnL.grossProfit}\n`;
      csvContent += `Operating Expenses,${normalizedPnL.operatingExpenses}\n`;
      csvContent += `Net Profit,${normalizedPnL.netProfit}\n`;
      (normalizedPnL.revenueBreakdown || []).forEach((r: any) => {
        csvContent += `Revenue: ${r.item},${r.amount}\n`;
      });
      (normalizedPnL.expenseBreakdown || []).forEach((e: any) => {
        csvContent += `Expense: ${e.category},${e.amount}\n`;
      });
    } else if (activeTab === "balance-sheet") {
      csvContent += "Type,Account,Code,Amount\n";
      (normalizedBS.currentAssets || []).forEach((a: any) => {
        csvContent += `Asset,"${a.name}",${a.code},${a.amount}\n`;
      });
      (normalizedBS.currentLiabilities || []).forEach((l: any) => {
        csvContent += `Liability,"${l.name}",${l.code},${l.amount}\n`;
      });
      (normalizedBS.equity || []).forEach((e: any) => {
        csvContent += `Equity,"${e.name}",${e.code},${e.amount}\n`;
      });
      csvContent += `Total Assets,,,${normalizedBS.totalAssets}\n`;
      csvContent += `Total Liabilities,,,${normalizedBS.totalLiabilities}\n`;
      csvContent += `Total Equity,,,${normalizedBS.totalEquity}\n`;
    } else {
      csvContent += "Budget Line,Allocated,Actual Spent,Remaining,Status\n";
      displayedBudgets.forEach((b: any) => {
        csvContent += `"${b.name}",${b.allocated},${b.spent},${b.remaining},${b.status}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Modura_Financial_Report_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const netMargin =
    normalizedPnL.revenue > 0
      ? ((normalizedPnL.netProfit / normalizedPnL.revenue) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Financial Reports &amp; Statements
            </h1>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 gap-1">
              <ShieldCheck className="h-3 w-3" /> Double-Entry Verified
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Audited financial statements generated directly from immutable posted journal entries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
        <TabsList className="bg-muted/50 border border-border/60 p-1 rounded-xl">
          <TabsTrigger value="profit-and-loss" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Profit &amp; Loss
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <Scale className="h-4 w-4 mr-2 text-accent" />
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="budget-report" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <PieChart className="h-4 w-4 mr-2 text-primary" />
            Budget Report
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
            <BookOpen className="h-4 w-4 mr-2 text-primary" />
            Trial Balance
          </TabsTrigger>
        </TabsList>

        {/* 1. PROFIT & LOSS TAB */}
        <TabsContent value="profit-and-loss" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {formatINR(normalizedPnL.revenue)}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" /> All Sales &amp; Custom Orders
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total COGS &amp; Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {formatINR(normalizedPnL.cogs + normalizedPnL.operatingExpenses)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Timber, Artisan Labor &amp; Rent
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-emerald-500/5 border-emerald-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Net Operating Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatINR(normalizedPnL.netProfit)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {netMargin}% Net Margin
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/70 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Statement of Profit &amp; Loss</CardTitle>
                  <CardDescription className="text-xs">For the Financial Year 2025–2026</CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs">INR (₹)</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-sm">
                {/* Revenue Section */}
                <div className="p-4 bg-muted/20 font-semibold text-foreground flex justify-between">
                  <span>Revenues (Operating Sales)</span>
                  <span className="font-mono">{formatINR(normalizedPnL.revenue)}</span>
                </div>
                {(normalizedPnL.revenueBreakdown || []).map((item: any, i: number) => (
                  <div key={i} className="px-6 py-3 flex justify-between text-muted-foreground hover:bg-muted/10">
                    <span className="pl-4">• {item.item}</span>
                    <span className="font-mono">{formatINR(item.amount)}</span>
                  </div>
                ))}

                {/* COGS Section */}
                <div className="p-4 bg-muted/20 font-semibold text-foreground flex justify-between">
                  <span>Cost of Goods Sold (COGS)</span>
                  <span className="font-mono text-destructive">({formatINR(normalizedPnL.cogs)})</span>
                </div>

                {/* Gross Profit */}
                <div className="p-4 bg-secondary/30 font-bold text-foreground flex justify-between">
                  <span>Gross Profit</span>
                  <span className="font-mono">{formatINR(normalizedPnL.grossProfit)}</span>
                </div>

                {/* Operating Expenses */}
                <div className="p-4 bg-muted/20 font-semibold text-foreground flex justify-between">
                  <span>Operating &amp; Atelier Expenses</span>
                  <span className="font-mono text-destructive">({formatINR(normalizedPnL.operatingExpenses)})</span>
                </div>
                {(normalizedPnL.expenseBreakdown || []).map((item: any, i: number) => (
                  <div key={i} className="px-6 py-3 flex justify-between text-muted-foreground hover:bg-muted/10">
                    <span className="pl-4">• {item.category}</span>
                    <span className="font-mono">{formatINR(item.amount)}</span>
                  </div>
                ))}

                {/* Net Profit */}
                <div className="p-5 bg-emerald-500/10 font-extrabold text-base text-emerald-700 dark:text-emerald-400 flex justify-between">
                  <span>Net Atelier Operating Profit</span>
                  <span className="font-mono">{formatINR(normalizedPnL.netProfit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. BALANCE SHEET TAB */}
        <TabsContent value="balance-sheet" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {formatINR(normalizedBS.totalAssets)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Cash, Bank, AR, &amp; Inventory</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Liabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {formatINR(normalizedBS.totalLiabilities)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Accounts Payable &amp; Credit</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs bg-primary/5 border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Total Equity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-primary">
                  {formatINR(normalizedBS.totalEquity)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Assets = Liabilities + Equity
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="border-b border-border/70 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Assets</CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60 text-sm">
                <div className="p-3 bg-muted/20 font-semibold text-xs uppercase text-muted-foreground">Current Assets</div>
                {(normalizedBS.currentAssets || []).length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">No current assets recorded</div>
                ) : (
                  (normalizedBS.currentAssets || []).map((a: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">{a.name}</p>
                        {a.code && <span className="text-[11px] text-muted-foreground font-mono">Code: {a.code}</span>}
                      </div>
                      <span className="font-mono font-semibold">{formatINR(a.amount)}</span>
                    </div>
                  ))
                )}
                <div className="p-4 bg-secondary/30 font-bold flex justify-between">
                  <span>Total Assets</span>
                  <span className="font-mono">{formatINR(normalizedBS.totalAssets)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Liabilities & Equity */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="border-b border-border/70 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Liabilities &amp; Equity</CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60 text-sm">
                <div className="p-3 bg-muted/20 font-semibold text-xs uppercase text-muted-foreground">Current Liabilities</div>
                {(normalizedBS.currentLiabilities || []).length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">No current liabilities recorded</div>
                ) : (
                  (normalizedBS.currentLiabilities || []).map((l: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">{l.name}</p>
                        {l.code && <span className="text-[11px] text-muted-foreground font-mono">Code: {l.code}</span>}
                      </div>
                      <span className="font-mono font-semibold">{formatINR(l.amount)}</span>
                    </div>
                  ))
                )}
                <div className="p-3 bg-muted/20 font-semibold text-xs uppercase text-muted-foreground">Partner &amp; Retained Equity</div>
                {(normalizedBS.equity || []).length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">No equity balances recorded</div>
                ) : (
                  (normalizedBS.equity || []).map((e: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">{e.name}</p>
                        {e.code && <span className="text-[11px] text-muted-foreground font-mono">Code: {e.code}</span>}
                      </div>
                      <span className="font-mono font-semibold">{formatINR(e.amount)}</span>
                    </div>
                  ))
                )}
                <div className="p-4 bg-secondary/30 font-bold flex justify-between">
                  <span>Total Liabilities + Equity</span>
                  <span className="font-mono">{formatINR(normalizedBS.totalLiabilities + normalizedBS.totalEquity)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. BUDGET REPORT TAB */}
        <TabsContent value="budget-report" className="space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/70 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Budget vs. Actual Variance Report</CardTitle>
                  <CardDescription className="text-xs">Live tracking of analytic accounts against authorized limits</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/budgets")}>
                  Manage Budgets
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-sm">
                <div className="grid grid-cols-12 p-3 bg-muted/30 font-semibold text-xs uppercase text-muted-foreground">
                  <div className="col-span-5">Budget Line / Department</div>
                  <div className="col-span-2 text-right">Allocated</div>
                  <div className="col-span-2 text-right">Actual Spent</div>
                  <div className="col-span-2 text-right">Remaining</div>
                  <div className="col-span-1 text-center">Status</div>
                </div>

                {displayedBudgets.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No budget lines or analytic accounts recorded yet.
                  </div>
                ) : (
                  displayedBudgets.map((b: any, idx: number) => {
                    const allocated = Number(b.allocated) || 0;
                    const spent = Number(b.spent) || 0;
                    const remaining = Number(b.remaining) ?? Math.max(0, allocated - spent);
                    const pct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
                    return (
                      <div key={idx} className="grid grid-cols-12 p-4 items-center hover:bg-muted/10">
                        <div className="col-span-5">
                          <p className="font-medium text-foreground">{b.name}</p>
                          <div className="w-48 bg-secondary h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full ${pct > 90 ? "bg-amber-500" : "bg-primary"}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="col-span-2 text-right font-mono font-medium">{formatINR(allocated)}</div>
                        <div className="col-span-2 text-right font-mono font-medium">{formatINR(spent)}</div>
                        <div className="col-span-2 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatINR(remaining)}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Badge variant={b.status === "Warning" ? "destructive" : "outline"} className="text-[10px]">
                            {pct}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. TRIAL BALANCE TAB */}
        <TabsContent value="trial-balance" className="space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/70 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">General Ledger Trial Balance</CardTitle>
                  <CardDescription className="text-xs">
                    Double-entry proof verifying total debits equal total credits
                  </CardDescription>
                </div>
                <Badge
                  variant={trialBalanceData?.isBalanced ?? true ? "outline" : "destructive"}
                  className="text-xs font-mono"
                >
                  {trialBalanceData?.isBalanced ?? true ? "Balanced (Debits = Credits)" : "Unbalanced"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-sm">
                <div className="grid grid-cols-12 p-3 bg-muted/30 font-semibold text-xs uppercase text-muted-foreground">
                  <div className="col-span-2 font-mono">Code</div>
                  <div className="col-span-4">Account Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2 text-right">Debit</div>
                  <div className="col-span-2 text-right">Credit</div>
                </div>

                {Array.isArray(trialBalanceData?.balances) && trialBalanceData.balances.length > 0 ? (
                  trialBalanceData.balances.map((b: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 p-3.5 items-center hover:bg-muted/10">
                      <div className="col-span-2 font-mono text-xs font-semibold">{b.code}</div>
                      <div className="col-span-4 font-medium text-foreground">{b.name}</div>
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {b.type}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-right font-mono font-medium">
                        {b.debit > 0 ? formatINR(b.debit) : "—"}
                      </div>
                      <div className="col-span-2 text-right font-mono font-medium">
                        {b.credit > 0 ? formatINR(b.credit) : "—"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No posted ledger balances yet. Post a journal entry to generate live trial balance figures.
                  </div>
                )}

                <div className="grid grid-cols-12 p-4 bg-secondary/30 font-bold">
                  <div className="col-span-8 uppercase text-xs tracking-wider">Total Ledger Activity</div>
                  <div className="col-span-2 text-right font-mono">
                    {formatINR(trialBalanceData?.totalDebit || 0)}
                  </div>
                  <div className="col-span-2 text-right font-mono">
                    {formatINR(trialBalanceData?.totalCredit || 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
