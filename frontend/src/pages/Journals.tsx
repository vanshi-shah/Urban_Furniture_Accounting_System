import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { PaginationControls } from "@/components/PaginationControls";
import { useAuth } from "@/context/AuthContext";

// Validation Schema
const journalSchema = z.object({
  name: z.string().min(1, { message: "Journal name is required" }),
  code: z.string().min(1, { message: "Journal code is required" }),
  type: z.enum(["BANK", "CASH", "SALES", "PURCHASES", "GENERAL"], { required_error: "Journal type is required" })
});

type JournalFormValues = z.infer<typeof journalSchema>;

export interface Journal {
  id: string;
  name: string;
  code: string;
  type: string;
  defaultAccount?: { name: string } | null;
}

export default function Journals() {
  const { user } = useAuth();
  const isAccountant = user?.role === "ACCOUNTANT";
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: journals,
    total,
    page,
    totalPages,
    setPage,
    refresh: refreshJournals,
  } = usePaginatedFetch<Journal>('/master/journals', 20);

  const fetchJournals = refreshJournals;

  // Local UI state (not part of pagination hook)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    // initial load handled by hook
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const onSubmit = async (data: JournalFormValues) => {
    setLoading(true);
    setApiError("");
    try {
      await apiFetch('/master/journals', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      await fetchJournals();
      setIsDialogOpen(false);
      reset();
    } catch (err: any) {
      setApiError(err.message || "Failed to save journal");
    } finally {
      setLoading(false);
    }
  };

  const filteredJournals = journals.filter(j =>
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="w-px h-6 bg-border mx-1" />

              {!isAccountant && (
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) reset(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Journal</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Journal Name</label>
                      <Input {...register("name")} placeholder="e.g. Sales Journal" />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Journal Code</label>
                      <Input {...register("code")} placeholder="e.g. SAL" />
                      {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Journal Type</label>
                      <Select onValueChange={(value) => setValue("type", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BANK">Bank</SelectItem>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="SALES">Sales</SelectItem>
                          <SelectItem value="PURCHASES">Purchases</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">Save Journal</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              )}
            </div>
            <div className="relative max-w-sm w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search journals..."
                className="pl-9 w-full md:w-[250px] bg-background h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableHead>Journal Name</TableHead>
                  <TableHead>Code</TableHead>
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
                        <Badge variant="outline" className="font-mono">
                          {journal.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {journal.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {journal.defaultAccount ? journal.defaultAccount.name : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No journals found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-border/80">
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={total}
              limit={20}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
