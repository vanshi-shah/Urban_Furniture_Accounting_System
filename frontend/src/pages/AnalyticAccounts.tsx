import { useState } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus,
  Info
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock Data
const initialAccounts = [
  { id: "1", name: "Marketing / Advertising", type: "Expense", startDate: "01/01/2026", endDate: "31/12/2026", status: "Active", achieved: 45, committed: 200000, achievedValue: 10000 },
  { id: "2", name: "R&D / Prototypes", type: "Expense", startDate: "01/01/2026", endDate: "31/12/2026", status: "Active", achieved: 75, committed: 500000, achievedValue: 375000 },
  { id: "3", name: "Sales / Commission", type: "Expense", startDate: "01/01/2026", endDate: "31/12/2026", status: "Draft", achieved: 0, committed: 200000, achievedValue: 0 },
];

export default function AnalyticAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormView, setIsFormView] = useState(false);

  const filteredAccounts = initialAccounts.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isFormView) {
    return (
      <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytic Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Create or edit analytic account details</p>
          </div>
        </div>

        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-0">
            {/* Action Bar */}
            <div className="p-4 border-b border-border/80 flex flex-wrap items-center gap-4 bg-muted/20">
              <Button size="sm" variant="outline" className="gap-2 font-semibold">
                New
              </Button>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Confirm
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFormView(false)} 
                className="gap-2 ml-auto font-semibold"
              >
                Back
              </Button>
            </div>

            {/* Form Fields */}
            <div className="p-8 max-w-2xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-muted-foreground font-medium text-right md:text-left text-sm leading-none">Analytic Account</label>
                <Input 
                  placeholder="Enter account name..." 
                  className="bg-background border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-muted-foreground font-medium text-right md:text-left text-sm leading-none">Type</label>
                <Select defaultValue="income">
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Distinct Okapi Badge */}
            <div className="relative flex justify-center -mb-3 mt-4 z-10">
              <Badge variant="secondary" className="bg-[#fcd3c7] text-[#8e3c31] hover:bg-[#fcd3c7]/80 px-4 py-1 text-sm font-semibold rounded-md border border-[#edb9aa] flex items-center gap-1 shadow-sm">
                Distinct Okapi
              </Badge>
            </div>

            {/* Sub Table */}
            <div className="border-t border-border/80">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10 hover:bg-muted/10">
                    <TableHead className="text-[#a83250] font-semibold">Budget</TableHead>
                    <TableHead className="text-[#a83250] font-semibold">Start Date</TableHead>
                    <TableHead className="text-[#a83250] font-semibold">End Date</TableHead>
                    <TableHead className="text-[#a83250] font-semibold">Committed</TableHead>
                    <TableHead className="text-[#a83250] font-semibold">Achieved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/5 group">
                    <TableCell className="font-medium text-muted-foreground text-sm">January 2026</TableCell>
                    <TableCell className="text-muted-foreground text-sm">01/01/2026</TableCell>
                    <TableCell className="text-muted-foreground text-sm">31/01/2026</TableCell>
                    <TableCell className="text-muted-foreground text-sm">200000</TableCell>
                    <TableCell className="text-muted-foreground text-sm">10000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="p-4 text-xs text-[#d15456] italic pl-8 pb-8 flex items-start gap-1">
                <span className="inline-block mt-0.5">↪</span>
                All the Budgets where this Analytic Account is used
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytic Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage cost centers and analytic spending tracking</p>
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
                  <Button size="sm" onClick={() => setIsFormView(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    New
                  </Button>
                </div>
                <div className="relative max-w-sm w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search accounts..."
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
                      <TableHead>Analytic Account</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Achieved %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account) => (
                        <TableRow key={account.id} onClick={() => setIsFormView(true)} className="group cursor-pointer hover:bg-muted/5">
                          <TableCell className="font-medium text-foreground">
                            {account.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {account.type}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {account.startDate}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {account.endDate}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={account.status === "Active" ? "default" : "outline"}
                              className={account.status === "Active" ? "bg-muted-green text-white hover:bg-muted-green/90" : ""}
                            >
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-full max-w-[60px] bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${account.achieved}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground font-mono">{account.achieved}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No analytic accounts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border/80 flex items-center justify-between mt-auto">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredAccounts.length}</span> accounts
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
              <CardTitle className="text-lg">Analytic Summary</CardTitle>
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
                    Allocated
                  </div>
                  <span className="font-mono font-medium text-foreground">₹5,50,000</span>
                </div>
                <div className="pt-4 mt-2 border-t border-border/80 flex justify-between items-center">
                  <span className="font-semibold text-foreground text-sm">Total Planned</span>
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
