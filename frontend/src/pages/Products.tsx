import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Briefcase,
  Tag,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit,
  X,
  PlusCircle,
  Percent,
  Sparkles,
  Info,
  Check,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export type ProductType = "Goods" | "Service" | "Combo";

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
  createdAt?: string;
}

// Initial default products matching wireframe and furniture enterprise context
const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Air Conditioner",
    type: "Goods",
    category: "Electronics",
    salesPrice: 25000,
    cost: 15000,
    sku: "ELEC-AC-01",
    description: "Inverter 1.5 Ton split air conditioner with smart climate sensing.",
    imageUrl: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-2",
    name: "Refrigerator",
    type: "Goods",
    category: "Electronics",
    salesPrice: 10000,
    cost: 7000,
    sku: "ELEC-RF-02",
    description: "Double door frost-free multi-zone luxury refrigerator.",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-3",
    name: "Teakwood Dining Table (6-Seater)",
    type: "Goods",
    category: "Dining Furniture",
    salesPrice: 65000,
    cost: 38000,
    sku: "FURN-DT-03",
    description: "Solid aged Mysore teak with matte satin oil finish.",
    imageUrl: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-4",
    name: "Chesterfield Leather Armchair",
    type: "Goods",
    category: "Living Room Furniture",
    salesPrice: 42000,
    cost: 24000,
    sku: "FURN-CH-04",
    description: "Hand-tufted top-grain cognac leather accent chair.",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-5",
    name: "Architectural Interior Consultation",
    type: "Service",
    category: "Architectural Services",
    salesPrice: 35000,
    cost: 10000,
    sku: "SERV-INT-05",
    description: "On-site spatial planning, 3D CAD visualization, and timber material curation.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-6",
    name: "Executive Workspace Suite Combo",
    type: "Combo",
    category: "Combos & Sets",
    salesPrice: 115000,
    cost: 72000,
    sku: "COMB-OFF-06",
    description: "Includes Walnut Executive Desk, Ergonomic Mesh Chair, and Credenza storage unit.",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&auto=format&fit=crop&q=80",
  }
];

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

const emptyProduct: Product = {
  id: "",
  name: "",
  type: "Goods",
  category: "Electronics",
  salesPrice: 0,
  cost: 0,
  sku: "",
  description: "",
  imageUrl: ""
};

