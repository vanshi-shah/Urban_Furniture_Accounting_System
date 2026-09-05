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
const initialAccounts = [
  { id: "1", name: "Bank A/C", type: "Asset" },
  { id: "2", name: "Purchase Expenses A/C", type: "Expense" },
  { id: "3", name: "Creditors A/C", type: "Liability" },
  { id: "4", name: "Debtors A/C", type: "Asset" },
  { id: "5", name: "Sales Revenue A/C", type: "Revenue" },
  { id: "6", name: "Cash A/C", type: "Asset" },
  { id: "7", name: "Other Expenses A/C", type: "Expense" },
  { id: "8", name: "Capital A/C", type: "Equity" },
];

export default function ChartOfAccounts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAccounts = initialAccounts.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Asset': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Liability': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Equity': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Revenue': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      case 'Expense': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
                placeholder="Search accounts..."
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
                  <TableHead className="w-[100px]">Account ID</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc, index) => (
                    <TableRow key={acc.id} className="group">
                      <TableCell className="font-mono text-muted-foreground">
                        {String(index + 1).padStart(4, '0')}
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
        </CardContent>
      </Card>
    </div>
  );
}
