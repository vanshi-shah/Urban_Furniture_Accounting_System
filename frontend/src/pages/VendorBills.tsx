import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Plus, 
  FileText, 
  ArrowLeft, 
  AlertTriangle, 
  Search,
  Receipt,
  CreditCard,
  FileSpreadsheet,
  ExternalLink,
  BookOpen,
  PieChart,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExcelGrid, ExcelColumn } from "@/components/ExcelGrid";
import { BillPaymentModal } from "@/components/BillPaymentModal";
import { apiFetch } from "@/lib/api";

export default function VendorBills() {
  const location = useLocation();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"list" | "form">("form");
  const [bills, setBills] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const [billNumber, setBillNumber] = useState("BILL/2026/0001");
  const [vendorId, setVendorId] = useState("");
  const [billReference, setBillReference] = useState("ABC-26-001");
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [orderStatus, setOrderStatus] = useState<"DRAFT" | "CONFIRMED" | "CANCELLED">("DRAFT");
  const [sourceOrderId, setSourceOrderId] = useState<string | null>(null);
  const [journalEntryId, setJournalEntryId] = useState<string | null>(null);

  // Financial payment amounts
  const [paidViaCash, setPaidViaCash] = useState<number>(0);
  const [paidViaBank, setPaidViaBank] = useState<number>(0);

  // Line items
  const [lines, setLines] = useState<any[]>([
    {
      productId: "",
      accountId: "",
      analyticAccountId: "",
      qty: 3,
      unitPrice: 2000,
      total: 6000
    }
  ]);

  // Modals & Warnings
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdJournalEntry, setCreatedJournalEntry] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billList, contactList, productList, accountList, analyticList, seqRes] = await Promise.all([
        apiFetch("/orders?type=VENDOR_BILL"),
        apiFetch("/master/contacts"),
        apiFetch("/master/products"),
        apiFetch("/master/accounts"),
        apiFetch("/master/analytic-accounts"),
        apiFetch("/orders/next-sequence?type=VENDOR_BILL")
      ]);

      setBills(billList || []);
      setContacts(contactList?.filter((c: any) => c.type === "VENDOR") || contactList || []);
      setProducts(productList || []);
      setAccounts(accountList || []);
      setAnalytics(analyticList || []);

      // Default Purchase account (code 5000)
      const purchaseAcc = accountList?.find((a: any) => a.code === "5000") || accountList?.find((a: any) => a.type === "EXPENSE");

      // Check if routed from PO
      const state = location.state as any;
      if (state?.billId) {
        const loadedBill = await apiFetch(`/orders/${state.billId}`);
        if (loadedBill) {
          loadBillIntoForm(loadedBill, purchaseAcc?.id);
          return;
        }
      }

      if (seqRes?.sequence) {
        setBillNumber(seqRes.sequence);
      }

      const rahul = contactList?.find((c: any) => c.name?.toLowerCase().includes("rahul"));
      if (rahul) setVendorId(rahul.id);

      const tableProd = productList?.find((p: any) => p.name?.toLowerCase().includes("table"));
      const proj1 = analyticList?.find((a: any) => a.name?.toLowerCase().includes("project 1"));

      setLines([
        {
          productId: tableProd ? tableProd.id : (productList[0]?.id || ""),
          accountId: purchaseAcc ? purchaseAcc.id : (accountList[0]?.id || ""),
          analyticAccountId: proj1 ? proj1.id : (analyticList[0]?.id || ""),
          qty: 3,
          unitPrice: tableProd?.price || 2000,
          total: 3 * (tableProd?.price || 2000)
        }
      ]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadBillIntoForm = (bill: any, defaultPurchaseAccountId?: string) => {
    setActiveBillId(bill.id);
    setBillNumber(bill.orderNumber);
    setVendorId(bill.contactId);
    setBillReference(bill.reference || "ABC-26-001");
    setBillDate(new Date(bill.date).toISOString().split("T")[0]);
    if (bill.dueDate) {
      setDueDate(new Date(bill.dueDate).toISOString().split("T")[0]);
    }
    setOrderStatus(bill.status);
    setSourceOrderId(bill.sourceOrderId);
    setJournalEntryId(bill.journalEntryId);
    setPaidViaCash(bill.paidCash || 0);
    setPaidViaBank(bill.paidBank || 0);

    if (bill.journalEntry) {
      setCreatedJournalEntry(bill.journalEntry);
    }

    if (bill.lines && bill.lines.length > 0) {
      setLines(
        bill.lines.map((l: any) => ({
          productId: l.productId,
          accountId: l.accountId || defaultPurchaseAccountId,
          analyticAccountId: l.analyticAccountId,
          qty: l.quantity,
          unitPrice: l.unitPrice,
          total: l.subtotal
        }))
      );
    }
    setViewMode("form");
  };

  const calculateGrandTotal = () => {
    return lines.reduce((sum, line) => sum + (Number(line.total) || 0), 0);
  };

  const grandTotal = calculateGrandTotal();
  const totalPaid = Number(paidViaCash) + Number(paidViaBank);
  const amountDue = Math.max(0, grandTotal - totalPaid);

  // Status computation exactly as written in wireframe:
  // Paid: If amount due = 0 (and total > 0)
  // Partial: If amount due < Bill Total (and amount due > 0)
  // Not Paid: If amount due == Bill Total
  const getPaymentStatusBadge = () => {
    if (grandTotal > 0 && amountDue === 0) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 uppercase tracking-wide">
          Paid
        </Badge>
      );
    } else if (amountDue > 0 && amountDue < grandTotal) {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-500 text-white font-bold text-xs px-3 py-1 uppercase tracking-wide">
          Partial
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-rose-600 hover:bg-rose-600 text-white font-bold text-xs px-3 py-1 uppercase tracking-wide">
          Not Paid
        </Badge>
      );
    }
  };

  const handleNewBill = async () => {
    try {
      const seqRes = await apiFetch("/orders/next-sequence?type=VENDOR_BILL");
      setActiveBillId(null);
      setBillNumber(seqRes?.sequence || "BILL/2026/0001");
      setBillReference("ABC-26-001");
      setOrderStatus("DRAFT");
      setSourceOrderId(null);
      setJournalEntryId(null);
      setCreatedJournalEntry(null);
      setPaidViaCash(0);
      setPaidViaBank(0);
      setBudgetWarning(null);
      setErrorMessage("");

      const purchaseAcc = accounts.find((a) => a.code === "5000") || accounts[0];
      const tableProd = products.find((p) => p.name?.toLowerCase().includes("table")) || products[0];
      const proj1 = analytics.find((a) => a.name?.toLowerCase().includes("project 1")) || analytics[0];

      setLines([
        {
          productId: tableProd?.id || "",
          accountId: purchaseAcc?.id || "",
          analyticAccountId: proj1?.id || "",
          qty: 3,
          unitPrice: tableProd?.price || 2000,
          total: 6000
        }
      ]);
      setViewMode("form");
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleConfirmBill = async () => {
    if (!vendorId) {
      setErrorMessage("Please select a Vendor Name from Contact Master");
      return;
    }
    if (lines.length === 0) {
      setErrorMessage("Please add at least one line item");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      let billId = activeBillId;
      if (!billId) {
        // Create draft bill first
        const payload = {
          type: "VENDOR_BILL",
          orderNumber: billNumber,
          reference: billReference,
          date: billDate,
          dueDate,
          contactId: vendorId,
          sourceOrderId: sourceOrderId || null,
          lines: lines.map((l) => ({
            productId: l.productId,
            accountId: l.accountId,
            analyticAccountId: l.analyticAccountId || null,
            quantity: Number(l.qty) || 1,
            unitPrice: Number(l.unitPrice) || 0
          }))
        };

        const created = await apiFetch("/orders", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        billId = created.id;
        setActiveBillId(created.id);
      }

      // Confirm Bill on backend (Automatically creates balanced Journal Entry in Purchases journal)
      const confirmedRes = await apiFetch(`/orders/${billId}/confirm`, {
        method: "POST"
      });

      setOrderStatus("CONFIRMED");
      if (confirmedRes?.order?.journalEntryId) {
        setJournalEntryId(confirmedRes.order.journalEntryId);
        setCreatedJournalEntry(confirmedRes.order.journalEntry);
      }

      // Check for non-blocking budget warning
      const selectedAnalytic = analytics.find((a) => a.id === lines[0]?.analyticAccountId);
      if (
        (selectedAnalytic && selectedAnalytic.budgetLimit && grandTotal > selectedAnalytic.budgetLimit) ||
        confirmedRes?.order?.budgetWarning?.exceedsBudget
      ) {
        setBudgetWarning(
          "The entered amount is higher than the remaining budget amount for this budget line. Consider adjusting the value or revise the budget."
        );
      } else {
        setBudgetWarning(null);
      }

      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to confirm vendor bill");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (updatedOrder: any) => {
    setPaidViaCash(updatedOrder.paidCash || 0);
    setPaidViaBank(updatedOrder.paidBank || 0);
    setIsPaymentModalOpen(false);
    fetchData();
  };

  const handleAddLine = () => {
    const purchaseAcc = accounts.find((a) => a.code === "5000") || accounts[0];
    setLines([
      ...lines,
      {
        productId: products[0]?.id || "",
        accountId: purchaseAcc?.id || "",
        analyticAccountId: analytics[0]?.id || "",
        qty: 1,
        unitPrice: products[0]?.price || 0,
        total: products[0]?.price || 0
      }
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  // Excel Grid Column Definitions for Vendor Bill
  const excelColumns: ExcelColumn[] = [
    {
      key: "productId",
      header: "Product",
      colLetter: "A",
      type: "select",
      options: products.map((p) => ({
        value: p.id,
        label: p.name,
        price: p.price
      })),
      placeholder: "(Product Master - Many to one)",
      width: "25%"
    },
    {
      key: "accountId",
      header: "Chart of Account",
      colLetter: "B",
      type: "select",
      options: accounts.map((a) => ({
        value: a.id,
        label: `${a.code} - ${a.name}`
      })),
      placeholder: "Purchase (by default)",
      width: "25%"
    },
    {
      key: "analyticAccountId",
      header: "Budget Analytics",
      colLetter: "C",
      type: "select",
      options: analytics.map((a) => ({
        value: a.id,
        label: a.name
      })),
      placeholder: "(Analytics master - Many to one)",
      width: "22%"
    },
    {
      key: "qty",
      header: "Qty",
      colLetter: "D",
      type: "number",
      align: "right",
      width: "9%"
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      colLetter: "E",
      type: "currency",
      align: "right",
      width: "10%"
    },
    {
      key: "total",
      header: "Total",
      colLetter: "F",
      type: "readonly",
      align: "right",
      width: "9%"
    }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 print:p-0">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Vendor Bill
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto generate Bill number +1 of last Bill • Balanced double-entry purchase ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "list" ? (
            <Button
              size="sm"
              onClick={handleNewBill}
              className="gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Plus className="h-4 w-4" />
              New Vendor Bill
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode("list")}
              className="gap-1.5 border-border"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              View All Bills
            </Button>
          )}
        </div>
      </div>

      {viewMode === "form" ? (
        <Card className="border border-border/80 shadow-md bg-card overflow-hidden">
          <CardContent className="p-0">
            {/* Action Bar matching wireframe:
                Left: New, Confirm, Pay
                Right: PO (if from PO), Budget, Cancel, Back */}
            <div className="p-4 bg-muted/20 border-b border-border/80 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNewBill}
                  className="rounded-md px-4 font-semibold text-xs border-border"
                >
                  New
                </Button>

                <Button
                  size="sm"
                  onClick={handleConfirmBill}
                  disabled={loading || orderStatus === "CONFIRMED"}
                  className={`rounded-md px-4 font-semibold text-xs transition-all ${
                    orderStatus === "CONFIRMED"
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {orderStatus === "CONFIRMED" ? "Confirmed" : "Confirm"}
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={orderStatus !== "CONFIRMED" || amountDue === 0}
                  className="rounded-md px-4 font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  title="Clicking on Pay button from Bill"
                >
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  Pay
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* PO Smart Button: Only show if bill created from PO */}
                {sourceOrderId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/purchase-orders")}
                    className="rounded-md px-3 font-semibold text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                    title="On click open the PO from which Bill Created (Only show this if bill created from PO. Hide if Bill created Fresh without PO)"
                  >
                    PO
                  </Button>
                )}

                {/* Budget Smart Button: Open the Budget/Analytic Report */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/budgets")}
                  className="rounded-md px-3 font-semibold text-xs border-border text-foreground hover:bg-muted"
                  title="On click - Open the Budget/Analytic Report that is used for bill"
                >
                  <PieChart className="h-3.5 w-3.5 mr-1 text-primary" />
                  Budget
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOrderStatus("CANCELLED")}
                  className="rounded-md px-3 font-medium text-xs text-muted-foreground hover:text-destructive border-border"
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode("list")}
                  className="rounded-md px-3 font-medium text-xs text-muted-foreground border-border"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back
                </Button>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Header Form Fields matching wireframe */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
                {/* Vendor Bill No. */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">Vendor Bill No.</label>
                  <Input
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="bg-muted/30 border-border/80 text-xs font-mono font-bold h-9 w-48"
                  />
                </div>

                {/* Bill Reference */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">Bill Reference</label>
                  <Input
                    value={billReference}
                    placeholder="ABC-26-001"
                    onChange={(e) => setBillReference(e.target.value)}
                    className="bg-background border-border/80 text-xs font-mono h-9"
                  />
                </div>

                {/* Vendor Name */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Vendor Name <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="h-9 w-full rounded-md border border-border/80 bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  >
                    <option value="" disabled>
                      (From Contact master - many to one)
                    </option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bill Date */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">Bill Date</label>
                  <Input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="bg-background border-border/80 text-xs h-9 w-44"
                  />
                </div>

                {/* Status Badges: Paid / Partial / Not Paid */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    {getPaymentStatusBadge()}
                    <span className="text-[11px] text-muted-foreground italic hidden sm:inline">
                      (only one at a time, computation given below)
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-background border-border/80 text-xs h-9 w-44"
                  />
                </div>
              </div>

              {/* Excel Sheet Line Items Grid */}
              <div className="mt-6">
                <ExcelGrid
                  title="Vendor_Bill_Lines"
                  exportFileName={`Bill_${billNumber.replace(/[/\\?%*:|"<>]/g, "_")}`}
                  columns={excelColumns}
                  data={lines}
                  onChange={setLines}
                  onAddRow={handleAddLine}
                  onRemoveRow={handleRemoveLine}
                  footerContent={
                    <>
                      <td colSpan={4} className="px-4 py-2 text-right text-xs font-bold text-foreground border-r border-border/70">
                        Total:
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs font-bold text-foreground">
                        ₹ {grandTotal.toLocaleString()}
                      </td>
                    </>
                  }
                />
              </div>

              {/* Financial Payment Breakdown below Total on Right */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4 border-t border-border/80">
                {/* Journal Entry Indicator & Navigation */}
                <div className="text-xs space-y-1">
                  {orderStatus === "CONFIRMED" && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300">
                        Ledger Created
                      </Badge>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary underline"
                        onClick={() => navigate("/demo-journal-entry", { state: { billDate, partnerName: contacts.find(c => c.id === vendorId)?.name, amount: grandTotal } })}
                      >
                        View Balanced Journal Entry →
                      </Button>
                    </div>
                  )}
                </div>

                {/* Financial Totals Block */}
                <div className="w-full md:w-80 bg-muted/20 border border-border/80 rounded-lg p-4 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-sans">Bill Total:</span>
                    <span className="font-bold text-foreground">₹ {grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-sans">Paid Via Cash:</span>
                    <span className="text-foreground">₹ {paidViaCash.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-sans">Paid Via Bank:</span>
                    <span className="text-foreground">₹ {paidViaBank.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/80 font-bold text-sm">
                    <span className="font-sans text-primary">Amount Due:</span>
                    <span className={amountDue === 0 ? "text-emerald-600" : "text-rose-600"}>
                      ₹ {amountDue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-right italic font-sans">
                    (Total - Amount Paid)
                  </div>
                </div>
              </div>

              {/* Status Computation Rule Legend Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30 border border-border/70 text-xs">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5 font-bold">Paid</Badge>
                  <span className="text-muted-foreground text-[11px]">If amount due = 0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-white text-[10px] py-0 px-1.5 font-bold">Partial</Badge>
                  <span className="text-muted-foreground text-[11px]">If amount due &lt; Bill Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-rose-600 text-white text-[10px] py-0 px-1.5 font-bold">Not Paid</Badge>
                  <span className="text-muted-foreground text-[11px]">If amount due == Bill Total</span>
                </div>
              </div>

              {/* Non-blocking Warning on Confirmation of Bill */}
              {budgetWarning && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-1 animate-in fade-in-50">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Non blocking Warning on Confirmation of Bill</span>
                  </div>
                  <div className="text-xs font-semibold">⚠️ Exceeds Approved Budget</div>
                  <p className="text-xs leading-relaxed opacity-90">{budgetWarning}</p>
                </div>
              )}

              {/* Red Callout Box from Image: Journal Entry Instructions */}
              <div className="p-4 rounded-lg border-2 border-rose-500/60 bg-rose-500/5 text-xs text-foreground space-y-1.5">
                <div className="font-bold text-rose-600 dark:text-rose-400">
                  Automatic Balanced Journal Entry
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  As soon as the vendor bill is confirmed a journal entry would be created that would become visible in the Journal Entries section. For Vendor bill always purchase chart of account would be set by default. The Journal Entry should always be balanced. That is the debit and credit totals need to match.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border/80 flex items-center justify-between gap-4 bg-muted/20">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bill number or vendor..."
                  className="pl-9 bg-background text-xs h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/80">
                  <tr>
                    <th className="px-4 py-3">Bill Number</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Amount Due</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {bills
                    .filter((b) =>
                      b.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      b.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      b.reference?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((b) => {
                      const due = b.amountDue !== undefined ? b.amountDue : b.totalAmount - ((b.paidCash || 0) + (b.paidBank || 0));
                      return (
                        <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-foreground">
                            {b.orderNumber}
                          </td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">
                            {b.reference || "N/A"}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {b.contact?.name || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(b.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                            ₹ {b.totalAmount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold">
                            <span className={due === 0 ? "text-emerald-600" : "text-rose-600"}>
                              ₹ {due.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {due === 0 ? (
                              <Badge className="bg-emerald-600 text-white font-bold text-[10px]">PAID</Badge>
                            ) : due < b.totalAmount ? (
                              <Badge className="bg-amber-500 text-white font-bold text-[10px]">PARTIAL</Badge>
                            ) : (
                              <Badge className="bg-rose-600 text-white font-bold text-[10px]">NOT PAID</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-primary hover:text-primary/80 font-medium"
                              onClick={() => loadBillIntoForm(b)}
                            >
                              Open
                            </Button>
                          </td>
                        </tr>
                      );
                    })}

                  {bills.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        {loading ? "Loading bills..." : "No vendor bills found. Click New to create one."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <BillPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          order={{
            id: activeBillId,
            orderNumber: billNumber,
            totalAmount: grandTotal,
            amountDue: amountDue,
            contact: contacts.find((c) => c.id === vendorId)
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
