import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  RotateCcw, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DemoJournalEntry() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAccountant = user?.role === "ACCOUNTANT";

  const state = location.state as any;

  const [accountingDate, setAccountingDate] = useState(
    state?.billDate || new Date().toISOString().split("T")[0]
  );
  const [journal, setJournal] = useState("Purchase");
  const [status, setStatus] = useState<"DRAFT" | "POSTED">("POSTED");
  const [amount, setAmount] = useState<number>(state?.amount || 6000);
  const [partner, setPartner] = useState(state?.partnerName || "Rahul");

  const [lines, setLines] = useState<any[]>([
    {
      account: "Purchase a/c",
      partner: partner,
      debit: amount,
      credit: 0
    },
    {
      account: "Creditor a/c",
      partner: "-",
      debit: 0,
      credit: amount
    }
  ]);

  useEffect(() => {
    if (state?.amount) {
      setAmount(state.amount);
      setLines([
        {
          account: "Purchase a/c",
          partner: state.partnerName || "Rahul",
          debit: state.amount,
          credit: 0
        },
        {
          account: "Creditor a/c",
          partner: "-",
          debit: 0,
          credit: state.amount
        }
      ]);
    }
    if (state?.billDate) {
      setAccountingDate(state.billDate);
    }
    if (state?.partnerName) {
      setPartner(state.partnerName);
    }
  }, [state]);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handlePost = () => {
    setStatus("POSTED");
  };

  const handleResetToDraft = () => {
    setStatus("DRAFT");
  };

  const handleExportExcel = () => {
    const csvContent = [
      ["Demo Journal Entry", ""],
      ["Accounting Date", accountingDate],
      ["Journal", journal],
      ["Status", status],
      ["", ""],
      ["Account", "Partner", "Debit", "Credit"],
      ...lines.map((l) => [l.account, l.partner, l.debit || "-", l.credit || "-"]),
      ["Total", "", totalDebit, totalCredit]
    ]
      .map((row) => row.join(","))
      .join("\n");

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Journal_Entry_${accountingDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16 print:p-0">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Demo Journal Entry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Auto-generated double-entry balance from confirmed Vendor Bill
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className="gap-1.5 text-xs border-border"
            title="Export to Excel (.csv)"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPDF}
            className="gap-1.5 text-xs border-border"
            title="Print / Export to PDF"
          >
            <Printer className="h-3.5 w-3.5 text-rose-600" />
            PDF
          </Button>
        </div>
      </div>

      <Card className="border border-border/80 shadow-md bg-card overflow-hidden">
        <CardContent className="p-0">
          {/* Action Bar matching wireframe: Post, Reset to Draft, Back */}
          <div className="p-4 bg-muted/20 border-b border-border/80 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              {!isAccountant && (
                <>
                  <Button
                    size="sm"
                    onClick={handlePost}
                    disabled={status === "POSTED"}
                    className={`rounded-md px-4 font-semibold text-xs transition-all ${
                      status === "POSTED"
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Post
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetToDraft}
                    disabled={status === "DRAFT"}
                    className="rounded-md px-3 font-semibold text-xs border-border text-foreground hover:bg-muted"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset to Draft
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(-1)}
                className="rounded-md px-3 font-medium text-xs text-muted-foreground border-border"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Form Fields matching wireframe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-2xl">
              {/* Accounting Date */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className="text-xs font-semibold text-muted-foreground">
                  Accounting Date
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={accountingDate}
                    onChange={(e) => setAccountingDate(e.target.value)}
                    disabled={status === "POSTED"}
                    className="bg-background border-border/80 text-xs h-9 w-44"
                  />
                  <span className="text-[11px] text-muted-foreground italic hidden sm:inline">
                    (Bill date fetch from bill)
                  </span>
                </div>
              </div>

              {/* Journal */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className="text-xs font-semibold text-muted-foreground">
                  Journal
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={journal}
                    disabled
                    className="bg-muted/30 border-border/80 text-xs font-semibold h-9 w-40"
                  />
                  <span className="text-[11px] text-muted-foreground italic hidden sm:inline">
                    (In case of bill journal would always be Purchase)
                  </span>
                </div>
              </div>
            </div>

            {/* Excel-style Journal Table */}
            <div className="border border-border/80 rounded-lg overflow-hidden mt-4">
              <table className="w-full border-collapse text-xs font-mono text-left">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border/80 font-sans">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold border-r border-border/70">
                      Account
                    </th>
                    <th className="px-4 py-2.5 font-semibold border-r border-border/70">
                      Partner
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold border-r border-border/70">
                      Debit
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold">
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-muted/15 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-foreground border-r border-border/70">
                        {line.account}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground border-r border-border/70">
                        {line.partner}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-destructive font-semibold border-r border-border/70">
                        {line.debit ? `Rs. ${Number(line.debit).toLocaleString()}` : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-primary font-semibold">
                        {line.credit ? `Rs. ${Number(line.credit).toLocaleString()}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/40 font-semibold border-t-2 border-border text-foreground">
                    <td colSpan={2} className="px-4 py-2.5 text-right font-sans font-bold border-r border-border/70">
                      Total:
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-destructive border-r border-border/70">
                      Rs. {totalDebit.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-primary">
                      Rs. {totalCredit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Balancing Confirmation Banner */}
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>The Journal Entry is perfectly balanced (Total Debits = Total Credits).</span>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold">
                Balanced
              </Badge>
            </div>

            {/* Whiteboard tag note */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground italic">
              <span>Chery Wombat</span>
              <span>Modura Double-Entry Ledger Engine</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
