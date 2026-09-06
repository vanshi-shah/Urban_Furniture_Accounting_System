import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Receipt,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";

export default function Sales() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab routing
  const getTabFromPath = () => {
    if (location.pathname.includes("sales-invoices")) return "invoices";
    if (location.pathname.includes("receipts")) return "receipts";
    return "orders";
  };

  const [activeTab, setActiveTab] = useState<string>(getTabFromPath());
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(searchParams.get("action") === "new");

  // Master data
  const [contacts, setContacts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // New Order Form state
  const [customerName, setCustomerName] = useState("");
  const [orderLines, setOrderLines] = useState([
    { productId: "", qty: 1, unitPrice: 0, total: 0 },
  ]);

  const handleAddLine = () => {
    setOrderLines([...orderLines, { productId: "", qty: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setOrderLines(orderLines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, value: any) => {
    const newLines = [...orderLines];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      const price = product ? (product.salesPrice ?? product.salePrice ?? product.price ?? 0) : 0;
      newLines[idx].productId = value;
      newLines[idx].unitPrice = price;
    } else if (field === 'qty') {
      newLines[idx].qty = Number(value);
    }
    
    newLines[idx].total = newLines[idx].qty * newLines[idx].unitPrice;
    setOrderLines(newLines);
  };

  const grandTotal = orderLines.reduce((acc, line) => acc + line.total, 0);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setNewOrderModalOpen(true);
    }
    if (searchParams.get("status")) {
      setStatusFilter(searchParams.get("status") || "ALL");
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val === "invoices") navigate("/sales-invoices");
    else if (val === "receipts") navigate("/receipts");
    else navigate("/sales-orders");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, contactRes, productRes] = await Promise.allSettled([
        apiFetch("/orders?type=CUSTOMER_INVOICE&limit=100"),
        apiFetch("/master/contacts?limit=200"),
        apiFetch("/master/products?limit=200"),
      ]);

      if (contactRes.status === "fulfilled" && contactRes.value) {
        const contactList = contactRes.value?.data ?? (Array.isArray(contactRes.value) ? contactRes.value : []);
        // Prefer CUSTOMER type, but fallback to full list if none explicitly typed
        const customers = contactList.filter((c: any) => c.type === "CUSTOMER");
        setContacts(customers.length > 0 ? customers : contactList);
      }
      if (productRes.status === "fulfilled" && productRes.value) {
        const productList = productRes.value?.data ?? (Array.isArray(productRes.value) ? productRes.value : []);
        setProducts(productList);
      }
      if (orderRes.status === "fulfilled" && orderRes.value) {
        const orderList = orderRes.value?.data ?? (Array.isArray(orderRes.value) ? orderRes.value : []);
        setOrders(orderList);
      }
    } catch (err) {
      console.error("Failed to fetch sales master data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Realistic Modura Atelier Sales Data
  const sampleSalesOrders = [
    {
      id: "SO-2026-012",
      orderNumber: "SO0012",
      customer: "Aura Architecture Studio",
      date: "2026-09-04",
      items: "Bespoke Teak Executive Desk (x2)",
      total: 240000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-011",
      orderNumber: "SO0011",
      customer: "Oberoi Luxury Residences",
      date: "2026-09-03",
      items: "Solid Oak Dining Suite & 8 Chairs",
      total: 320000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-010",
      orderNumber: "SO0010",
      customer: "Vayu Penthouse Project",
      date: "2026-09-02",
      items: "Living Credenza with Brass Inlay",
      total: 185000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-009",
      orderNumber: "SO0009",
      customer: "Koregaon Villa 9",
      date: "2026-09-01",
      items: "Walnut Fluted Conference Table",
      total: 410000,
      status: "CONFIRMED",
      paymentStatus: "PARTIAL",
      risk: "MEDIUM",
    },
    {
      id: "SO-2026-008",
      orderNumber: "SO0008",
      customer: "Symphony Corporate Tower",
      date: "2026-08-28",
      items: "Ergonomic Atelier Armchairs (x12)",
      total: 280000,
      status: "CONFIRMED",
      paymentStatus: "UNPAID",
      risk: "MEDIUM",
    },
    {
      id: "SO-2026-007",
      orderNumber: "SO0007",
      customer: "Studio Lotus Interior Design",
      date: "2026-08-25",
      items: "Custom Modular Credenza System",
      total: 195000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-006",
      orderNumber: "SO0006",
      customer: "The Leela Hospitality Suites",
      date: "2026-08-20",
      items: "Minimalist Teak Coffee Tables (x8)",
      total: 140000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-005",
      orderNumber: "SO0005",
      customer: "Alila Boutique Retreat",
      date: "2026-08-15",
      items: "Outdoor Teak Lounge Sets (x4)",
      total: 360000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-004",
      orderNumber: "SO0004",
      customer: "Malabar Hill Private Residence",
      date: "2026-08-10",
      items: "Architectural Screen Millwork",
      total: 225000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-003",
      orderNumber: "SO0003",
      customer: "Zenith Design Collective",
      date: "2026-08-05",
      items: "Carved Teak Storage Unit",
      total: 175000,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-002",
      orderNumber: "SO0002",
      customer: "Urban Edge Workspace",
      date: "2026-09-05",
      items: "Standing Desks with Oak Tops (x4)",
      total: 160000,
      status: "DRAFT",
      paymentStatus: "UNPAID",
      risk: "LOW",
    },
    {
      id: "SO-2026-001",
      orderNumber: "SO0001",
      customer: "Serene Spaces Architects",
      date: "2026-09-05",
      items: "Sculptural Walnut Reception Desk",
      total: 290000,
      status: "DRAFT",
      paymentStatus: "UNPAID",
      risk: "LOW",
    },
  ];

  const sampleReceipts = [
    {
      id: "REC-2026-041",
      customer: "Aura Architecture Studio",
      method: "Bank Transfer (HDFC)",
      date: "Today, 2:15 PM",
      invoiceRef: "INV-2026-089",
      amount: 240000,
      status: "SETTLED",
      dr: "1010 Bank Account",
      cr: "1200 Accounts Receivable",
    },
    {
      id: "REC-2026-040",
      customer: "Oberoi Luxury Residences",
      method: "NEFT Settlement",
      date: "2 days ago",
      invoiceRef: "INV-2026-088",
      amount: 320000,
      status: "SETTLED",
      dr: "1010 Bank Account",
      cr: "1200 Accounts Receivable",
    },
    {
      id: "REC-2026-039",
      customer: "Vayu Penthouse Project",
      method: "Vault Petty Cash",
      date: "3 days ago",
      invoiceRef: "INV-2026-085",
      amount: 185000,
      status: "SETTLED",
      dr: "1000 Petty Cash",
      cr: "1200 Accounts Receivable",
    },
  ];

  const displayOrders = useMemo(() => {
    if (orders && orders.length > 0) {
      return orders.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber || `SO-${o.id.slice(-4)}`,
        customer: o.contact?.name || "Bespoke Client",
        date: o.date ? new Date(o.date).toISOString().split("T")[0] : "2026-09-04",
        items: o.lines && o.lines.length > 0
          ? o.lines.map((l: any) => `${l.product?.name || l.description || "Custom Item"} (x${l.quantity})`).join(", ")
          : "Bespoke Furniture Contract",
        total: o.totalAmount || 0,
        status: o.status || "CONFIRMED",
        paymentStatus: (o.amountDue === 0 || (o.payments && o.payments.length > 0 && o.amountDue <= 0))
          ? "PAID"
          : (o.amountDue < o.totalAmount ? "PARTIAL" : "UNPAID"),
        risk: o.status === "CONFIRMED" ? "LOW" : "MEDIUM",
      }));
    }
    return sampleSalesOrders;
  }, [orders]);

  const displayReceipts = useMemo(() => {
    if (orders && orders.length > 0) {
      const allPayments: any[] = [];
      orders.forEach((o: any) => {
        if (o.payments && Array.isArray(o.payments)) {
          o.payments.forEach((p: any) => {
            allPayments.push({
              id: p.paymentNumber || `REC-${p.id.slice(-4)}`,
              customer: o.contact?.name || "Bespoke Client",
              method: p.method === "BANK" ? "Bank Settlement" : "Cash Settlement",
              date: p.date ? new Date(p.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "Recent",
              invoiceRef: o.orderNumber,
              amount: p.amount,
              status: p.status || "SETTLED",
              dr: p.method === "BANK" ? "1010 Bank Account" : "1000 Petty Cash",
              cr: "1200 Accounts Receivable",
            });
          });
        }
      });
      if (allPayments.length > 0) return allPayments;
    }
    return sampleReceipts;
  }, [orders]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredOrders = displayOrders.filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : order.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateOrder = async () => {
    if (!customerName) {
      setSubmitError("Please select a customer from the dropdown.");
      return;
    }
    const validLines = orderLines.filter(l => l.productId && l.qty > 0);
    if (validLines.length === 0) {
      setSubmitError("Please select at least one product with quantity greater than zero.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          type: "CUSTOMER_INVOICE",
          contactId: customerName,
          date: new Date().toISOString(),
          lines: validLines.map(line => {
            const prod = products.find(p => p.id === line.productId);
            return {
              productId: line.productId,
              quantity: line.qty,
              unitPrice: line.unitPrice,
              description: prod?.name || "Bespoke Furniture Line",
            };
          }),
        }),
      });

      setNewOrderModalOpen(false);
      setCustomerName("");
      setOrderLines([{ productId: "", qty: 1, unitPrice: 0, total: 0 }]);
      await fetchData();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create sales order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sales Management &amp; Customer Orders
            </h1>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 gap-1">
              <TrendingUp className="h-3 w-3" /> Live Customer Lifecycle
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bespoke client furniture contracts, automated invoices, payment receipts, and debtor ledger updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSubmitError("");
              setNewOrderModalOpen(true);
            }}
            className="gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full px-5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            New Sales Order
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-muted/50 border border-border/60 p-1 rounded-xl">
            <TabsTrigger value="orders" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
              Sales Orders ({displayOrders.length})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <Receipt className="h-4 w-4 mr-2 text-accent" />
              Sale Invoices ({displayOrders.filter(o => o.status === "CONFIRMED").length})
            </TabsTrigger>
            <TabsTrigger value="receipts" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <CreditCard className="h-4 w-4 mr-2 text-emerald-600" />
              Customer Receipts ({displayReceipts.length})
            </TabsTrigger>
          </TabsList>

          {/* Quick Filter Pill Controls */}
          {activeTab === "orders" && (
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${statusFilter === "ALL" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                All ({displayOrders.length})
              </button>
              <button
                onClick={() => setStatusFilter("CONFIRMED")}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${statusFilter === "CONFIRMED" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Confirmed ({displayOrders.filter(o => o.status === "CONFIRMED").length})
              </button>
              <button
                onClick={() => setStatusFilter("DRAFT")}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${statusFilter === "DRAFT" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Draft ({displayOrders.filter(o => o.status === "DRAFT").length})
              </button>
            </div>
          )}
        </div>

        {/* 1. SALES ORDERS TAB */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-4 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customer, order #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                Showing {filteredOrders.length} Orders
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-muted/10 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">
                          {order.orderNumber}
                        </span>
                        <Badge
                          variant={order.status === "CONFIRMED" ? "default" : "outline"}
                          className={`text-[10px] ${order.status === "CONFIRMED"
                              ? "bg-emerald-600 text-white"
                              : "text-muted-foreground"
                            }`}
                        >
                          {order.status}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          Risk: {order.risk}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-foreground">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.items}</p>
                    </div>

                    <div className="flex items-center justify-between md:flex-col md:items-end gap-1">
                      <span className="font-mono font-bold text-base text-foreground">
                        {formatINR(order.total)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Date: {order.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. SALE INVOICES TAB */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-4 border-b border-border/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Customer Invoices &amp; Receivables</CardTitle>
                <CardDescription className="text-xs">Generated invoices synced with Account 1200 (Accounts Receivable)</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">{displayOrders.filter(o => o.status === "CONFIRMED").length} Active Invoices</Badge>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {displayOrders.filter(o => o.status === "CONFIRMED").map((inv) => (
                <div key={inv.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">INV-2026-{inv.orderNumber.replace(/[^0-9]/g, "") || inv.id.slice(-4)}</span>
                      <Badge
                        variant={inv.paymentStatus === "PAID" ? "default" : "destructive"}
                        className="text-[10px]"
                      >
                        {inv.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{inv.customer}</p>
                    <p className="text-xs text-muted-foreground">{inv.items}</p>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-1">
                    <span className="font-mono font-bold text-base text-foreground">{formatINR(inv.total)}</span>
                    <span className="text-[11px] text-muted-foreground">Term: Net 30 Days</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. RECEIPTS TAB */}
        <TabsContent value="receipts" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-4 border-b border-border/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Customer Payment Settlements</CardTitle>
                <CardDescription className="text-xs">Bank and Cash deposits reducing Accounts Receivable</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">{displayReceipts.length} Verified Receipts</Badge>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {displayReceipts.map((rec) => (
                <div key={rec.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{rec.id}</span>
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {rec.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">• Ref: {rec.invoiceRef}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{rec.customer}</p>
                    <div className="flex items-center gap-2 font-mono text-[11px] mt-1 text-muted-foreground">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">DR: {rec.dr}</span>
                      <span>⇄</span>
                      <span className="px-1.5 py-0.5 rounded bg-accent/15 text-accent-foreground border border-accent/30">CR: {rec.cr}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-1">
                    <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                      +{formatINR(rec.amount)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{rec.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Sales Order Modal */}
      <Dialog open={newOrderModalOpen} onOpenChange={setNewOrderModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card text-card-foreground border-border/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Create Bespoke Sales Order
            </DialogTitle>
            <DialogDescription className="text-xs">
              Generate a client quotation and sales contract.
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Customer (Client / Architecture Studio)</label>
              <select 
                className="w-full h-9 px-3 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              >
                <option value="">Select Customer...</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-foreground">Order Line Items</div>
                <Button variant="outline" size="sm" onClick={handleAddLine} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Line
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {orderLines.map((line, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border/70 space-y-2 relative group">
                    {orderLines.length > 1 && (
                      <button 
                        onClick={() => handleRemoveLine(idx)}
                        className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-red-500 rounded-full hover:bg-background transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-12 gap-2 pt-2">
                      <div className="col-span-12 sm:col-span-6 space-y-1">
                        <span className="text-muted-foreground text-xs">Product</span>
                        <select
                          className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                          value={line.productId}
                          onChange={(e) => handleLineChange(idx, "productId", e.target.value)}
                        >
                          <option value="">Select Product...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-4 sm:col-span-2 space-y-1">
                        <span className="text-muted-foreground text-xs">Qty</span>
                        <Input 
                          type="number"
                          value={line.qty} 
                          onChange={(e) => handleLineChange(idx, "qty", e.target.value)}
                          className="h-8 text-xs font-mono" 
                          min="1"
                        />
                      </div>
                      <div className="col-span-8 sm:col-span-4 space-y-1">
                        <span className="text-muted-foreground text-xs">Total</span>
                        <Input 
                          value={formatINR(line.total)} 
                          readOnly 
                          className="h-8 text-xs font-mono bg-muted/50" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-3 font-mono font-bold text-base border-t border-border/80">
                <span>Grand Total:</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setNewOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleCreateOrder} 
              disabled={submitting}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Confirm Sales Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