export default function Products() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // View state: "list" | "kanban" | "form"
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Active product for Form View
  const [activeProduct, setActiveProduct] = useState<Product>(emptyProduct);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Category selection with "Create on the Fly" state
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Local fallback storage for robust instant editing/saving
  const [localProducts, setLocalProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("modura_products_master");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  // Query products from backend or use local state
  const { data: productsData } = useQuery<Product[]>({
    queryKey: ["products-master"],
    queryFn: async () => {
      try {
        const res = await api.get("/master/products");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Normalize backend fields if needed
          return res.data.map((item: any) => ({
            id: item.id || `prod-${Date.now()}`,
            name: item.name || "Unnamed Product",
            type: (item.type as ProductType) || "Goods",
            category: item.category || "General",
            salesPrice: item.salesPrice || item.price || 0,
            cost: item.cost || 0,
            sku: item.sku || "",
            description: item.description || "",
            imageUrl: item.imageUrl || ""
          }));
        }
        return localProducts;
      } catch {
        return localProducts;
      }
    },
  });

  const productsList = productsData || localProducts;

  // Filter products by search and type
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q));
      
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
      id: `prod-${Date.now()}`,
      category: categories[0] || "Electronics",
    });
    setFormErrors({});
    setSaveSuccess(false);
    setIsAddingCategory(false);
    setNewCategoryName("");
    setViewMode("form");
  };

  // Open Form View with existing product
  const handleOpenEdit = (product: Product) => {
    setActiveProduct({ ...product });
    setFormErrors({});
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

  // Save product (backend or local state)
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

    const productToSave: Product = {
      ...activeProduct,
      salesPrice: Number(activeProduct.salesPrice) || 0,
      cost: Number(activeProduct.cost) || 0,
    };

    // Attempt backend sync
    try {
      if (productsList.some((p) => p.id === productToSave.id)) {
        await api.put(`/master/products/${productToSave.id}`, {
          ...productToSave,
          price: productToSave.salesPrice,
        }).catch(() => {});
        
        const updated = localProducts.map((p) =>
          p.id === productToSave.id ? productToSave : p
        );
        setLocalProducts(updated);
        localStorage.setItem("modura_products_master", JSON.stringify(updated));
      } else {
        await api.post("/master/products", {
          ...productToSave,
          price: productToSave.salesPrice,
        }).catch(() => {});
        
        const updated = [productToSave, ...localProducts];
        setLocalProducts(updated);
        localStorage.setItem("modura_products_master", JSON.stringify(updated));
      }
    } catch {
      const exists = localProducts.some((p) => p.id === productToSave.id);
      const updated = exists
        ? localProducts.map((p) => (p.id === productToSave.id ? productToSave : p))
        : [productToSave, ...localProducts];
      setLocalProducts(updated);
      localStorage.setItem("modura_products_master", JSON.stringify(updated));
    }

    queryClient.invalidateQueries({ queryKey: ["products-master"] });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setViewMode("list");
    }, 700);
  };

  // Delete product
  const handleDeleteProduct = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this product from the master catalogue?")) {
      return;
    }
    try {
      await api.delete(`/master/products/${id}`).catch(() => {});
    } catch {}

    const updated = localProducts.filter((p) => p.id !== id);
    setLocalProducts(updated);
    localStorage.setItem("modura_products_master", JSON.stringify(updated));
    queryClient.invalidateQueries({ queryKey: ["products-master"] });
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveProduct((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick preset samples
  const samplePresets = [
    {
      name: "Air Conditioner Inverter",
      type: "Goods" as ProductType,
      category: "Electronics",
      salesPrice: 25000,
      cost: 15000,
      imageUrl: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Smart French-Door Refrigerator",
      type: "Goods" as ProductType,
      category: "Electronics",
      salesPrice: 10000,
      cost: 7000,
      imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Teak Dining Table Masterpiece",
      type: "Goods" as ProductType,
      category: "Dining Furniture",
      salesPrice: 65000,
      cost: 38000,
      imageUrl: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Custom Furniture CAD Styling",
      type: "Service" as ProductType,
      category: "Architectural Services",
      salesPrice: 35000,
      cost: 10000,
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80",
    }
  ];

  // Calculated margin stats for active form product
  const calculatedProfit = (activeProduct.salesPrice || 0) - (activeProduct.cost || 0);
  const calculatedMarginPct = activeProduct.salesPrice > 0 
    ? Math.round((calculatedProfit / activeProduct.salesPrice) * 100) 
    : 0;

  // -------------------------------------------------------------
  // RENDER 1: PRODUCT MASTER FORM VIEW (Matching Wireframe)
  // -------------------------------------------------------------
  if (viewMode === "form") {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Top Action Bar matching wireframe: New, Confirm, Back */}
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
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
          </div>
        </div>

        {/* Save Confirmation Alert */}
        {saveSuccess && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold ml-2">
              Product successfully confirmed and saved to product master ledger!
            </AlertDescription>
          </Alert>
        )}

        {/* Form View Body Card */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-6 sm:p-8">
            {/* Header / Subtitle */}
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
                    activeProduct.type === "Goods"
                      ? "border-primary/40 text-primary bg-primary/5"
                      : activeProduct.type === "Service"
                      ? "border-accent/50 text-accent-foreground bg-accent/10"
                      : "border-purple-500/40 text-purple-700 dark:text-purple-300 bg-purple-500/10"
                  }`}
                >
                  {activeProduct.type === "Goods" ? "Physical Goods" : activeProduct.type === "Service" ? "Billable Service" : "Product Combo Pack"}
                </Badge>
              </div>
            </div>

            {/* Main Form Layout (2 Columns: Data Fields + Upload Box) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-2 space-y-5">
                {/* 1. Product Name */}
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

                {/* 2. Product Type Dropdown (Goods, Service, Combo) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Boxes className="h-3.5 w-3.5 text-primary" />
                      Product Type
                    </span>
                    <span className="text-[11px] text-muted-foreground">Drop-down selection</span>
                  </label>
                  
                  {/* Visual Dropdown / Button Selector for Goods, Service, Combo */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveProduct({ ...activeProduct, type: "Goods" })}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        activeProduct.type === "Goods"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-foreground">Goods</span>
                        {activeProduct.type === "Goods" && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        Physical furniture & inventory
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveProduct({ ...activeProduct, type: "Service" })}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        activeProduct.type === "Service"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-foreground">Service</span>
                        {activeProduct.type === "Service" && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        Design, delivery & styling
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveProduct({ ...activeProduct, type: "Combo" })}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        activeProduct.type === "Combo"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-foreground">Combo</span>
                        {activeProduct.type === "Combo" && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        Bundled room & office sets
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3. Category (Many2one Field with "Create on the fly") */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      Category
                    </label>
                    <span className="text-[11px] text-primary/80 font-medium">
                      Many2one Field (Create on the fly)
                    </span>
                  </div>

                  {!isAddingCategory ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={activeProduct.category}
                          onChange={(e) => setActiveProduct({ ...activeProduct, category: e.target.value })}
                          className="w-full h-10 px-3 pr-8 rounded-xl border border-border/80 bg-background/70 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
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
                    /* Inline "Create on the fly" Input */
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

                {/* 4. Pricing Row: Sales Price & Cost (Financial Precision) */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    Commercial & Valuation Pricing (INR)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sales Price */}
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

                    {/* Cost */}
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
                        Acquisition/Bill of Materials: <strong>{formatCurrency(activeProduct.cost)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Margin Indicator (Quiet Luxury Financial Metric) */}
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

                {/* 5. Additional Ledger Meta: SKU & Description */}
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

              {/* Right Column: Upload Image Box matching wireframe */}
              <div className="flex flex-col items-center justify-start space-y-4">
                <div className="w-full flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Upload Image
                  </label>
                  {activeProduct.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveProduct({ ...activeProduct, imageUrl: "" })}
                      className="text-[11px] text-destructive hover:underline font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Upload Area Box */}
                <div className="relative w-full h-64 rounded-2xl border-2 border-dashed border-border/80 bg-secondary/20 flex flex-col items-center justify-center p-4 text-center group hover:border-primary/60 transition-all overflow-hidden">
                  {activeProduct.imageUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <img
                        src={activeProduct.imageUrl}
                        alt="Product Preview"
                        className="h-44 w-full object-cover rounded-xl border border-border/60 shadow-xs"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-destructive hover:bg-destructive hover:text-white shadow-xs transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProduct({ ...activeProduct, imageUrl: "" });
                        }}
                        title="Delete image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[11px] text-muted-foreground mt-2 font-medium">
                        Click box to upload new photo
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform text-primary">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        Upload Image
                      </div>
                      <p className="text-[11px] text-muted-foreground max-w-[180px]">
                        Click or drag image file here (PNG, JPG, WebP)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {/* Quick Presets for Demo / Testing */}
                <div className="w-full space-y-2 pt-2 border-t border-border/60">
                  <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    1-Click Demo Fill Presets:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {samplePresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setActiveProduct((prev) => ({
                            ...prev,
                            name: preset.name,
                            type: preset.type,
                            category: preset.category,
                            salesPrice: preset.salesPrice,
                            cost: preset.cost,
                            imageUrl: preset.imageUrl,
                          }));
                        }}
                        className="p-1.5 rounded-lg border border-border/60 bg-card hover:bg-secondary text-left text-[10px] text-foreground font-medium truncate transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
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
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Product Master
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage inventory catalogue, billable design services, furniture combos, and cost valuations.
          </p>
        </div>

        {/* Global Stats Bar */}
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
          {/* Top Action Bar matching wireframe: New, Search, Back, View Switcher */}
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-3 bg-secondary/30">
            {/* Left Actions: New, Back */}
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

            {/* Center: Search & Type Filter */}
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

              {/* Quick Type Filter Pills */}
              <div className="hidden sm:flex items-center gap-1 bg-background/60 p-0.5 rounded-lg border border-border/70 text-[11px]">
                {["ALL", "Goods", "Service", "Combo"].map((t) => (
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

            {/* Right: View Toggle (List View vs Kanban View) */}
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

          {/* ------------------------------------------------------------- */}
          {/* VIEW A: PRODUCT MASTER LIST VIEW                              */}
          {/* ------------------------------------------------------------- */}
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
                    <th className="w-16 px-4 py-3">Image</th>
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
                          <td className="px-4 py-3">
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="h-10 w-10 object-cover rounded-xl border border-border/70 shadow-2xs"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center border border-border/60 text-primary font-bold text-xs">
                                {prod.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
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
                                prod.type === "Goods"
                                  ? "border-primary/30 text-primary bg-primary/5"
                                  : prod.type === "Service"
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
                      <td colSpan={9} className="h-32 text-center text-muted-foreground">
                        No products found matching &quot;{searchTerm}&quot;. Click <strong>New</strong> to create a record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW B: PRODUCT MASTER KANBAN VIEW (Matching Wireframe)       */}
          {/* ------------------------------------------------------------- */}
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
                        {/* Top Section: Image + Details matching wireframe */}
                        <div className="flex items-start gap-4">
                          {/* Image Box */}
                          <div className="relative h-20 w-20 rounded-xl border border-border/70 bg-secondary/30 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground p-1 text-center">
                                <Package className="h-6 w-6 text-primary/70 mb-0.5" />
                                <span className="text-[9px] font-semibold">Image</span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
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
                                  product.type === "Goods"
                                    ? "border-primary/30 text-primary bg-primary/5"
                                    : product.type === "Service"
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

                        {/* Bottom Section: Sales Price & Cost (Matching Wireframe: Sales Price 25000, Cost 15000) */}
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

          {/* Bottom Bar: Record Count & Hint */}
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
