import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus,
  CheckCircle2,
  Archive,
  Home,
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
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

type Account = {
  id: string;
  code: string;
  name: string;
  type: string;
};

export default function ChartOfAccounts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newAccountCode, setNewAccountCode] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("");

  const fetchAccounts = async () => {
    try {
      const data = await apiFetch('/master/accounts');
      setAccounts(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'ASSET': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      case 'LIABILITY': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300';
      case 'EQUITY': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
      case 'INCOME': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      case 'EXPENSE': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = async () => {
    if (!newAccountCode || !newAccountName || !newAccountType) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch('/master/accounts', {
        method: 'POST',
        body: JSON.stringify({
          code: newAccountCode,
          name: newAccountName,
          type: newAccountType
        })
      });

      await fetchAccounts();
      
      setViewMode("list");
      setNewAccountCode("");
      setNewAccountName("");
      setNewAccountType("");
    } catch (err: any) {
      setError(err.message || "Failed to save account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* Header section with title and global actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage pre-configured financial accounts</p>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm bg-card">
        <CardContent className="p-0">
          {/* Action Bar */}
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-center gap-2">
              {viewMode === "list" ? (
                <>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => setViewMode("form")}>
                    <Plus className="h-4 w-4" />
                    New
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handleSave} disabled={loading}>
                    <CheckCircle2 className="h-4 w-4" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-border text-muted-foreground" onClick={() => setViewMode("list")} disabled={loading}>
                    Discard
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {viewMode === "list" && (
                <div className="relative max-w-sm w-full md:w-auto mr-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search accounts..."
                    className="pl-9 w-full md:w-[250px] bg-background h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              <Button size="sm" variant="outline" className="gap-2 border-border" onClick={() => navigate("/dashboard")}>
                <Home className="h-4 w-4 text-muted-foreground" />
                Home
              </Button>
              <Button size="sm" variant="outline" onClick={() => viewMode === 'form' ? setViewMode('list') : navigate(-1)} className="gap-2 border-border">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                Back
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm flex items-center gap-2 border-b border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Form View */}
          {viewMode === "form" && (
            <div className="p-8 max-w-2xl">
              <div className="space-y-6">
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-muted-foreground text-right">Account Code <span className="text-destructive">*</span></label>
                  <Input 
                    placeholder="e.g. 10100" 
                    value={newAccountCode}
                    onChange={(e) => setNewAccountCode(e.target.value)}
                    className="bg-background max-w-md border-border/80"
                  />
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-muted-foreground text-right">Account Name <span className="text-destructive">*</span></label>
                  <Input 
                    placeholder="e.g. Petty Cash" 
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="bg-background max-w-md border-border/80"
                  />
                </div>
                
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-muted-foreground text-right">Type <span className="text-destructive">*</span></label>
                  <select 
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value)}
                    className="flex h-10 w-full max-w-md items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select Account Type...</option>
                    <option value="ASSET">Asset</option>
                    <option value="LIABILITY">Liability</option>
                    <option value="EQUITY">Equity</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                
                <div className="pt-4 ml-[156px]">
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed italic">
                    Each account is assigned an Account Type, which would further be used for how the account to be treated and where it appears in reports.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableHead className="w-[120px]">Account Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((acc) => (
                        <TableRow key={acc.id} className="group">
                          <TableCell className="font-mono text-muted-foreground">
                            {acc.code}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {acc.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTypeColor(acc.type)}>
                              {acc.type}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No accounts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border/80 flex items-center justify-between">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
