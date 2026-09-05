import { useState } from "react";
import { 
  X, 
  Settings, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Send,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

interface BillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onPaymentSuccess: (updatedOrder: any) => void;
}

export function BillPaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess
}: BillPaymentModalProps) {
  if (!isOpen || !order) return null;

  const defaultAmount = order.amountDue !== undefined ? order.amountDue : order.totalAmount;

  const [paymentType, setPaymentType] = useState<"SEND" | "RECEIVE">("SEND");
  const [partner, setPartner] = useState(order.contact?.name || "Mr. Rahul");
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentVia, setPaymentVia] = useState<"CASH" | "BANK">("CASH");
  const [status, setStatus] = useState<"Draft" | "Posted" | "Cancelled">("Draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const handleConfirmPayment = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(`/orders/${order.id}/pay`, {
        method: "POST",
        body: JSON.stringify({
          amount,
          method: paymentVia,
          date,
          paymentType
        })
      });

      setStatus("Posted");
      if (response && response.order) {
        onPaymentSuccess(response.order);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
    setShowOptions(false);
  };

  const handleExportExcel = () => {
    const csvData = [
      ["Payment Voucher", ""],
      ["Status", status],
      ["Payment Type", paymentType === "SEND" ? "Send" : "Receiving"],
      ["Partner", partner],
      ["Bill Reference", order.orderNumber],
      ["Date", date],
      ["Payment Method", paymentVia],
      ["Amount", amount]
    ].map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payment_${order.orderNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowOptions(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-card border border-border/90 rounded-xl shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95">
        {/* Top Actions & Workflow Header */}
        <div className="bg-muted/40 px-6 py-4 border-b border-border/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground tracking-tight flex items-center gap-2">
              <span className="p-1 rounded bg-primary/10 text-primary">
                <Send className="h-4 w-4" />
              </span>
              Bill Payment
            </h3>

            {/* Options Gear Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted ${
                  status === "Posted" ? "ring-1 ring-primary/40 text-primary" : ""
                }`}
                onClick={() => setShowOptions(!showOptions)}
                title="Options (Print / PDF / Excel)"
              >
                <Settings className="h-4 w-4" />
              </Button>

              {showOptions && (
                <div className="absolute left-0 mt-1 w-44 rounded-md shadow-lg bg-popover border border-border py-1 z-50 animate-in fade-in-50">
                  <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                    Payment Options
                  </div>
                  <button
                    onClick={handlePrintPDF}
                    className="w-full px-3 py-2 text-xs text-left text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Printer className="h-3.5 w-3.5 text-rose-500" />
                    1. Print / PDF
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-3 py-2 text-xs text-left text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                    2. Excel Export
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Status Breadcrumb: Draft -> Posted -> Cancelled */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                status === "Draft"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30"
                  : "text-muted-foreground"
              }`}
            >
              Draft
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground/60" />
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                status === "Posted"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-muted-foreground"
              }`}
            >
              Posted
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground/60" />
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                status === "Cancelled"
                  ? "bg-destructive/15 text-destructive font-bold border border-destructive/30"
                  : "text-muted-foreground"
              }`}
            >
              Cancelled
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-2 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {status === "Posted" && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Payment confirmed and posted! Use the gear icon above to Print / PDF or Export to Excel.</span>
            </div>
          )}

          {/* Form Fields matching the diagram */}
          <div className="space-y-4">
            {/* Payment Type */}
            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
              <label className="text-xs font-medium text-muted-foreground">Payment Type</label>
              <div className="flex items-center gap-6 text-xs text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="SEND"
                    checked={paymentType === "SEND"}
                    onChange={() => setPaymentType("SEND")}
                    disabled={status === "Posted"}
                    className="accent-primary"
                  />
                  <span>Send</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                  <input
                    type="radio"
                    name="paymentType"
                    value="RECEIVE"
                    checked={paymentType === "RECEIVE"}
                    onChange={() => setPaymentType("RECEIVE")}
                    disabled={status === "Posted"}
                    className="accent-primary"
                  />
                  <span>Receiving</span>
                </label>
              </div>
            </div>

            {/* Partner */}
            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
              <label className="text-xs font-medium text-muted-foreground">Partner</label>
              <Input
                value={partner}
                disabled
                className="bg-muted/30 border-border/70 text-xs font-medium h-9 text-foreground"
              />
            </div>

            {/* Amount */}
            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
              <label className="text-xs font-medium text-muted-foreground">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-muted-foreground">₹</span>
                <Input
                  type="number"
                  min="1"
                  max={order.amountDue || order.totalAmount}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  disabled={status === "Posted"}
                  className="pl-7 bg-background border-border/80 text-xs font-mono font-semibold h-9"
                />
              </div>
            </div>

            {/* Date */}
            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={status === "Posted"}
                className="bg-background border-border/80 text-xs h-9"
              />
            </div>

            {/* Payment Via */}
            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
              <label className="text-xs font-medium text-muted-foreground">Payment Via</label>
              <select
                value={paymentVia}
                onChange={(e) => setPaymentVia(e.target.value as "CASH" | "BANK")}
                disabled={status === "Posted"}
                className="h-9 w-full rounded-md border border-border/80 bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-muted/30 px-6 py-4 border-t border-border/80 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground italic">
            Shaik Akthar
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 px-3 border-border"
            >
              {status === "Posted" ? "Close" : "Cancel"}
            </Button>
            {status !== "Posted" && (
              <Button
                size="sm"
                onClick={handleConfirmPayment}
                disabled={loading}
                className="text-xs h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
