import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Check,
  FileText,
  X,
  ArrowLeft,
  AlertTriangle,
  Search,
  ShoppingCart,
  Receipt,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExcelGrid, ExcelColumn } from "@/components/ExcelGrid";
import { apiFetch } from "@/lib/api";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { PaginationControls } from "@/components/PaginationControls";

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "form">("form");

  // Paginated orders from server
  const {
    data: orders,
    total: ordersTotal,
    page: ordersPage,
    totalPages: ordersTotalPages,
    setPage: setOrdersPage,
    refresh: refreshOrders,
  } = usePaginatedFetch<any>("/orders?type=PURCHASE_ORDER", 20);

  const [contacts, setContacts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [activePOId, setActivePOId] = useState<string | null>(null);
  const [poNumber, setPoNumber] = useState("PO0001");
  const [vendorId, setVendorId] = useState("");
  const [poDate, setPoDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<"DRAFT" | "CONFIRMED" | "CANCELLED">("DRAFT");
  const [lines, setLines] = useState<any[]>([
    { productId: "", analyticAccountId: "", qty: 3, unitPrice: 2000, total: 6000 }
  ]);

  // Non-blocking budget warning
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch initial master data & sequences
  const fetchData = async () => {
    try {
      setLoading(true);
      // Unwrap paginated envelope for dropdown data
      const [contactRes, productRes, analyticRes, seqRes] = await Promise.all([
        apiFetch("/master/contacts?limit=200"),
        apiFetch("/master/products?limit=200"),
        apiFetch("/master/analytic-accounts?limit=100"),
        apiFetch("/orders/next-sequence?type=PURCHASE_ORDER")
      ]);

      const contactList = contactRes?.data ?? contactRes ?? [];
      const productList = productRes?.data ?? productRes ?? [];
      const analyticList = analyticRes?.data ?? analyticRes ?? [];

      setContacts(Array.isArray(contactList) ? contactList.filter((c: any) => c.type === "VENDOR") : []);
      setProducts(Array.isArray(productList) ? productList : []);
      setAnalytics(Array.isArray(analyticList) ? analyticList : []);

      if (seqRes?.sequence) {
        setPoNumber(seqRes.sequence);
      }

      const tableProd = productList?.find((p: any) => p.name?.toLowerCase().includes("table"));
      const proj1 = analyticList?.find((a: any) => a.name?.toLowerCase().includes("project 1"));

      setLines([
        {
          productId: tableProd ? tableProd.id : (productList[0]?.id || ""),
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

  const calculateGrandTotal = () => {
    return lines.reduce((sum, line) => sum + (Number(line.total) || 0), 0);
  };

  const handleNewPO = async () => {
    try {
      const seqRes = await apiFetch("/orders/next-sequence?type=PURCHASE_ORDER");
      setPoNumber(seqRes?.sequence || "PO0001");
      setActivePOId(null);
      setStatus("DRAFT");
      setBudgetWarning(null);
      setErrorMessage("");
      setPoDate(new Date().toISOString().split("T")[0]);

      const tableProd = products.find((p) => p.name?.toLowerCase().includes("table"));
      const proj1 = analytics.find((a) => a.name?.toLowerCase().includes("project 1"));

      setLines([
        {
          productId: tableProd ? tableProd.id : (products[0]?.id || ""),
          analyticAccountId: proj1 ? proj1.id : (analytics[0]?.id || ""),
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

  const handleConfirmPO = async () => {
    if (!vendorId) {
      setErrorMessage("Please select a Vendor Name from Contact Master");
      return;
    }
    if (lines.length === 0) {
      setErrorMessage("Please add at least one product line item");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      let poId = activePOId;
      if (!poId) {
        // Create draft first
        const payload = {
          type: "PURCHASE_ORDER",
          orderNumber: poNumber,
          date: poDate,
          contactId: vendorId,
          lines: lines.map((l) => ({
            productId: l.productId,
            analyticAccountId: l.analyticAccountId || null,
            quantity: Number(l.qty) || 1,
            unitPrice: Number(l.unitPrice) || 0
          }))
        };

        const created = await apiFetch("/orders", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        poId = created.id;
        setActivePOId(created.id);
      }

      // Confirm order on backend
      const confirmedRes = await apiFetch(`/orders/${poId}/confirm`, {
        method: "POST"
      });

      setStatus("CONFIRMED");

      // Check for non-blocking budget warning from backend or check client-side
      const selectedAnalytic = analytics.find((a) => a.id === lines[0]?.analyticAccountId);
      const grandTotal = calculateGrandTotal();

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
      setErrorMessage(err.message || "Failed to confirm purchase order");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async () => {
    try {
      setLoading(true);
      let poId = activePOId;

      if (!poId) {
        // Save first
        const payload = {
          type: "PURCHASE_ORDER",
          orderNumber: poNumber,
          date: poDate,
          contactId: vendorId,
          lines: lines.map((l) => ({
            productId: l.productId,
            analyticAccountId: l.analyticAccountId || null,
            quantity: Number(l.qty) || 1,
            unitPrice: Number(l.unitPrice) || 0
          }))
        };
        const created = await apiFetch("/orders", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        poId = created.id;
      }

      // Convert PO -> Vendor Bill via backend endpoint
      const billRes = await apiFetch(`/orders/${poId}/create-bill`, {
        method: "POST"
      });

      // Navigate to Vendor Bills with the newly created bill selected
      navigate("/vendor-bills", { state: { billId: billRes.id, fromPO: true, poId } });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create bill from purchase order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStatus("CANCELLED");
    setBudgetWarning(null);
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        productId: products[0]?.id || "",
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

  // Excel Grid Column Definitions
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
      placeholder: "(From Product Master - Many to one)",
      width: "35%"
    },
    {
      key: "analyticAccountId",
      header: "Budget Analytics",
      colLetter: "B",
      type: "select",
      options: analytics.map((a) => ({
        value: a.id,
        label: a.name
      })),
      placeholder: "(From Analytics Master - Many to One)",
      width: "25%"
    },
    {
      key: "qty",
      header: "Qty",
      colLetter: "C",
      type: "number",
      align: "right",
      placeholder: "Numeric",
      width: "12%"
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      colLetter: "D",
      type: "currency",
      align: "right",
      placeholder: "Monetary",
      width: "14%"
    },
    {
      key: "total",
      header: "Total",
      colLetter: "E",
      type: "readonly",
      align: "right",
      width: "14%"
    }
  ];

  const grandTotal = calculateGrandTotal();

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 print:p-0">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Purchase Order
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create Sequence auto generate PO number +1 of Last order
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "list" ? (
            <Button
              size="sm"
              onClick={handleNewPO}
              className="gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode("list")}
              className="gap-1.5 border-border"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              View All POs
            </Button>
          )}
        </div>
      </div>

      {viewMode === "form" ? (
        <Card className="border border-border/80 shadow-md bg-card overflow-hidden">
          <CardContent className="p-0">
            {/* Action Bar matching wireframe: New, Confirm, Create Bill, Cancel, Back */}
            <div className="p-4 bg-muted/20 border-b border-border/80 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNewPO}
                  className="rounded-md px-4 font-semibold text-xs border-border"
                >
                  New
                </Button>

                <Button
                  size="sm"
                  onClick={handleConfirmPO}
                  disabled={loading || status === "CONFIRMED"}
                  className={`rounded-md px-4 font-semibold text-xs transition-all ${status === "CONFIRMED"
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                >
                  {status === "CONFIRMED" ? "Confirmed" : "Confirm"}
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCreateBill}
                  disabled={loading}
                  className="rounded-md px-4 font-semibold text-xs bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20"
                  title="Bill Created from PO fetch Vendor name, Product, Price, Quantity"
                >
                  <Receipt className="h-3.5 w-3.5 mr-1" />
                  Create Bill
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
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
                {/* PO No. */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">PO No.</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="bg-muted/30 border-border/80 text-xs font-mono font-bold h-9 w-40"
                    />
                    <span className="text-[11px] text-muted-foreground italic hidden sm:inline">
                      (Auto generate PO number +1 of Last order)
                    </span>
                  </div>
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
                      (From Contact Master - Many to one)
                    </option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PO Date */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">PO Date</label>
                  <Input
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="bg-background border-border/80 text-xs h-9 w-44"
                  />
                </div>

                {/* Status Badge */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 ${status === "CONFIRMED"
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-300"
                          : status === "CANCELLED"
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : "bg-blue-500/15 text-blue-600 border-blue-300"
                        }`}
                    >
                      {status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Excel Sheet Line Items Grid */}
              <div className="mt-6">
                <ExcelGrid
                  title="Purchase_Order_Lines"
                  exportFileName={`PO_${poNumber}`}
                  columns={excelColumns}
                  data={lines}
                  onChange={setLines}
                  onAddRow={handleAddLine}
                  onRemoveRow={handleRemoveLine}
                  footerContent={
                    <>
                      <td colSpan={3} className="px-4 py-2 text-right text-xs font-bold text-foreground border-r border-border/70">
                        Total:
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs font-bold text-foreground">
                        ₹ {grandTotal.toLocaleString()}
                      </td>
                    </>
                  }
                />
              </div>

              {/* Non-blocking Warning on Confirmation of PO */}
              {budgetWarning && (
                <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-1 animate-in fade-in-50">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Non blocking Warning on Confirmation of PO</span>
                  </div>
                  <div className="text-xs font-semibold">⚠️ Exceeds Approved Budget</div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {budgetWarning}
                  </p>
                </div>
              )}
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
                  placeholder="Search PO number or vendor..."
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
                    <th className="px-4 py-3">PO Number</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {orders
                    .filter((o) =>
                      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                          {o.orderNumber}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {o.contact?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(o.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                          ₹ {o.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-semibold ${o.status === "CONFIRMED"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-300"
                                : "bg-blue-500/15 text-blue-600 border-blue-300"
                              }`}
                          >
                            {o.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-primary hover:text-primary/80 font-medium"
                            onClick={() => {
                              setActivePOId(o.id);
                              setPoNumber(o.orderNumber);
                              setVendorId(o.contactId);
                              setPoDate(new Date(o.date).toISOString().split("T")[0]);
                              setStatus(o.status);
                              if (o.lines && o.lines.length > 0) {
                                setLines(
                                  o.lines.map((l: any) => ({
                                    productId: l.productId,
                                    analyticAccountId: l.analyticAccountId,
                                    qty: l.quantity,
                                    unitPrice: l.unitPrice,
                                    total: l.subtotal
                                  }))
                                );
                              }
                              setViewMode("form");
                            }}
                          >
                            Open
                          </Button>
                        </td>
                      </tr>
                    ))}

                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        {loading ? "Loading orders..." : "No purchase orders found. Click New to create one."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-border/80">
              <PaginationControls
                page={ordersPage}
                totalPages={ordersTotalPages}
                total={ordersTotal}
                limit={20}
                onPageChange={setOrdersPage}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
