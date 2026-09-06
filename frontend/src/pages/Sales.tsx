import { useState, useEffect } from "react";
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

  // New Order Form state
  const [customerName, setCustomerName] = useState("Aura Architecture Studio");
  const [orderLines, setOrderLines] = useState([
    { product: "Bespoke Teak Executive Desk", qty: 2, unitPrice: 120000, total: 240000 },
  ]);

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
        apiFetch("/orders?type=CUSTOMER_INVOICE"),
        apiFetch("/master/contacts"),
        apiFetch("/master/products"),
      ]);

      if (contactRes.status === "fulfilled" && Array.isArray(contactRes.value)) {
        setContacts(contactRes.value);
      }
      if (productRes.status === "fulfilled" && Array.isArray(productRes.value)) {
        setProducts(productRes.value);
      }
    } catch (err) {
      console.error(err);
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

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredOrders = sampleSalesOrders.filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : order.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateOrder = () => {
    setNewOrderModalOpen(false);
    // Success notice / clean state
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
            onClick={() => setNewOrderModalOpen(true)}
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
              Sales Orders (12)
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <Receipt className="h-4 w-4 mr-2 text-accent" />
              Sale Invoices (10)
            </TabsTrigger>
            <TabsTrigger value="receipts" className="text-xs md:text-sm font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <CreditCard className="h-4 w-4 mr-2 text-emerald-600" />
              Customer Receipts (3)
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
                All (12)
              </button>
              <button
                onClick={() => setStatusFilter("CONFIRMED")}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${statusFilter === "CONFIRMED" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Confirmed (10)
              </button>
              <button
                onClick={() => setStatusFilter("DRAFT")}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${statusFilter === "DRAFT" ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Draft (2)
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
              <Badge variant="outline" className="text-xs">10 Active Invoices</Badge>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {sampleSalesOrders.filter(o => o.status === "CONFIRMED").map((inv) => (
                <div key={inv.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">INV-2026-{inv.orderNumber.replace("SO", "")}</span>
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
              <Badge variant="outline" className="text-xs font-mono">3 Verified Receipts</Badge>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {sampleReceipts.map((rec) => (
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

          <div className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Customer (Client / Architecture Studio)</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Aura Architecture Studio"
              />
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
              <div className="font-semibold text-foreground">Order Line Item</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <span className="text-muted-foreground">Product</span>
                  <Input value={orderLines[0].product} readOnly className="h-8 text-xs font-medium" />
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Qty</span>
                  <Input value={orderLines[0].qty} readOnly className="h-8 text-xs font-mono" />
                </div>
              </div>
              <div className="flex justify-between pt-1 font-mono font-bold text-sm">
                <span>Grand Total:</span>
                <span>{formatINR(240000)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setNewOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateOrder} className="bg-sky-600 hover:bg-sky-700 text-white">
              Confirm Sales Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
