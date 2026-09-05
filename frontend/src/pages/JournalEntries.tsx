import { useState } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus,
  CheckCircle2,
  XCircle,
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

// Mock Data
const initialEntries = [
  { id: "1", date: "Sep 1", number: "Bill/2026/0001", partner: "Mr. Rahul", journal: "Purchases", total: 30000, status: "Posted" },
  { id: "2", date: "Sep 2", number: "Inv/2026/001", partner: "Mr. Raj", journal: "Sales", total: 10500, status: "Draft" },
];

export default function JournalEntries() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [entries, setEntries] = useState(initialEntries);

  // Form State
  const [date, setDate] = useState("");
  const [journal, setJournal] = useState("");
  const [lines, setLines] = useState([{ account: "Asset A/c", partner: "Rahul", debit: 10000, credit: 0 }, { account: "Bank A/c", partner: "", debit: 0, credit: 10000 }]);

  const filteredEntries = entries.filter(e =>
    e.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.journal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebit = lines.reduce((acc, line) => acc + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((acc, line) => acc + (Number(line.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handlePost = () => {
    if (!isBalanced) return;
    const newEntry = {
      id: String(entries.length + 1),
      date: date || "Today",
      number: `JRNL/${new Date().getFullYear()}/${String(entries.length + 1).padStart(4, '0')}`,
      partner: lines[0]?.partner || "Unknown",
      journal: journal || "Miscellaneous",
      total: totalDebit,
      status: "Posted"
    };
    setEntries([...entries, newEntry]);
    setViewMode("list");
  };

  const updateLine = (index: number, field: string, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { account: "", partner: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Journal Entries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage journal entries and transactions</p>
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
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={handlePost} disabled={!isBalanced}>
                    <CheckCircle2 className="h-4 w-4" />
                    Post
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-border text-muted-foreground" onClick={() => setViewMode("list")}>
                    Cancel
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
                    placeholder="Search entries..."
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
            <div className="p-8">
              {!isBalanced && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold text-sm">Unbalanced Journal Entry</h4>
                    <p className="text-xs mt-1">The total debit amount (Rs. {totalDebit}) and credit amount (Rs. {totalCredit}) do not match. You cannot post this entry until it is balanced.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-4xl">
                <div className="space-y-4">
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-muted-foreground">Accounting Date</label>
                    <Input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-background border-border/80"
                    />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-muted-foreground">Journal</label>
                    <select 
                      value={journal}
                      onChange={(e) => setJournal(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Selection (From journals Many to one)</option>
                      <option value="Sales">Sales</option>
                      <option value="Purchases">Purchases</option>
                      <option value="Bank">Bank</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Journal Items Table */}
              <div className="border border-border/80 rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead>Account</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <select 
                            value={line.account}
                            onChange={(e) => updateLine(index, "account", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-foreground"
                          >
                            <option value="" disabled>Selection From Chart of Accounts</option>
                            <option value="Asset A/c">Asset A/c</option>
                            <option value="Bank A/c">Bank A/c</option>
                            <option value="Cash A/c">Cash A/c</option>
                            <option value="Sales Revenue A/c">Sales Revenue A/c</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <select 
                            value={line.partner}
                            onChange={(e) => updateLine(index, "partner", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-foreground"
                          >
                            <option value="">Selection from contact master</option>
                            <option value="Rahul">Rahul</option>
                            <option value="Raj">Raj</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-right text-destructive font-medium">
                          <Input 
                            type="number" 
                            min="0"
                            value={line.debit || ""}
                            onChange={(e) => updateLine(index, "debit", Number(e.target.value))}
                            className="w-24 text-right ml-auto bg-transparent border-border/50 h-8"
                            placeholder="Rs. 0"
                          />
                        </TableCell>
                        <TableCell className="text-right text-primary font-medium">
                          <Input 
                            type="number" 
                            min="0"
                            value={line.credit || ""}
                            onChange={(e) => updateLine(index, "credit", Number(e.target.value))}
                            className="w-24 text-right ml-auto bg-transparent border-border/50 h-8"
                            placeholder="Rs. 0"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeLine(index)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/5 font-semibold">
                      <TableCell colSpan={2} className="text-right">Total:</TableCell>
                      <TableCell className={`text-right ${totalDebit !== totalCredit ? "text-destructive" : ""}`}>
                        Rs. {totalDebit.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right ${totalDebit !== totalCredit ? "text-destructive" : ""}`}>
                        Rs. {totalCredit.toLocaleString()}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="p-2 bg-muted/10 border-t border-border/80">
                  <Button variant="ghost" size="sm" onClick={addLine} className="text-xs text-primary font-medium">
                    + Add a line
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 p-4 border border-border/50 rounded-md bg-muted/5">
                <h4 className="text-sm font-semibold mb-2">Field Explanation</h4>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li><strong className="text-destructive">Account</strong> - Selection From Chart of Accounts (Many to one)</li>
                  <li><strong className="text-destructive">Partner</strong> - Selection from contact master</li>
                </ul>
                <p className="text-xs mt-3 text-muted-foreground italic">The Transaction would be connected through Chart of Accounts</p>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Journal</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.length > 0 ? (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.id} className="group">
                          <TableCell className="text-muted-foreground">
                            {entry.date}
                          </TableCell>
                          <TableCell className="font-medium text-destructive">
                            {entry.number}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {entry.partner}
                          </TableCell>
                          <TableCell className="text-primary font-medium">
                            {entry.journal}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            Rs. {entry.total.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.status === "Posted" ? "default" : "outline"} className={entry.status === "Posted" ? "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20" : "text-blue-500 border-blue-200"}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No journal entries found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border/80 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredEntries.length}</span> entries
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
