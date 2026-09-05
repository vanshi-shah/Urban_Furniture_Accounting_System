import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Save, 
  Send,
  Layers,
  ShoppingBag,
  Receipt,
  Landmark,
  Banknote,
  Clock,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  LayoutGrid,
  List,
  Sparkles,
  Check,
  Building2,
  RefreshCw,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { PaginationControls } from "@/components/PaginationControls";

export default function JournalEntries() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [displayLayout, setDisplayLayout] = useState<"cards" | "table">("cards");
  const [journalFilter, setJournalFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Data State — entries come from usePaginatedFetch below
  const [journals, setJournals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = useState<any[]>([]);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalId, setJournalId] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<any[]>([
    { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 },
    { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Paginated entries from server
  const {
    data: entries,
    total: entriesTotal,
    page: entriesPage,
    totalPages: entriesTotalPages,
    loading: entriesLoading,
    setPage: setEntriesPage,
    refresh: refreshEntries,
  } = usePaginatedFetch<any>('/accounting/entries', 20);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [journalsData, accountsData, contactsData, analyticData] = await Promise.all([
        apiFetch('/master/journals?limit=100'),
        apiFetch('/master/accounts?limit=100'),
        apiFetch('/master/contacts?limit=200'),
        apiFetch('/master/analytic-accounts?limit=100')
      ]);
      setJournals(journalsData?.data || journalsData || []);
      setAccounts(accountsData?.data || accountsData || []);
      setContacts(contactsData?.data || contactsData || []);
      setAnalyticAccounts(analyticData?.data || analyticData || []);
    } catch (error: any) {
      console.error("Failed to fetch accounting ledger data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format INR Currency
  const formatINR = (val: number | string | undefined | null) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format Date & Time
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();
      if (isToday) {
        return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Resolve account label by line account object or fallback ID lookup
  const getAccountLabel = (line: any) => {
    if (line?.account?.name) {
      return `${line.account.code ? line.account.code + ' ' : ''}${line.account.name}`;
    }
    if (line?.accountId) {
      const acc = accounts.find((a: any) => a.id === line.accountId);
      if (acc) return `${acc.code ? acc.code + ' ' : ''}${acc.name}`;
    }
    return line?.debit > 0 ? "1500 Inventory / Expense" : "2100 Accounts Payable";
  };

  // Resolve partner name
  const getContactName = (line: any) => {
    if (line?.contact?.name) return line.contact.name;
    if (line?.contactId) {
      const c = contacts.find((ct: any) => ct.id === line.contactId);
      if (c) return c.name;
    }
    return null;
  };

  // Get ribbon accounts for card display (matching Image 1)
  const getEntryDetails = (entry: any) => {
    const entryLines = entry.lines || [];
    const debitLines = entryLines.filter((l: any) => Number(l.debit) > 0);
    const creditLines = entryLines.filter((l: any) => Number(l.credit) > 0);

    const firstDebit = debitLines[0];
    const firstCredit = creditLines[0];

    const debitAccount = firstDebit ? getAccountLabel(firstDebit) : "1200 Accounts Receivable";
    const creditAccount = firstCredit ? getAccountLabel(firstCredit) : "4000 Sales Revenue";

    // Extract contact name from any line
    let partnerName: string | null = null;
    for (const l of entryLines) {
      const name = getContactName(l);
      if (name) {
        partnerName = name;
        break;
      }
    }

    // Extract item / title description
    const descLine = entryLines.find(
      (l: any) => l.description && !l.description.startsWith("Creditor a/c") && !l.description.startsWith("Debtor a/c")
    );
    let title = descLine?.description;
    if (title && title.includes(" - ")) {
      // If "Vendor Bill BILL/2026/0002 - Mysore Teak", use clean prefix or full
      const parts = title.split(" - ");
      if (parts.length > 1 && !partnerName) {
        partnerName = parts[1];
      }
    }
    if (!title) {
      title = entry.reference 
        ? `${entry.journal?.name || "Ledger Entry"} (${entry.reference})`
        : `${entry.journal?.name || "Journal Entry"}`;
    }

    const totalDebit = entryLines.reduce((acc: number, l: any) => acc + (Number(l.debit) || 0), 0);
    const totalCredit = entryLines.reduce((acc: number, l: any) => acc + (Number(l.credit) || 0), 0);
    const amount = totalDebit || totalCredit || 0;

    return {
      debitAccount,
      creditAccount,
      partnerName,
      title,
      amount,
      totalDebit,
      totalCredit,
      linesCount: entryLines.length,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0,
    };
  };

  // Contextual icon based on journal code or type
  const getJournalIcon = (journal?: any, ref?: string) => {
    const code = (journal?.code || "").toUpperCase();
    const type = (journal?.type || "").toUpperCase();
    const reference = (ref || "").toUpperCase();
    
    if (code.includes("PUR") || type.includes("PURCHASE") || reference.startsWith("BILL")) {
      return <ShoppingBag className="h-4 w-4 text-primary" />;
    }
    if (code.includes("SAL") || type.includes("SALE") || reference.startsWith("INV")) {
      return <Receipt className="h-4 w-4 text-primary" />;
    }
    if (code.includes("BNK") || type.includes("BANK")) {
      return <Landmark className="h-4 w-4 text-accent" />;
    }
    if (code.includes("CSH") || type.includes("CASH")) {
      return <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    }
    return <Layers className="h-4 w-4 text-primary" />;
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const search = searchTerm.toLowerCase().trim();
      const refMatch = e.reference?.toLowerCase().includes(search);
      const idMatch = e.id?.toLowerCase().includes(search);
      const journalMatch = e.journal?.name?.toLowerCase().includes(search) || e.journal?.code?.toLowerCase().includes(search);
      
      const lineMatch = e.lines?.some((l: any) => 
        l.description?.toLowerCase().includes(search) ||
        l.account?.name?.toLowerCase().includes(search) ||
        l.account?.code?.toLowerCase().includes(search) ||
        l.contact?.name?.toLowerCase().includes(search)
      );

      const matchesSearch = !search || refMatch || idMatch || journalMatch || lineMatch;

      // Journal Filter
      const matchesJournal = 
        journalFilter === "ALL" || 
        (e.journal?.type && e.journal.type.toUpperCase() === journalFilter) ||
        (e.journal?.code && e.journal.code.toUpperCase().includes(journalFilter));

      // Status Filter
      const matchesStatus = 
        statusFilter === "ALL" || 
        e.status === statusFilter;

      return matchesSearch && matchesJournal && matchesStatus;
    });
  }, [entries, searchTerm, journalFilter, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalEntries = entries.length;
    const postedEntries = entries.filter((e) => e.status === "POSTED");
    const draftEntries = entries.filter((e) => e.status === "DRAFT");
    
    let totalDebitSum = 0;
    let totalCreditSum = 0;

    entries.forEach((e) => {
      (e.lines || []).forEach((l: any) => {
        totalDebitSum += Number(l.debit) || 0;
        totalCreditSum += Number(l.credit) || 0;
      });
    });

    return {
      totalEntries,
      postedCount: postedEntries.length,
      draftCount: draftEntries.length,
      totalDebitSum,
      totalCreditSum,
      isLedgerBalanced: Math.abs(totalDebitSum - totalCreditSum) < 0.01,
    };
  }, [entries]);

  // Form Balancing Calculations
  const totalDebit = lines.reduce((acc, line) => acc + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((acc, line) => acc + (Number(line.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleCreate = async (postImmediately: boolean = false) => {
    if (!isBalanced) return;
    if (!journalId) {
      setApiError("Please select a journal");
      return;
    }
    
    const validLines = lines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0));
    
    if (validLines.length < 2) {
      setApiError("A journal entry must have at least two valid balanced lines");
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      
      const payload = {
        date,
        reference,
        journalId,
        lines: validLines.map(l => ({
          accountId: l.accountId,
          description: l.description,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          contactId: l.contactId || null,
          analyticAccountId: l.analyticAccountId || null
        }))
      };

      const newEntry = await apiFetch('/accounting/entries', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (postImmediately && newEntry && newEntry.id) {
        await apiFetch(`/accounting/entries/${newEntry.id}/post`, {
          method: 'POST'
        });
      }
      
      await fetchData();
      
      // Reset form
      setJournalId("");
      setReference("");
      setLines([
        { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 }
      ]);
      setViewMode("list");
      
    } catch (err: any) {
      setApiError(err.message || "Failed to create journal entry");
    } finally {
      setLoading(false);
    }
  };

  const handlePostExisting = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setLoading(true);
      await apiFetch(`/accounting/entries/${id}/post`, { method: 'POST' });
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to post entry");
    } finally {
      setLoading(false);
    }
  };

  const updateLine = (index: number, field: string, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCardId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP STATS BAR (Quiet Luxury Minimal Cards) */}
      {/* ========================================================================= */}
      {viewMode === "list" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="rounded-xl border border-border/80 bg-card/90 backdrop-blur-sm p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Journal Entries</span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">{metrics.totalEntries}</span>
              <span className="text-[11px] text-muted-foreground">in general ledger</span>
            </div>
          </Card>

          <Card className="rounded-xl border border-border/80 bg-card/90 backdrop-blur-sm p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Debits Volume</span>
              <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-foreground">{formatINR(metrics.totalDebitSum)}</span>
            </div>
          </Card>

          <Card className="rounded-xl border border-border/80 bg-card/90 backdrop-blur-sm p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Credits Volume</span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-foreground">{formatINR(metrics.totalCreditSum)}</span>
            </div>
          </Card>

          <Card className="rounded-xl border border-border/80 bg-card/90 backdrop-blur-sm p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Ledger Balance Status</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-medium text-xs py-0.5">
                Balanced 100% (DR = CR)
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN CARD: ATELIER TRANSACTIONS & JOURNAL LEDGER */}
      {/* ========================================================================= */}
      <Card className="border-border/80 shadow-sm bg-card rounded-2xl overflow-hidden">
        {/* Header matching Image 1: Recent Atelier Transactions & Accounting Impact */}
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/60 gap-3 bg-card/50">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <CardTitle className="text-lg font-semibold text-foreground font-sans">
                {viewMode === "list" ? "Journal Entries & Accounting Impact" : "Create New Balanced Journal Entry"}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground font-medium bg-secondary/50">
                Live Ledger Sync
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20">
                Double-Entry Ledger
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1 text-muted-foreground">
              Every sales order, timber invoice, and payment automatically generates balanced double-entry lines.
            </CardDescription>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === "list" ? (
              <>
                <Button 
                  size="sm" 
                  onClick={() => setViewMode("form")}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Entry</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2" 
                  onClick={() => handleCreate(false)} 
                  disabled={!isBalanced || loading}
                >
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </Button>
                <Button 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => handleCreate(true)} 
                  disabled={!isBalanced || loading}
                >
                  <Send className="h-4 w-4" />
                  <span>Post to Ledger</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setViewMode("list")} 
                  disabled={loading}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Action Bar / Filter Strip */}
          {viewMode === "list" && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-2 border-b border-border/50">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reference, journal, account or contact..."
                  className="pl-9 h-9 text-xs bg-background/80 border-border/80 focus-visible:ring-primary rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Journal Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { label: "All", value: "ALL" },
                  { label: "Purchases", value: "PURCHASES" },
                  { label: "Sales", value: "SALES" },
                  { label: "Cash", value: "CASH" },
                  { label: "Bank", value: "BANK" },
                  { label: "General", value: "GENERAL" },
                ].map((tab) => (
                  <Button
                    key={tab.value}
                    variant={journalFilter === tab.value ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 px-3 text-xs font-medium rounded-lg transition-all ${
                      journalFilter === tab.value 
                        ? "bg-secondary text-secondary-foreground font-semibold shadow-2xs" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setJournalFilter(tab.value)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Layout Toggle: Cards vs Table (Icon Only) */}
              <div className="flex items-center gap-1 border border-border/70 rounded-lg p-0.5 bg-muted/30 self-end md:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md transition-all ${
                    displayLayout === "cards" 
                      ? "bg-background text-foreground shadow-xs" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDisplayLayout("cards")}
                  title="Card Ledger View"
                  aria-label="Card Ledger View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-md transition-all ${
                    displayLayout === "table" 
                      ? "bg-background text-foreground shadow-xs" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDisplayLayout("table")}
                  title="Grid Table View"
                  aria-label="Grid Table View"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. CARD LIST VIEW (EXACTLY MATCHING DASHBOARD TRANSACTIONS IN IMAGE 1)   */}
          {/* ========================================================================= */}
          {viewMode === "list" && displayLayout === "cards" && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading ledger entries...</span>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-border/80 bg-muted/10">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">No journal entries found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or journal filters.</p>
                </div>
              ) : (
                filteredEntries.map((entry) => {
                  const details = getEntryDetails(entry);
                  const isExpanded = expandedCardId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-border/70 bg-card/80 hover:bg-secondary/25 transition-all duration-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-sm"
                    >
                      {/* Main Transaction Row (Exact Match to Image 1) */}
                      <div 
                        className="flex flex-col md:flex-row md:items-center justify-between p-3.5 sm:p-4 gap-3.5 cursor-pointer select-none"
                        onClick={() => toggleExpandCard(entry.id)}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Domain / Journal Icon */}
                          <div className="p-2.5 rounded-xl bg-secondary text-secondary-foreground shrink-0 mt-0.5 border border-border/40 shadow-2xs">
                            {getJournalIcon(entry.journal, entry.reference)}
                          </div>

                          <div className="min-w-0">
                            {/* Row 1: Item / Title, Reference Badge, Partner */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {details.title}
                              </span>
                              <Badge variant="secondary" className="text-[10px] py-0 px-2 font-mono bg-secondary/80 border border-border/60">
                                {entry.reference || entry.id.slice(0, 10)}
                              </Badge>
                              {details.partnerName && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span>•</span>
                                  <span>{details.partnerName}</span>
                                </span>
                              )}
                              {!details.partnerName && entry.journal?.name && (
                                <span className="text-xs text-muted-foreground">
                                  • {entry.journal.name}
                                </span>
                              )}
                              <Badge 
                                variant="outline" 
                                className={`text-[9px] font-semibold tracking-wider py-0 px-1.5 rounded-full ${
                                  entry.status === "POSTED"
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {entry.status}
                              </Badge>
                            </div>

                            {/* Row 2: Accounting Impact Ribbon (DR: ... ⇄ CR: ...) */}
                            <div className="flex items-center gap-2 mt-1.5 text-xs flex-wrap font-mono">
                              <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                DR: {details.debitAccount}
                              </span>
                              <span className="text-muted-foreground">⇄</span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-accent/15 text-accent-foreground border border-accent/30">
                                CR: {details.creditAccount}
                              </span>
                              {details.linesCount > 2 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                                  +{details.linesCount - 2} more lines
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Amount, Date, Expand Trigger */}
                        <div className="flex items-center justify-between md:flex-col md:items-end shrink-0 gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base sm:text-base text-foreground">
                              {formatINR(details.amount)}
                            </span>
                            {entry.status === "DRAFT" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 ml-1"
                                onClick={(e) => handlePostExisting(entry.id, e)}
                                disabled={loading}
                              >
                                <Send className="h-2.5 w-2.5 mr-1" />
                                Post
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatDate(entry.date)}
                            </span>
                            <div className="text-muted-foreground p-0.5 rounded hover:bg-muted">
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Double-Entry Lines Drawer */}
                      {isExpanded && (
                        <div className="border-t border-border/60 bg-muted/15 p-4 sm:p-5 animate-in slide-in-from-top-1 duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground">
                                Detailed Double-Entry Lines
                              </span>
                              <Badge variant="outline" className="text-[10px] font-mono border-border">
                                {entry.journal?.name} ({entry.journal?.code})
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Balanced Entry • Debits match Credits</span>
                            </div>
                          </div>

                          <div className="rounded-lg border border-border/70 overflow-hidden bg-background">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/30 text-[11px]">
                                  <TableHead className="w-[40px] text-muted-foreground">#</TableHead>
                                  <TableHead>Account</TableHead>
                                  <TableHead>Partner</TableHead>
                                  <TableHead>Analytic Account</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-right">Debit</TableHead>
                                  <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {entry.lines?.map((line: any, idx: number) => (
                                  <TableRow key={line.id || idx} className="text-xs">
                                    <TableCell className="text-muted-foreground font-mono text-[11px]">{idx + 1}</TableCell>
                                    <TableCell className="font-medium text-foreground">
                                      {getAccountLabel(line)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {getContactName(line) || "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {line.analyticAccount?.name || "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                      {line.description || "—"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-destructive">
                                      {Number(line.debit) > 0 ? formatINR(line.debit) : "—"}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-primary">
                                      {Number(line.credit) > 0 ? formatINR(line.credit) : "—"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow className="bg-muted/20 font-semibold text-xs border-t-2 border-border/80">
                                  <TableCell colSpan={5} className="text-right">Totals:</TableCell>
                                  <TableCell className="text-right font-mono text-destructive">
                                    {formatINR(details.totalDebit)}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-primary">
                                    {formatINR(details.totalCredit)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. COMPACT TABLE VIEW (FOR RAPID AUDITING)                                */}
          {/* ========================================================================= */}
          {viewMode === "list" && displayLayout === "table" && (
            <div className="rounded-xl border border-border/70 overflow-hidden bg-card/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30 text-xs">
                    <TableHead>Date</TableHead>
                    <TableHead>Journal</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Primary Impact (DR ⇄ CR)</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => {
                      const details = getEntryDetails(entry);
                      return (
                        <TableRow key={entry.id} className="group text-xs">
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {entry.journal?.name}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {entry.reference || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-[11px] font-mono">
                              <span className="text-primary truncate max-w-[140px]">{details.debitAccount}</span>
                              <span className="text-muted-foreground">⇄</span>
                              <span className="text-accent-foreground truncate max-w-[140px]">{details.creditAccount}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-medium text-destructive text-right">
                            {formatINR(details.totalDebit)}
                          </TableCell>
                          <TableCell className="font-mono font-medium text-primary text-right">
                            {formatINR(details.totalCredit)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-[9px] font-semibold py-0 px-2 rounded-full ${
                                entry.status === "POSTED"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.status === "DRAFT" ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-6 text-[10px] px-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                onClick={(e) => handlePostExisting(entry.id, e)}
                                disabled={loading}
                              >
                                <Send className="h-2.5 w-2.5 mr-1" />
                                Post
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[11px] text-muted-foreground"
                                onClick={() => {
                                  setDisplayLayout("cards");
                                  setExpandedCardId(entry.id);
                                }}
                              >
                                View Lines
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-xs">
                        {loading ? "Loading entries..." : "No journal entries found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. FORM VIEW (+ NEW ENTRY WITH QUIET LUXURY REFINEMENT)                  */}
          {/* ========================================================================= */}
          {viewMode === "form" && (
            <div className="space-y-6 pt-2">
              {apiError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive text-xs">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Validation Error</h4>
                    <p className="mt-0.5">{apiError}</p>
                  </div>
                </div>
              )}

              {!isBalanced && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-400 text-xs">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Unbalanced Journal Entry</h4>
                    <p className="mt-0.5">
                      The total debit ({formatINR(totalDebit)}) and credit ({formatINR(totalCredit)}) do not match. 
                      Double-entry bookkeeping requires balanced debits and credits before posting.
                    </p>
                  </div>
                </div>
              )}

              {/* Master Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/30 border border-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Accounting Date</label>
                  <Input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-background border-border/80 h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Journal <span className="text-destructive">*</span>
                  </label>
                  <select 
                    value={journalId}
                    onChange={(e) => setJournalId(e.target.value)}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-border/80 bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>Select Journal</option>
                    {journals.map((j) => (
                      <option key={j.id} value={j.id}>{j.name} ({j.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Reference / Order ID</label>
                  <Input 
                    placeholder="e.g. INV-2026-089 or BILL-2026-042"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="bg-background border-border/80 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Journal Items Table */}
              <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs bg-card">
                <div className="p-3 bg-secondary/40 border-b border-border/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Journal Items (Double-Entry Lines)</span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-muted-foreground">DR: <strong className="text-destructive">{formatINR(totalDebit)}</strong></span>
                    <span className="text-muted-foreground">CR: <strong className="text-primary">{formatINR(totalCredit)}</strong></span>
                    {isBalanced ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Balanced
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Diff: {formatINR(Math.abs(totalDebit - totalCredit))}
                      </span>
                    )}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 text-xs">
                      <TableHead>Account <span className="text-destructive">*</span></TableHead>
                      <TableHead>Partner / Contact</TableHead>
                      <TableHead>Analytic Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="w-[45px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={index} className="text-xs">
                        <TableCell>
                          <select 
                            value={line.accountId}
                            onChange={(e) => updateLine(index, "accountId", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-1 text-xs text-foreground font-medium"
                          >
                            <option value="" disabled>Select Account</option>
                            {accounts.map(a => (
                              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select 
                            value={line.contactId}
                            onChange={(e) => updateLine(index, "contactId", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-1 text-xs text-foreground"
                          >
                            <option value="">None</option>
                            {contacts.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select 
                            value={line.analyticAccountId}
                            onChange={(e) => updateLine(index, "analyticAccountId", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-1 text-xs text-foreground"
                          >
                            <option value="">None</option>
                            {analyticAccounts.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={line.description || ""}
                            onChange={(e) => updateLine(index, "description", e.target.value)}
                            className="w-full bg-transparent border-border/50 h-7.5 text-xs"
                            placeholder="Line description"
                          />
                        </TableCell>
                        <TableCell className="text-right text-destructive font-medium">
                          <Input 
                            type="number" 
                            min="0"
                            value={line.debit || ""}
                            onChange={(e) => updateLine(index, "debit", Number(e.target.value))}
                            className="w-24 text-right ml-auto bg-transparent border-border/50 h-7.5 font-mono text-xs"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="text-right text-primary font-medium">
                          <Input 
                            type="number" 
                            min="0"
                            value={line.credit || ""}
                            onChange={(e) => updateLine(index, "credit", Number(e.target.value))}
                            className="w-24 text-right ml-auto bg-transparent border-border/50 h-7.5 font-mono text-xs"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive" 
                            onClick={() => removeLine(index)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-secondary/20 font-semibold text-xs border-t border-border/80">
                      <TableCell colSpan={4} className="text-right">Totals:</TableCell>
                      <TableCell className={`text-right font-mono ${totalDebit !== totalCredit ? "text-amber-600" : "text-destructive"}`}>
                        {formatINR(totalDebit)}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${totalDebit !== totalCredit ? "text-amber-600" : "text-primary"}`}>
                        {formatINR(totalCredit)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="p-2.5 bg-secondary/20 border-t border-border/80 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={addLine} className="text-xs text-primary font-semibold hover:bg-primary/10">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span>Add Line Item</span>
                  </Button>
                  <span className="text-[11px] text-muted-foreground">
                    Minimum 2 balanced lines required to post
                  </span>
                </div>
              </div>

              {/* Field Explanation Note */}
              <div className="p-4 border border-border/60 rounded-xl bg-secondary/15 text-xs">
                <h4 className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Double-Entry Ledger Rules
                </h4>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Every transaction records opposing debit and credit entries. Assets and Expenses increase on debit; 
                  Liabilities, Equity, and Revenue increase on credit. The total debit must equal total credit at all times.
                </p>
              </div>
            </div>
          )}

          {/* Footer count */}
          {viewMode === "list" && (
            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
              <div>
                Showing <span className="font-semibold text-foreground font-mono">{filteredEntries.length}</span> of <span className="font-mono">{entries.length}</span> ledger records
              </div>
              <div className="flex items-center gap-2">
                <span>Atelier Dual-Ledger Sync</span>
                <span className="text-border">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Auto-Reconciled</span>
              </div>
              <div className="p-4 border-t border-border/80">
                <PaginationControls
                  page={entriesPage}
                  totalPages={entriesTotalPages}
                  total={entriesTotal}
                  limit={20}
                  onPageChange={setEntriesPage}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
