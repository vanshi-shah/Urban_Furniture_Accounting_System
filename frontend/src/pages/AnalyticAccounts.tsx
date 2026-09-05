import { useState } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus
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
const initialBudgets = [
  { id: "1", name: "January 2024", type: "Expense", startDate: "01/01/2024", endDate: "31/01/2024", status: "Active", achieved: 45 },
  { id: "2", name: "Q1 Marketing", type: "Expense", startDate: "01/01/2024", endDate: "31/03/2024", status: "Active", achieved: 75 },
  { id: "3", name: "February 2024", type: "Expense", startDate: "01/02/2024", endDate: "29/02/2024", status: "Draft", achieved: 0 },
];

export default function AnalyticAccounts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBudgets = initialBudgets.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Budgets & Analytic Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage budgets and cost centers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List Section */}
        <div className="lg:col-span-2">
          <Card className="border-border/80 shadow-sm bg-card h-full">
            <CardContent className="p-0 flex flex-col h-full">
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
                <div className="relative max-w-sm w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search budgets..."
                    className="pl-9 w-full md:w-[250px] bg-background h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableHead>Budget / Analytic Account</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Achieved %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets.length > 0 ? (
                      filteredBudgets.map((budget) => (
                        <TableRow key={budget.id} className="group cursor-pointer hover:bg-muted/5">
                          <TableCell className="font-medium text-foreground">
                            {budget.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {budget.type}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {budget.startDate}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {budget.endDate}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={budget.status === "Active" ? "default" : "outline"}
                              className={budget.status === "Active" ? "bg-muted-green text-white hover:bg-muted-green/90" : ""}
                            >
                              {budget.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-full max-w-[60px] bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${budget.achieved}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground font-mono">{budget.achieved}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No budgets found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border/80 flex items-center justify-between mt-auto">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredBudgets.length}</span> budgets
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

        {/* Budget Report & Pie Chart Section */}
        <div className="lg:col-span-1">
          <Card className="border-border/80 shadow-sm bg-card h-full">
            <CardHeader className="border-b border-border/80 pb-4">
              <CardTitle className="text-lg">Budget Report</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              {/* CSS Only Pie Chart representation */}
              <div className="relative w-48 h-48 rounded-full shadow-inner bg-muted mb-8"
                   style={{
                     background: "conic-gradient(#5F6848 0% 45%, #F7F5EF 45% 100%)",
                     border: "1px solid #DCDDD3"
                   }}
              >
                <div className="absolute inset-0 m-auto w-32 h-32 bg-card rounded-full shadow-sm flex items-center justify-center flex-col border border-border/50">
                  <span className="text-2xl font-bold text-foreground">45%</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Achieved</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    Achieved / Spent
                  </div>
                  <span className="font-mono font-medium text-foreground">₹4,50,000</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-3 h-3 rounded-sm bg-[#F7F5EF] border border-border" />
                    Remaining Budget
                  </div>
                  <span className="font-mono font-medium text-foreground">₹5,50,000</span>
                </div>
                <div className="pt-4 mt-2 border-t border-border/80 flex justify-between items-center">
                  <span className="font-semibold text-foreground text-sm">Total Budget</span>
                  <span className="font-mono font-bold text-foreground">₹10,00,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
