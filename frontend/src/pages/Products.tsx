import { useState } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus, 
  LayoutGrid, 
  List
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Mock Data
const initialProducts = [
  {
    id: "1",
    product: "Air Conditioner",
    category: "Electronics",
    type: "Goods",
    salesPrice: 20000,
    cost: 14000,
  },
  {
    id: "2",
    product: "Refrigerator",
    category: "Electronics",
    type: "Goods",
    salesPrice: 10000,
    cost: 8000,
  }
];

export default function Products() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const filteredProducts = initialProducts.filter(p =>
    p.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pId => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* Header section with title and global actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Master</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage inventory and service products</p>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm bg-card">
        <CardContent className="p-0">
          {/* Action Bar */}
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative max-w-sm w-full md:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9 w-full bg-background h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center rounded-md border border-border/80 bg-background p-1">
                <Button
                  variant={viewMode === "kanban" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setViewMode("kanban")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4">
            {viewMode === "table" ? (
              <div className="overflow-x-auto rounded-md border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableHead className="w-[50px] text-center">
                        <Checkbox 
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0} 
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Sales Price</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id} className="group">
                          <TableCell className="text-center">
                            <Checkbox 
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() => toggleSelect(product.id)}
                              aria-label={`Select ${product.product}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {product.product}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-muted/30">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {product.type}
                          </TableCell>
                          <TableCell className="text-right font-mono text-foreground font-medium">
                            {formatCurrency(product.salesPrice)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {formatCurrency(product.cost)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No products found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              // Kanban View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <Card key={product.id} className="border-border/80 shadow-sm hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                        <div>
                          <CardTitle className="text-base font-semibold">{product.product}</CardTitle>
                          <div className="text-xs text-muted-foreground mt-1">{product.category} • {product.type}</div>
                        </div>
                        <Checkbox 
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleSelect(product.id)}
                        />
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-end mt-4 pt-4 border-t border-border/40">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Sales Price</span>
                            <span className="font-mono font-semibold text-foreground">{formatCurrency(product.salesPrice)}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">Cost</span>
                            <span className="font-mono text-muted-foreground">{formatCurrency(product.cost)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground border rounded-md border-dashed">
                    No products found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border/80 flex items-center justify-between bg-card rounded-b-xl">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </div>
            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
