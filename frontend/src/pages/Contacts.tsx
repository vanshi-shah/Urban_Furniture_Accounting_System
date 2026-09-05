import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  Plus,
  CheckCircle2,
  LayoutList,
  LayoutGrid,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  X,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api";
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch";
import { PaginationControls } from "@/components/PaginationControls";

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: "CUSTOMER" | "VENDOR";
}

const emptyContact: Contact = {
  id: "",
  name: "",
  email: "",
  phone: "",
  type: "CUSTOMER",
};

export default function Contacts() {
  const navigate = useNavigate();

  // View mode: "list" | "kanban" | "form"
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeContact, setActiveContact] = useState<Contact>(emptyContact);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    data: contacts,
    total,
    page,
    totalPages,
    loading: listLoading,
    setPage,
    refresh: refreshContacts,
  } = usePaginatedFetch<Contact>('/master/contacts', 20);

  const fetchContacts = refreshContacts;

  useEffect(() => {
    // initial load handled by hook
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenNew = () => {
    setActiveContact({
      ...emptyContact,
    });
    setFormErrors({});
    setApiError("");
    setSaveSuccess(false);
    setViewMode("form");
  };

  const handleOpenEdit = (contact: Contact) => {
    setActiveContact({ ...contact });
    setFormErrors({});
    setApiError("");
    setSaveSuccess(false);
    setViewMode("form");
  };

  const handleSaveContact = async () => {
    const errors: { [key: string]: string } = {};
    if (!activeContact.name.trim()) errors.name = "Contact Name is required";
    if (activeContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activeContact.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setApiError("");
    setLoading(true);

    try {
      if (activeContact.id) {
        await apiFetch(`/master/contacts/${activeContact.id}`, {
          method: 'PUT',
          body: JSON.stringify(activeContact)
        });
      } else {
        await apiFetch('/master/contacts', {
          method: 'POST',
          body: JSON.stringify(activeContact)
        });
      }
      
      await fetchContacts();

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setViewMode("list");
      }, 800);
    } catch (err: any) {
      setApiError(err.message || "Failed to save contact");
    } finally {
      setLoading(false);
    }
  };

  if (viewMode === "form") {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:opacity-95 text-xs h-9 px-4 font-semibold"
              onClick={handleOpenNew}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-border hover:bg-secondary text-xs h-9 px-4 font-semibold text-foreground"
              onClick={handleSaveContact}
              disabled={loading}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Confirm
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-9 px-4 border-border/80"
              onClick={() => setViewMode("list")}
              disabled={loading}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
          </div>
        </div>

        {apiError && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {apiError}
          </div>
        )}

        {saveSuccess && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold ml-2">
              Contact record successfully saved to master ledger!
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Contact Master Form View
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter master business entity profile.
                </p>
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                {activeContact.type === "CUSTOMER" ? "Customer Entity" : "Vendor / Supplier"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Contact Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Open Wood Atelier"
                    value={activeContact.name}
                    onChange={(e) => setActiveContact({ ...activeContact, name: e.target.value })}
                    className={`bg-background/60 border-border/80 h-10 ${
                      formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="openwood23@example.com"
                      value={activeContact.email || ""}
                      onChange={(e) => setActiveContact({ ...activeContact, email: e.target.value })}
                      className={`bg-background/60 border-border/80 h-10 ${
                        formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      Phone
                    </label>
                    <Input
                      placeholder="+91 9090090909"
                      value={activeContact.phone || ""}
                      onChange={(e) => setActiveContact({ ...activeContact, phone: e.target.value })}
                      className={`bg-background/60 border-border/80 h-10 ${
                        formErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-foreground">Entity Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveContact({ ...activeContact, type: "CUSTOMER" })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        activeContact.type === "CUSTOMER"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      Customer (Client)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveContact({ ...activeContact, type: "VENDOR" })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        activeContact.type === "VENDOR"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-border/80 bg-background/50 text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      Vendor (Supplier / Mill)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Contact Master
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer ateliers, architects, timber suppliers, and hardware vendors.
          </p>
        </div>
      </div>

      <Card className="border-border/80 shadow-xs bg-card">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-3 bg-secondary/30">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:opacity-95 text-xs h-9 px-4 font-semibold"
                onClick={handleOpenNew}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                New
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 px-3 border-border/80"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search contact name, email, phone..."
                className="pl-9 bg-background/80 h-9 text-xs border-border/80 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 bg-background/60 p-1 rounded-xl border border-border/80">
              <Button
                size="sm"
                variant={viewMode === "list" ? "secondary" : "ghost"}
                className={`h-7 px-2.5 text-xs rounded-lg ${
                  viewMode === "list" ? "bg-primary text-primary-foreground font-semibold shadow-xs" : "text-muted-foreground"
                }`}
                onClick={() => setViewMode("list")}
                title="Shift to List View"
              >
                <LayoutList className="h-3.5 w-3.5 mr-1" />
                List
              </Button>

              <Button
                size="sm"
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                className={`h-7 px-2.5 text-xs rounded-lg ${
                  viewMode === "kanban" ? "bg-primary text-primary-foreground font-semibold shadow-xs" : "text-muted-foreground"
                }`}
                onClick={() => setViewMode("kanban")}
                title="Shift to Kanban View"
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                Kanban
              </Button>
            </div>
          </div>

          {viewMode === "list" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="w-12 px-4 py-3 text-center">
                      <Checkbox
                        checked={
                          selectedIds.length === filteredContacts.length && filteredContacts.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        onClick={() => handleOpenEdit(contact)}
                        className="hover:bg-secondary/40 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.includes(contact.id)}
                            onCheckedChange={() => handleToggleSelect(contact.id)}
                            aria-label={`Select ${contact.name}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                          {contact.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {contact.email || "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {contact.phone || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${
                              contact.type === "CUSTOMER"
                                ? "border-primary/30 text-primary bg-primary/5"
                                : "border-accent/40 text-accent-foreground bg-accent/10"
                            }`}
                          >
                            {contact.type}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="h-32 text-center text-muted-foreground">
                        No contacts found. Click <strong>New</strong> to create a record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === "kanban" && (
            <div className="p-6">
              {filteredContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => handleOpenEdit(contact)}
                      className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
                    >
                      <Avatar className="h-14 w-14 rounded-2xl border border-border/70 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                        <AvatarFallback className="rounded-2xl text-sm font-bold bg-primary/15 text-primary">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {contact.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 font-medium shrink-0 ${
                              contact.type === "CUSTOMER"
                                ? "border-primary/30 text-primary bg-primary/5"
                                : "border-accent/40 text-accent-foreground bg-accent/10"
                            }`}
                          >
                            {contact.type}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {contact.email || "-"}
                        </p>

                        <p className="text-xs text-muted-foreground font-mono">
                          {contact.phone || "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground space-y-2">
                  <p>No contacts found.</p>
                  <Button size="sm" onClick={handleOpenNew} className="text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create New Contact
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="p-4 border-t border-border/80 bg-secondary/20">
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
