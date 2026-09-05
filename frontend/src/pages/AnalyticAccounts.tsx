import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus,
  AlertCircle
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
import { apiFetch } from "@/lib/api";

type AnalyticAccount = {
  id: string;
  name: string;
  budgetLimit: number | null;
};

export default function AnalyticAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormView, setIsFormView] = useState(false);
  
  const [accounts, setAccounts] = useState<AnalyticAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newBudgetLimit, setNewBudgetLimit] = useState("");

  const fetchAccounts = async () => {
    try {
      const data = await apiFetch('/master/analytic-accounts');
      setAccounts(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!newName) {
      setError("Please fill in the account name.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await apiFetch('/master/analytic-accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          budgetLimit: newBudgetLimit ? parseFloat(newBudgetLimit) : null
        })
      });
      
      await fetchAccounts();
      
      setIsFormView(false);
      setNewName("");
      setNewBudgetLimit("");
    } catch (err: any) {
      setError(err.message || "Failed to save analytic account");
    } finally {
      setLoading(false);
    }
  };

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
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handleSave} disabled={loading}>
                Confirm
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsFormView(false)} 
                className="gap-2 ml-auto font-semibold"
                disabled={loading}
              >
                Back
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive text-sm flex items-center gap-2 border-b border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Form Fields */}
            <div className="p-8 max-w-2xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-muted-foreground font-medium text-right md:text-left text-sm leading-none">Account Name <span className="text-destructive">*</span></label>
                <Input 
                  placeholder="Enter account name..." 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-4">
                <label className="text-muted-foreground font-medium text-right md:text-left text-sm leading-none">Budget Limit</label>
                <Input 
                  type="number"
                  placeholder="e.g. 5000" 
                  value={newBudgetLimit}
                  onChange={(e) => setNewBudgetLimit(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalBudget = accounts.reduce((acc, curr) => acc + (curr.budgetLimit || 0), 0);

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
                      <TableHead>Budget Limit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account) => (
                        <TableRow key={account.id} className="group hover:bg-muted/5">
                          <TableCell className="font-medium text-foreground">
                            {account.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono">
                            {account.budgetLimit !== null ? account.budgetLimit.toLocaleString() : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
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
                     background: "conic-gradient(#5F6848 0% 10%, #F7F5EF 10% 100%)",
                     border: "1px solid #DCDDD3"
                   }}
              >
                <div className="absolute inset-0 m-auto w-32 h-32 bg-card rounded-full shadow-sm flex items-center justify-center flex-col border border-border/50">
                  <span className="text-2xl font-bold text-foreground">10%</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Used</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-3 h-3 rounded-sm bg-[#F7F5EF] border border-border" />
                    Total Budget Limits
                  </div>
                  <span className="font-mono font-medium text-foreground">{totalBudget.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
