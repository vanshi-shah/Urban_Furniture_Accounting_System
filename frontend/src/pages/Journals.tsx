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

  const filteredJournals = initialJournals.filter(j =>
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.type.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4" />
                New
              </Button>
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
                        <Badge variant="secondary" className="font-medium">
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
        </CardContent>
      </Card>
    </div>
  );
}
