import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Receipt, CheckCircle2, Clock, CreditCard, AlertCircle } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

interface OrderLine {
  id: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
}

interface Invoice {
  id: string;
  orderNumber: string;
  reference?: string;
  date: string;
  dueDate?: string;
  type: string;
  status: string;
  totalAmount: number;
  amountDue: number;
  paidCash: number;
  paidBank: number;
  contact: Contact;
  lines: OrderLine[];
  payments: Payment[];
}

type PayMethod = "CASH" | "BANK";

export default function MyInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>("CASH");
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // USER role: listOrders returns only CUSTOMER_INVOICE
      const data: any = await apiFetch("/orders?limit=100");
      setInvoices(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handlePay = async () => {
    if (!payModalInvoice) return;
    try {
      setPayingId(payModalInvoice.id);
      await apiFetch(`/orders/${payModalInvoice.id}/pay`, {
        method: "POST",
        body: JSON.stringify({
          amount: payModalInvoice.amountDue,
          method: payMethod,
        }),
      });
      setPayModalInvoice(null);
      await fetchInvoices();
    } catch (err: any) {
      alert(err.message || "Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    DRAFT:     { label: "Draft",     variant: "outline",     icon: <Clock className="h-3 w-3" /> },
    CONFIRMED: { label: "Confirmed", variant: "secondary",   icon: <CheckCircle2 className="h-3 w-3" /> },
    CANCELLED: { label: "Cancelled", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  };

  const paid    = invoices.filter(inv => inv.amountDue <= 0);
  const unpaid  = invoices.filter(inv => inv.amountDue > 0 && inv.status !== "CANCELLED");
  const cancelled = invoices.filter(inv => inv.status === "CANCELLED");

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchInvoices}>Retry</Button>
      </div>
    );
  }

  const renderInvoice = (inv: Invoice) => {
    const sc  = statusConfig[inv.status] || statusConfig["DRAFT"];
    const due = inv.amountDue > 0 && inv.status !== "CANCELLED";

    return (
      <div
        key={inv.id}
        className={`rounded-xl border p-5 space-y-4 bg-card/70 backdrop-blur-sm transition-all hover:shadow-md ${
          due ? "border-amber-500/30 hover:border-amber-500/60" : "border-border/60 hover:border-border"
        }`}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-sm text-foreground">{inv.orderNumber}</span>
              {inv.reference && (
                <span className="text-xs text-muted-foreground">· {inv.reference}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              From: <span className="font-medium text-foreground">{inv.contact?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={sc.variant} className="flex items-center gap-1 text-xs py-0.5">
              {sc.icon}
              {sc.label}
            </Badge>
            {due && (
              <Badge variant="outline" className="text-xs py-0.5 text-amber-600 border-amber-500/50 bg-amber-500/10">
                Unpaid
              </Badge>
            )}
            {!due && inv.status !== "CANCELLED" && (
              <Badge variant="outline" className="text-xs py-0.5 text-emerald-600 border-emerald-500/50 bg-emerald-500/10">
                Paid
              </Badge>
            )}
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-background/60 p-3 border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-sm font-bold text-foreground">{fmt(inv.totalAmount)}</p>
          </div>
          <div className="rounded-lg bg-background/60 p-3 border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">Paid</p>
            <p className="text-sm font-bold text-emerald-600">{fmt(inv.paidCash + inv.paidBank)}</p>
          </div>
          <div className={`rounded-lg p-3 border ${due ? "bg-amber-500/5 border-amber-500/30" : "bg-background/60 border-border/40"}`}>
            <p className="text-xs text-muted-foreground mb-1">Due</p>
            <p className={`text-sm font-bold ${due ? "text-amber-600" : "text-muted-foreground"}`}>
              {fmt(inv.amountDue)}
            </p>
          </div>
        </div>

        {/* Dates + Pay Button */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="space-x-3">
            <span>Issued: {new Date(inv.date).toLocaleDateString()}</span>
            {inv.dueDate && (
              <span className={due ? "text-amber-600 font-medium" : ""}>
                Due: {new Date(inv.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          {due && (
            <Button
              size="sm"
              className="h-7 px-3 text-xs gap-1.5"
              onClick={() => setPayModalInvoice(inv)}
            >
              <CreditCard className="h-3 w-3" />
              Pay Now
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">My Invoices</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, <strong>{user?.name}</strong>. View and pay your outstanding invoices below.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Unpaid",    count: unpaid.length,    total: unpaid.reduce((s, i) => s + i.amountDue, 0), color: "amber"  },
          { label: "Paid",      count: paid.length,      total: paid.reduce((s, i) => s + i.totalAmount, 0), color: "emerald" },
          { label: "Cancelled", count: cancelled.length, total: 0, color: "slate" },
        ].map(({ label, count, total, color }) => (
          <div
            key={label}
            className={`rounded-xl border p-4 bg-card/70 border-border/60`}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{count}</p>
            {total > 0 && (
              <p className={`text-xs mt-1 font-medium text-${color}-600`}>{fmt(total)}</p>
            )}
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="flex h-48 w-full flex-col items-center justify-center gap-3 text-muted-foreground rounded-xl border border-dashed border-border/60">
          <Receipt className="h-8 w-8" />
          <p className="text-sm">No invoices found for your account.</p>
        </div>
      ) : (
        <>
          {/* Unpaid Section */}
          {unpaid.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Outstanding ({unpaid.length})
              </h3>
              {unpaid.map(renderInvoice)}
            </div>
          )}

          {/* Paid Section */}
          {paid.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Paid ({paid.length})
              </h3>
              {paid.map(renderInvoice)}
            </div>
          )}

          {/* Cancelled Section */}
          {cancelled.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Cancelled ({cancelled.length})
              </h3>
              {cancelled.map(renderInvoice)}
            </div>
          )}
        </>
      )}

      {/* Pay Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Pay Invoice</h3>
              <p className="text-sm text-muted-foreground">
                {payModalInvoice.orderNumber} · Due: <strong className="text-amber-600">{fmt(payModalInvoice.amountDue)}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["CASH", "BANK"] as PayMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`py-3 rounded-lg border text-sm font-medium transition-all ${
                      payMethod === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                    }`}
                  >
                    {m === "CASH" ? "💵 Cash" : "🏦 Bank Transfer"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPayModalInvoice(null)}
                disabled={!!payingId}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePay}
                disabled={!!payingId}
              >
                {payingId ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
