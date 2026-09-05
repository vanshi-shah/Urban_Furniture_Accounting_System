import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Building2,
  Trash2,
  Edit,
  Sparkles,
  Camera,
  X,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "CUSTOMER" | "VENDOR";
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  imageUrl?: string;
}

// Default initial master data matching diagram examples (Open Wood, Joey Wills, etc.)
const defaultContacts: Contact[] = [
  {
    id: "1",
    name: "Open Wood Atelier",
    email: "openwood23@example.com",
    phone: "+91 9090090909",
    type: "VENDOR",
    street: "Plot 42, Timber Yard Road",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    pincode: "560048",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Joey Wills Architecture",
    email: "joey.wills@example.com",
    phone: "+91 8080080808",
    type: "CUSTOMER",
    street: "18 Regency Crescent, 4th Floor",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400050",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Aura Luxury Residences",
    email: "procurement@auradesign.in",
    phone: "+91 9820011223",
    type: "CUSTOMER",
    street: "Sector 54, Golf Course Road",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    pincode: "122002",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Mysore Teak & Hardwoods",
    email: "sales@mysoreteak.com",
    phone: "+91 9448012345",
    type: "VENDOR",
    street: "Timber Depot, Industrial Area",
    city: "Mysuru",
    state: "Karnataka",
    country: "India",
    pincode: "570018",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

const emptyContact: Contact = {
  id: "",
  name: "",
  email: "",
  phone: "",
  type: "CUSTOMER",
  street: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  imageUrl: "",
};

export default function Contacts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // View mode: "list" | "kanban" | "form"
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeContact, setActiveContact] = useState<Contact>(emptyContact);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local fallback storage state for live instant CRUD
  const [localContacts, setLocalContacts] = useState<Contact[]>(defaultContacts);

  // Fetch contacts from backend
  const { data: contactsData } = useQuery<Contact[]>({
    queryKey: ["contacts-master"],
    queryFn: async () => {
      try {
        const res = await api.get("/master/contacts");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
        return localContacts;
      } catch {
        return localContacts;
      }
    },
  });

  const contactsList = contactsData || localContacts;

  // Filter contacts by search
  const filteredContacts = contactsList.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  // Handlers for List view selection
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

  // Open Form View in "New" (blank) mode
  const handleOpenNew = () => {
    setActiveContact({
      ...emptyContact,
      id: `cnt-${Date.now()}`,
    });
    setFormErrors({});
    setSaveSuccess(false);
    setViewMode("form");
  };

  // Open Form View with existing record details
  const handleOpenEdit = (contact: Contact) => {
    setActiveContact({ ...contact });
    setFormErrors({});
    setSaveSuccess(false);
    setViewMode("form");
  };

  // Validate and Save Contact (Form View)
  const handleSaveContact = async () => {
    const errors: { [key: string]: string } = {};
    if (!activeContact.name.trim()) errors.name = "Contact Name is required";
    if (!activeContact.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activeContact.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!activeContact.phone.trim()) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Attempt backend save or local fallback
    try {
      if (contactsList.some((c) => c.id === activeContact.id)) {
        await api.put(`/master/contacts/${activeContact.id}`, activeContact).catch(() => {});
        setLocalContacts((prev) =>
          prev.map((c) => (c.id === activeContact.id ? activeContact : c))
        );
      } else {
        await api.post("/master/contacts", activeContact).catch(() => {});
        setLocalContacts((prev) => [activeContact, ...prev]);
      }
    } catch {
      setLocalContacts((prev) => {
        const exists = prev.some((c) => c.id === activeContact.id);
        if (exists) return prev.map((c) => (c.id === activeContact.id ? activeContact : c));
        return [activeContact, ...prev];
      });
    }

    queryClient.invalidateQueries({ queryKey: ["contacts-master"] });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setViewMode("list");
    }, 800);
  };

  // Quick image file upload simulation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActiveContact((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // -------------------------------------------------------------
  // RENDER: CONTACT MASTER FORM VIEW
  // -------------------------------------------------------------
  if (viewMode === "form") {
    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Form View Top Action Bar matching wireframe */}
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
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold ml-2">
              Contact record successfully saved to master ledger!
            </AlertDescription>
          </Alert>
        )}

        {/* Master Form Card */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Contact Master Form View
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter master business entity profile, communication details, and billing address.
                </p>
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                {activeContact.type === "CUSTOMER" ? "Customer Entity" : "Vendor / Supplier"}
              </Badge>
            </div>

            {/* 2-Column Form Layout matching wireframe */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                {/* Contact Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Contact Name
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

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      Email (Unique Email)
                    </label>
                    <Input
                      type="email"
                      placeholder="openwood23@example.com"
                      value={activeContact.email}
                      onChange={(e) => setActiveContact({ ...activeContact, email: e.target.value })}
                      className={`bg-background/60 border-border/80 h-10 ${
                        formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      Phone
                    </label>
                    <Input
                      placeholder="+91 9090090909"
                      value={activeContact.phone}
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

                {/* Contact Type Toggle */}
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

                {/* Address Section */}
                <div className="pt-3 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Address Details
                  </div>

                  {/* Street */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Street</label>
                    <Input
                      placeholder="Street Address, Building, Suite"
                      value={activeContact.street || ""}
                      onChange={(e) => setActiveContact({ ...activeContact, street: e.target.value })}
                      className="bg-background/60 border-border/80 h-9 text-xs"
                    />
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">City</label>
                      <Input
                        placeholder="City"
                        value={activeContact.city || ""}
                        onChange={(e) => setActiveContact({ ...activeContact, city: e.target.value })}
                        className="bg-background/60 border-border/80 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">State</label>
                      <Input
                        placeholder="State / Province"
                        value={activeContact.state || ""}
                        onChange={(e) => setActiveContact({ ...activeContact, state: e.target.value })}
                        className="bg-background/60 border-border/80 h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Country & Pincode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Country</label>
                      <Input
                        placeholder="Country"
                        value={activeContact.country || "India"}
                        onChange={(e) => setActiveContact({ ...activeContact, country: e.target.value })}
                        className="bg-background/60 border-border/80 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">Pincode</label>
                      <Input
                        placeholder="Pincode / Zip Code"
                        value={activeContact.pincode || ""}
                        onChange={(e) => setActiveContact({ ...activeContact, pincode: e.target.value })}
                        className="bg-background/60 border-border/80 h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Upload Image Box matching wireframe */}
              <div className="flex flex-col items-center justify-start space-y-3">
                <label className="text-xs font-semibold text-foreground self-start">
                  Upload Image
                </label>
                <div className="relative w-full h-64 rounded-2xl border-2 border-dashed border-border/80 bg-secondary/30 flex flex-col items-center justify-center p-4 text-center group hover:border-primary/50 transition-colors">
                  {activeContact.imageUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <img
                        src={activeContact.imageUrl}
                        alt="Contact Avatar Preview"
                        className="h-32 w-32 object-cover rounded-2xl border border-border shadow-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:opacity-90"
                        onClick={() => setActiveContact({ ...activeContact, imageUrl: "" })}
                        title="Remove Image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[11px] text-muted-foreground mt-2">Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">Upload Contact Image</div>
                      <p className="text-[11px] text-muted-foreground">PNG, JPG or SVG up to 2MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: CONTACT LIST VIEW & KANBAN VIEW
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
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
          {/* Top Action & Search Bar matching wireframe */}
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-3 bg-secondary/30">
            {/* Left Actions: New, Back */}
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

            {/* Center: Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search contact name, email, phone, city..."
                className="pl-9 bg-background/80 h-9 text-xs border-border/80 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Right: View Toggle Buttons (List View & Kanban View) */}
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

          {/* ------------------------------------------------------------- */}
          {/* VIEW 1: CONTACT LIST VIEW (DEFAULT)                           */}
          {/* ------------------------------------------------------------- */}
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
                    <th className="w-16 px-4 py-3">Image</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">City / Address</th>
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
                        <td className="px-4 py-3">
                          <Avatar className="h-9 w-9 rounded-xl border border-border/60 shadow-2xs">
                            <AvatarImage src={contact.imageUrl} alt={contact.name} />
                            <AvatarFallback className="rounded-xl text-xs font-bold bg-primary/15 text-primary">
                              {contact.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                          {contact.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {contact.email}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {contact.phone}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {contact.city ? `${contact.city}, ${contact.state || contact.country}` : "—"}
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
                      <td colSpan={7} className="h-32 text-center text-muted-foreground">
                        No contacts found matching &quot;{searchTerm}&quot;. Click <strong>New</strong> to create a record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 2: CONTACT KANBAN VIEW                                   */}
          {/* ------------------------------------------------------------- */}
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
                      {/* Left: Contact Image / Avatar */}
                      <Avatar className="h-14 w-14 rounded-2xl border border-border/70 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                        <AvatarImage src={contact.imageUrl} alt={contact.name} />
                        <AvatarFallback className="rounded-2xl text-sm font-bold bg-primary/15 text-primary">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Right: Contact Details matching wireframe */}
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
                          {contact.email}
                        </p>

                        <p className="text-xs text-muted-foreground font-mono">
                          {contact.phone}
                        </p>

                        {contact.city && (
                          <p className="text-[11px] text-muted-foreground truncate pt-0.5">
                            📍 {contact.city}, {contact.state || contact.country}
                          </p>
                        )}
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

          {/* Bottom Bar: Record Count */}
          <div className="p-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground bg-secondary/20">
            <span>
              Showing <strong className="text-foreground">{filteredContacts.length}</strong> of {contactsList.length} contacts
            </span>
            <span className="text-[11px] text-muted-foreground">
              Click on any row or card to open Form View
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
