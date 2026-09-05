import { useState } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus, 
  CheckCircle, 
  Archive, 
  Home 
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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

// Mock Data
const initialContacts = [
  {
    id: "1",
    name: "Open Wood",
    email: "openwood@gmail.com",
    phone: "+91 9319239102",
  },
  {
    id: "2",
    name: "Deep Woods",
    email: "deepwoods@gmail.com",
    phone: "+91 9319239104",
  }
];

export default function Contacts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const filteredContacts = initialContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cId => cId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* Header section with title and global actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Master</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customers and vendors</p>
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
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4" />
                New
              </Button>
              <Button variant="outline" size="sm" className="gap-2" disabled={selectedContacts.length === 0}>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Confirm
              </Button>
              <Button variant="outline" size="sm" className="gap-2" disabled={selectedContacts.length === 0}>
                <Archive className="h-4 w-4 text-muted-foreground" />
                Archive
              </Button>
            </div>
            <div className="relative max-w-sm w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search contacts..."
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
                  <TableHead className="w-[50px] text-center">
                    <Checkbox 
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0} 
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id} className="group">
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => toggleSelect(contact.id)}
                          aria-label={`Select ${contact.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar className="h-8 w-8 rounded-md border border-border/50">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}`} alt={contact.name} />
                          <AvatarFallback className="rounded-md text-xs">{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {contact.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {contact.phone}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No contacts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border/80 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredContacts.length}</span> contacts
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
