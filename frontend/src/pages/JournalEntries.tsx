import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Send
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

export default function JournalEntries() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  
  // Data State
  const [entries, setEntries] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = useState<any[]>([]);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalId, setJournalId] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<any[]>([
    { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 },
    { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesData, journalsData, accountsData, contactsData, analyticData] = await Promise.all([
        apiFetch('/accounting/entries'),
        apiFetch('/master/journals'),
        apiFetch('/master/accounts'),
        apiFetch('/master/contacts'),
        apiFetch('/master/analytic-accounts')
      ]);
      setEntries(entriesData || []);
      setJournals(journalsData || []);
      setAccounts(accountsData || []);
      setContacts(contactsData || []);
      setAnalyticAccounts(analyticData || []);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEntries = entries.filter(e => {
    const search = searchTerm.toLowerCase();
    const refMatch = e.reference?.toLowerCase().includes(search);
    const idMatch = e.id?.toLowerCase().includes(search);
    const journalMatch = e.journal?.name?.toLowerCase().includes(search);
    
    return refMatch || idMatch || journalMatch;
  });

  const totalDebit = lines.reduce((acc, line) => acc + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((acc, line) => acc + (Number(line.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleCreate = async (postImmediately: boolean = false) => {
    if (!isBalanced) return;
    if (!journalId) {
      setApiError("Please select a journal");
      return;
    }
    
    // Filter out completely empty lines
    const validLines = lines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0));
    
    if (validLines.length < 2) {
      setApiError("A journal entry must have at least two valid lines");
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      
      const payload = {
        date,
        reference,
        journalId,
        lines: validLines.map(l => ({
          accountId: l.accountId,
          description: l.description,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          contactId: l.contactId || null,
          analyticAccountId: l.analyticAccountId || null
        }))
      };

      const newEntry = await apiFetch('/accounting/entries', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (postImmediately && newEntry && newEntry.id) {
        await apiFetch(`/accounting/entries/${newEntry.id}/post`, {
          method: 'POST'
        });
      }
      
      await fetchData();
      
      // Reset form
      setJournalId("");
      setReference("");
      setLines([
        { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 }
      ]);
      setViewMode("list");
      
    } catch (err: any) {
      setApiError(err.message || "Failed to create journal entry");
    } finally {
      setLoading(false);
    }
  };

  const handlePostExisting = async (id: string) => {
    try {
      setLoading(true);
      await apiFetch(`/accounting/entries/${id}/post`, { method: 'POST' });
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to post entry");
    } finally {
      setLoading(false);
    }
  };

  const updateLine = (index: number, field: string, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { accountId: "", contactId: "", analyticAccountId: "", description: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto pb-12">
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
                  New Entry
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="gap-2 text-foreground font-semibold" onClick={() => handleCreate(false)} disabled={!isBalanced || loading}>
                    <Save className="h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => handleCreate(true)} disabled={!isBalanced || loading}>
                    <Send className="h-4 w-4" />
                    Save & Post
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-border text-muted-foreground" onClick={() => setViewMode("list")} disabled={loading}>
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
                    placeholder="Search reference or journal..."
                    className="pl-9 w-full md:w-[250px] bg-background h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              <Button size="sm" variant="outline" onClick={() => viewMode === "form" ? setViewMode("list") : navigate("/dashboard")} className="gap-2 border-border">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                Back
              </Button>
            </div>
          </div>

          {/* Form View */}
          {viewMode === "form" && (
            <div className="p-8">
              {apiError && (
                 <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-3 text-destructive">
                   <AlertCircle className="h-5 w-5" />
                   <div>
                     <h4 className="font-semibold text-sm">Error</h4>
                     <p className="text-xs mt-1">{apiError}</p>
                   </div>
                 </div>
              )}

              {!isBalanced && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-3 text-amber-700 dark:text-amber-400">
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
                    <label className="text-sm font-medium text-muted-foreground">Journal <span className="text-destructive">*</span></label>
                    <select 
                      value={journalId}
                      onChange={(e) => setJournalId(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="" disabled>Select Journal</option>
                      {journals.map(j => (
                        <option key={j.id} value={j.id}>{j.name} ({j.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <label className="text-sm font-medium text-muted-foreground">Reference</label>
                    <Input 
                      placeholder="e.g. INV/2026/001"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="bg-background border-border/80"
                    />
                  </div>
                </div>
              </div>

              {/* Journal Items Table */}
              <div className="border border-border/80 rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead>Account <span className="text-destructive">*</span></TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Analytic Account</TableHead>
                      <TableHead>Description</TableHead>
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
                            value={line.accountId}
                            onChange={(e) => updateLine(index, "accountId", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-foreground"
                          >
                            <option value="" disabled>Select Account</option>
                            {accounts.map(a => (
                               <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select 
                            value={line.contactId}
                            onChange={(e) => updateLine(index, "contactId", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-foreground"
                          >
                            <option value="">None</option>
                            {contacts.map(c => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select 
                            value={line.analyticAccountId}
                            onChange={(e) => updateLine(index, "analyticAccountId", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-foreground"
                          >
                            <option value="">None</option>
                            {analyticAccounts.map(c => (
                               <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={line.description || ""}
                            onChange={(e) => updateLine(index, "description", e.target.value)}
                            className="w-full bg-transparent border-border/50 h-8 text-sm"
                            placeholder="Line description"
                          />
                        </TableCell>
                        <TableCell className="text-right text-destructive font-medium">
                          <Input 
                            type="number" 
                            min="0"
                            value={line.debit || ""}
                            onChange={(e) => updateLine(index, "debit", Number(e.target.value))}
                            className="w-24 text-right ml-auto bg-transparent border-border/50 h-8"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="text-right text-primary font-medium">
                          <Input 
                            type="number" 
                            min="0"
                            value={line.credit || ""}
                            onChange={(e) => updateLine(index, "credit", Number(e.target.value))}
                            className="w-24 text-right ml-auto bg-transparent border-border/50 h-8"
                            placeholder="0"
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
                      <TableCell colSpan={4} className="text-right">Total:</TableCell>
                      <TableCell className={`text-right ${totalDebit !== totalCredit ? "text-amber-600" : ""}`}>
                        {totalDebit.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right ${totalDebit !== totalCredit ? "text-amber-600" : ""}`}>
                        {totalCredit.toLocaleString()}
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
                  <li><strong className="text-destructive">Analytic Account</strong> - Selection from Cost Centers/Projects</li>
                </ul>
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
                      <TableHead>Journal</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.length > 0 ? (
                      filteredEntries.map((entry) => {
                        const sumDebit = entry.lines?.reduce((acc: number, l: any) => acc + (l.debit || 0), 0) || 0;
                        const sumCredit = entry.lines?.reduce((acc: number, l: any) => acc + (l.credit || 0), 0) || 0;
                        return (
                          <TableRow key={entry.id} className="group">
                            <TableCell className="text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {entry.journal?.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {entry.reference || "N/A"}
                            </TableCell>
                            <TableCell className="font-medium text-destructive">
                              Rs. {sumDebit.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-primary font-medium">
                              Rs. {sumCredit.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={entry.status === "POSTED" ? "default" : "outline"} className={entry.status === "POSTED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20" : "text-blue-500 border-blue-200"}>
                                {entry.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               {entry.status === "DRAFT" && (
                                 <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                    onClick={() => handlePostExisting(entry.id)}
                                    disabled={loading}
                                 >
                                    <Send className="h-3 w-3 mr-1" />
                                    Post
                                 </Button>
                               )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          {loading ? "Loading entries..." : "No journal entries found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Placeholder */}
              <div className="p-4 border-t border-border/80 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{filteredEntries.length}</span> entries
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
