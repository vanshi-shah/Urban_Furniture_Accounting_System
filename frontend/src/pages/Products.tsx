import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  Plus,
  CheckCircle2,
  LayoutList,
  LayoutGrid,
  Upload,
  Package,
  Boxes,
  Tag,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit,
  X,
  PlusCircle,
  Sparkles,
  Check,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

export type ProductType = "GOODS" | "SERVICE" | "COMBO";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  category: string;
  salesPrice: number;
  cost: number;
  imageUrl?: string;
  sku?: string;
  description?: string;
}

const emptyProduct: Product = {
  id: "",
  name: "",
  type: "GOODS",
  category: "General",
  salesPrice: 0,
  cost: 0,
  sku: "",
  description: "",
  imageUrl: ""
};

const defaultCategories = [
  "Electronics",
  "Living Room Furniture",
  "Dining Furniture",
  "Office Fixtures",
  "Architectural Services",
  "Combos & Sets",
  "Lighting & Decor",
  "Raw Materials"
];

export default function Products() {
  const navigate = useNavigate();

  // View state: "list" | "kanban" | "form"
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Active product for Form View
  const [activeProduct, setActiveProduct] = useState<Product>(emptyProduct);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // Category selection with "Create on the Fly" state
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [productsList, setProductsList] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const data = await apiFetch('/master/products');
      setProductsList(data || []);
      // Extract unique categories
      if (data) {
        const uniqueCategories = new Set(defaultCategories);
        data.forEach((p: any) => {
          if (p.category) uniqueCategories.add(p.category);
        });
        setCategories(Array.from(uniqueCategories));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by search and type
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const q = searchTerm.toLowerCase();
      const categoryStr = p.category || "";
      const skuStr = p.sku || "";
      const typeStr = p.type || "";
      
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        categoryStr.toLowerCase().includes(q) ||
        typeStr.toLowerCase().includes(q) ||
        skuStr.toLowerCase().includes(q);
      
      const matchesType = typeFilter === "ALL" || p.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [productsList, searchTerm, typeFilter]);

  // Formatter for INR Currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Open Form View in "New" (blank) mode
  const handleOpenNew = () => {
    setActiveProduct({
      ...emptyProduct,
      category: categories[0] || "Electronics",
    });
    setFormErrors({});
    setApiError("");
    setSaveSuccess(false);
    setIsAddingCategory(false);
    setNewCategoryName("");
    setViewMode("form");
  };

  // Open Form View with existing product
  const handleOpenEdit = (product: Product) => {
    setActiveProduct({ ...product });
    setFormErrors({});
    setApiError("");
    setSaveSuccess(false);
    setIsAddingCategory(false);
    setNewCategoryName("");
    setViewMode("form");
  };

  // Create Category On The Fly
  const handleCreateCategoryOnTheFly = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
    }
    setActiveProduct((prev) => ({ ...prev, category: trimmed }));
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  // Save product
  const handleSaveProduct = async () => {
    const errors: { [key: string]: string } = {};
    if (!activeProduct.name.trim()) {
      errors.name = "Product Name is required";
    }
    if (activeProduct.salesPrice < 0) {
      errors.salesPrice = "Sales Price cannot be negative";
    }
    if (activeProduct.cost < 0) {
      errors.cost = "Cost cannot be negative";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setApiError("");
    setLoading(true);

    const productToSave = {
      ...activeProduct,
      salesPrice: Number(activeProduct.salesPrice) || 0,
      cost: Number(activeProduct.cost) || 0,
    };

    try {
      if (productToSave.id) {
        await apiFetch(`/master/products/${productToSave.id}`, {
          method: 'PUT',
          body: JSON.stringify(productToSave)
        });
      } else {
        const { id, ...newProduct } = productToSave;
        await apiFetch('/master/products', {
          method: 'POST',
          body: JSON.stringify(newProduct)
        });
      }

      await fetchProducts();

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setViewMode("list");
      }, 700);
    } catch (err: any) {
      setApiError(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this product from the master catalogue?")) {
      return;
    }
    try {
      await apiFetch(`/master/products/${id}`, {
        method: 'DELETE'
      });
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  // Calculated margin stats for active form product
  const calculatedProfit = (activeProduct.salesPrice || 0) - (activeProduct.cost || 0);
  const calculatedMarginPct = activeProduct.salesPrice > 0 
    ? Math.round((calculatedProfit / activeProduct.salesPrice) * 100) 
    : 0;

  // -------------------------------------------------------------
  // RENDER 1: PRODUCT MASTER FORM VIEW
  // -------------------------------------------------------------
  if (viewMode === "form") {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:opacity-95 text-xs h-9 px-4 font-semibold shadow-xs"
              onClick={handleOpenNew}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-border hover:bg-secondary text-xs h-9 px-4 font-semibold text-foreground"
              onClick={handleSaveProduct}
              disabled={loading}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Confirm
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-9 px-4 border-border/80 text-foreground"
              onClick={() => setViewMode("list")}
              disabled={loading}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
          </div>
        </div>

        {apiError && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {apiError}
          </div>
        )}

        {saveSuccess && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold ml-2">
              Product successfully confirmed and saved to product master ledger!
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-border/60 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Product Master Form View
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure catalogue specifications, product classification, pricing margins, and imagery.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-0.5 font-semibold ${
                    activeProduct.type === "GOODS"
                      ? "border-primary/40 text-primary bg-primary/5"
                      : activeProduct.type === "SERVICE"
                      ? "border-accent/50 text-accent-foreground bg-accent/10"
                      : "border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10"
                  }`}
                >
                  {activeProduct.type === "GOODS" ? "Physical Goods" : activeProduct.type === "SERVICE" ? "Billable Service" : "Product Combo Pack"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-primary" />
                      Product Name <span className="text-destructive">*</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">e.g. Air Conditioner, Refrigerator</span>
                  </label>
                  <Input
                    placeholder="Enter product title..."
                    value={activeProduct.name}
                    onChange={(e) => setActiveProduct({ ...activeProduct, name: e.target.value })}
                    className={`bg-background/60 border-border/80 h-10 text-sm font-medium ${
                      formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Boxes className="h-3.5 w-3.5 text-primary" />
                      Product Type
                    </span>
                    <span className="text-[11px] text-muted-foreground">Drop-down selection</span>
                  </label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveProduct({ ...activeProduct, type: "GOODS" })}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        activeProduct.type === "GOODS"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-foreground">Goods</span>
                        {activeProduct.type === "GOODS" && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        Physical furniture & inventory
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveProduct({ ...activeProduct, type: "SERVICE" })}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        activeProduct.type === "SERVICE"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-foreground">Service</span>
                        {activeProduct.type === "SERVICE" && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        Design, delivery & styling
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveProduct({ ...activeProduct, type: "COMBO" })}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        activeProduct.type === "COMBO"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-foreground">Combo</span>
                        {activeProduct.type === "COMBO" && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        Bundled room & office sets
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      Category
                    </label>
                  </div>

                  {!isAddingCategory ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={activeProduct.category}
                          onChange={(e) => setActiveProduct({ ...activeProduct, category: e.target.value })}
                          className="w-full h-10 px-3 pr-8 rounded-xl border border-border/80 bg-background/70 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 px-3 text-xs border-border/80 text-primary hover:bg-primary/10 font-semibold shrink-0"
                        onClick={() => setIsAddingCategory(true)}
                      >
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />
                        Create New
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-primary/40 bg-primary/5 space-y-2">
                      <div className="text-[11px] font-semibold text-primary flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Create and save category on the fly:
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="e.g. Ergonomic Seating, Outdoor Accents..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                               e.preventDefault();
                               handleCreateCategoryOnTheFly();
                            }
                          }}
                          className="h-9 bg-background text-xs"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-9 px-3 text-xs bg-primary text-primary-foreground font-semibold"
                          onClick={handleCreateCategoryOnTheFly}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-2 text-xs text-muted-foreground"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setNewCategoryName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    Commercial & Valuation Pricing (INR)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Sales Price</span>
                        <span className="text-[10px] font-mono text-muted-foreground">Revenue/Unit</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground">
                          Rs.
                        </span>
                        <Input
                          type="number"
                          placeholder="100.00"
                          value={activeProduct.salesPrice === 0 ? "" : activeProduct.salesPrice}
                          onChange={(e) =>
                            setActiveProduct({
                              ...activeProduct,
                              salesPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="pl-10 h-10 font-mono text-sm font-semibold bg-background border-border/80"
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Customer billing: <strong>{formatCurrency(activeProduct.salesPrice)}</strong>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Cost</span>
                        <span className="text-[10px] font-mono text-muted-foreground">COGS/Unit</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground">
                          Rs.
                        </span>
                        <Input
                          type="number"
                          placeholder="50.00"
                          value={activeProduct.cost === 0 ? "" : activeProduct.cost}
                          onChange={(e) =>
                            setActiveProduct({
                              ...activeProduct,
                              cost: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="pl-10 h-10 font-mono text-sm font-semibold bg-background border-border/80"
                        />
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Acquisition/BOM: <strong>{formatCurrency(activeProduct.cost)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-xl border border-border/60 bg-secondary/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">Gross Profit / Unit:</span>
                      <span className={`font-mono font-bold ${calculatedProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}`}>
                        {formatCurrency(calculatedProfit)}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-mono font-semibold ${
                        calculatedMarginPct >= 30
                          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
                          : calculatedMarginPct > 0
                          ? "border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10"
                          : "border-destructive/40 text-destructive bg-destructive/10"
                      }`}
                    >
                      {calculatedMarginPct}% Margin
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Internal Reference / SKU
                    </label>
                    <Input
                      placeholder="e.g. ELEC-AC-01"
                      value={activeProduct.sku || ""}
                      onChange={(e) => setActiveProduct({ ...activeProduct, sku: e.target.value })}
                      className="bg-background/60 border-border/80 h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Product Notes / Material Specifications
                    </label>
                    <Textarea
                      placeholder="Specifications, wood species, warranty, or electrical ratings..."
                      value={activeProduct.description || ""}
                      onChange={(e) => setActiveProduct({ ...activeProduct, description: e.target.value })}
                      className="bg-background/60 border-border/80 text-xs min-h-[70px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: PRODUCT MASTER LIST VIEW & KANBAN VIEW
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Product Master
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage inventory catalogue, billable design services, furniture combos, and cost valuations.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-2xl border border-border/80 shadow-2xs">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Total Catalogue</div>
            <div className="text-sm font-bold font-mono text-foreground">{productsList.length} Items</div>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Categories</div>
            <div className="text-sm font-bold font-mono text-primary">{categories.length}</div>
          </div>
        </div>
      </div>

      <Card className="border-border/80 shadow-xs bg-card">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-3 bg-secondary/30">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:opacity-95 text-xs h-9 px-4 font-semibold shadow-xs"
                onClick={handleOpenNew}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                New
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 px-3 border-border/80 text-foreground"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search product, category, type (e.g. Air Conditioner)..."
                  className="pl-9 bg-background/80 h-9 text-xs border-border/80 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="hidden sm:flex items-center gap-1 bg-background/60 p-0.5 rounded-lg border border-border/70 text-[11px]">
                {["ALL", "GOODS", "SERVICE", "COMBO"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      typeFilter === t
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-background/60 p-1 rounded-xl border border-border/80">
              <Button
                size="sm"
                variant={viewMode === "list" ? "secondary" : "ghost"}
                className={`h-7 px-2.5 text-xs rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground"
                }`}
                onClick={() => setViewMode("list")}
                title="Switch to Product Master List View"
              >
                <LayoutList className="h-3.5 w-3.5 mr-1" />
                List
              </Button>

              <Button
                size="sm"
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                className={`h-7 px-2.5 text-xs rounded-lg transition-all ${
                  viewMode === "kanban"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground"
                }`}
                onClick={() => setViewMode("kanban")}
                title="Switch to Product Master Kanban View"
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                Kanban
              </Button>
            </div>
          </div>

          {viewMode === "list" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="w-12 px-4 py-3 text-center">
                      <Checkbox
                        checked={
                          selectedIds.length === filteredProducts.length && filteredProducts.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all products"
                      />
                    </th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Sales Price</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                    <th className="px-4 py-3 text-center">Margin</th>
                    <th className="w-20 px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((prod) => {
                      const profit = (prod.salesPrice || 0) - (prod.cost || 0);
                      const marginPct = prod.salesPrice > 0 ? Math.round((profit / prod.salesPrice) * 100) : 0;
                      return (
                        <tr
                          key={prod.id}
                          onClick={() => handleOpenEdit(prod)}
                          className="hover:bg-secondary/40 cursor-pointer transition-colors group"
                        >
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.includes(prod.id)}
                              onCheckedChange={() => handleToggleSelect(prod.id)}
                              aria-label={`Select ${prod.name}`}
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                            <div>{prod.name}</div>
                            {prod.sku && (
                              <div className="text-[10px] font-mono text-muted-foreground font-normal">
                                {prod.sku}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px] bg-secondary/50 font-medium">
                              {prod.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                prod.type === "GOODS"
                                  ? "border-primary/30 text-primary bg-primary/5"
                                  : prod.type === "SERVICE"
                                  ? "border-accent/40 text-accent-foreground bg-accent/10"
                                  : "border-purple-500/30 text-purple-700 dark:text-purple-300 bg-purple-500/5"
                              }`}
                            >
                              {prod.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                            {formatCurrency(prod.salesPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                            {formatCurrency(prod.cost)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                                marginPct >= 30
                                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
                                  : marginPct > 0
                                  ? "text-amber-700 dark:text-amber-400 bg-amber-500/10"
                                  : "text-destructive bg-destructive/10"
                              }`}
                            >
                              {marginPct}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEdit(prod)}
                                title="Edit Product"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => handleDeleteProduct(prod.id, e)}
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="h-32 text-center text-muted-foreground">
                        No products found matching &quot;{searchTerm}&quot;. Click <strong>New</strong> to create a record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === "kanban" && (
            <div className="p-6">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map((product) => {
                    const profit = (product.salesPrice || 0) - (product.cost || 0);
                    const marginPct = product.salesPrice > 0 ? Math.round((profit / product.salesPrice) * 100) : 0;
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleOpenEdit(product)}
                        className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div className="flex items-start gap-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium bg-secondary/50">
                                {product.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1.5 py-0 font-semibold ${
                                  product.type === "GOODS"
                                    ? "border-primary/30 text-primary bg-primary/5"
                                    : product.type === "SERVICE"
                                    ? "border-accent/40 text-accent-foreground bg-accent/10"
                                    : "border-purple-500/30 text-purple-700 dark:text-purple-300 bg-purple-500/5"
                                }`}
                              >
                                {product.type}
                              </Badge>
                            </div>

                            {product.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 pt-0.5">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-0.5">
                              Sales Price
                            </span>
                            <span className="font-mono font-bold text-sm text-foreground">
                              {formatCurrency(product.salesPrice)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mb-0.5">
                              Cost
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatCurrency(product.cost)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                                marginPct >= 30
                                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
                                  : marginPct > 0
                                  ? "text-amber-700 dark:text-amber-400 bg-amber-500/10"
                                  : "text-destructive bg-destructive/10"
                              }`}
                            >
                              +{marginPct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-muted-foreground space-y-2 border border-dashed border-border/80 rounded-2xl">
                  <p className="text-xs">No products found matching current filters.</p>
                  <Button size="sm" onClick={handleOpenNew} className="text-xs bg-primary text-primary-foreground">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create New Product
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground bg-secondary/20 rounded-b-xl">
            <span>
              Showing <strong className="text-foreground">{filteredProducts.length}</strong> of {productsList.length} products
            </span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              💡 Click any row or kanban card to open <strong>Product Master Form View</strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
