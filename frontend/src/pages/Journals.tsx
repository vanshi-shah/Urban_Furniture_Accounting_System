import { useState } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus,
  CheckCircle2
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

// Mock Data
const initialJournals = [
  { id: "1", name: "Sales", type: "Sales", defaultAccount: "Sales Revenue A/c" },
  { id: "2", name: "Purchase", type: "Purchase", defaultAccount: "Purchase Expenses A/c" },
  { id: "3", name: "Bank", type: "Bank", defaultAccount: "Bank A/c" },
  { id: "4", name: "Cash", type: "Cash", defaultAccount: "Cash A/c" },
];

export default function Journals() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [journals, setJournals] = useState(initialJournals);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newDefaultAccount, setNewDefaultAccount] = useState("");

  const filteredJournals = journals.filter(j =>
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!newName || !newType || !newDefaultAccount) return;
    const newJ = {
      id: String(journals.length + 1),
      name: newName,
      type: newType,
      defaultAccount: newDefaultAccount
    };
    setJournals([...journals, newJ]);
    setViewMode("list");
    setNewName("");
    setNewType("");
    setNewDefaultAccount("");
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Journals</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage financial journals</p>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm bg-card">
        <CardContent className="p-0">
          {/* Action Bar */}
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-center gap-2">
              {viewMode === "list" ? (
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => setViewMode("form")}>
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              ) : (
                <>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handleSave}>
                    <CheckCircle2 className="h-4 w-4" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-border text-muted-foreground" onClick={() => setViewMode("list")}>
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
                    placeholder="Search journals..."
                    className="pl-9 w-full md:w-[250px] bg-background h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              <Button size="sm" variant="outline" onClick={() => viewMode === "form" ? setViewMode("list") : navigate(-1)} className="gap-2 border-border">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                Back
              </Button>
            </div>
          </div>

          {/* Form View */}
          {viewMode === "form" && (
            <div className="p-8 max-w-2xl">
              <div className="space-y-6">
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-muted-foreground text-right">Journal Name</label>
                  <Input 
                    placeholder="e.g. Daily Sales" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-background max-w-md border-border/80"
                  />
                </div>
                
                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-muted-foreground text-right">Journal Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="flex h-10 w-full max-w-md items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Selection</option>
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Bank">Bank</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                  <label className="text-sm font-medium text-muted-foreground text-right">Default Account</label>
                  <select 
                    value={newDefaultAccount}
                    onChange={(e) => setNewDefaultAccount(e.target.value)}
                    className="flex h-10 w-full max-w-md items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Selection</option>
                    <option value="Sales Revenue A/c">Sales Revenue A/c</option>
                    <option value="Purchase Expenses A/c">Purchase Expenses A/c</option>
                    <option value="Bank A/c">Bank A/c</option>
                    <option value="Cash A/c">Cash A/c</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {viewMode === "list" && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableHead>Journal Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Default Account</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJournals.length > 0 ? (
                      filteredJournals.map((journal) => (
                        <TableRow key={journal.id} className="group">
                          <TableCell className="font-medium text-foreground">
                            {journal.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-medium bg-muted text-foreground hover:bg-muted/80">
                              {journal.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {journal.defaultAccount}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No journals found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border/80 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredJournals.length}</span> journals
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
