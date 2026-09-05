import { useState } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  FileEdit,
  Save,
  Trash2
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock Data
const initialBudgets = [
  { id: "1", name: "Q1 Marketing 2026", responsible: "Admin User", startDate: "2026-01-01", endDate: "2026-03-31", company: "Modura Inc", stage: "Approved" },
  { id: "2", name: "R&D Operations Q1", responsible: "Jane Doe", startDate: "2026-01-01", endDate: "2026-03-31", company: "Modura Inc", stage: "Confirmed" },
  { id: "3", name: "IT Hardware Upgrade", responsible: "John Smith", startDate: "2026-02-01", endDate: "2026-02-28", company: "Modura Inc", stage: "Draft" },
];

const stages = ["Draft", "Confirmed", "Approved", "Cancelled", "Done"];

export default function Budgets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormView, setIsFormView] = useState(false);
  const [currentStage, setCurrentStage] = useState("Draft");

  const filteredBudgets = initialBudgets.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStageClick = (stage: string) => {
    // Basic logic for stage progression
    setCurrentStage(stage);
  };

  if (isFormView) {
    return (
      <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Budget</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage budget details, timeline, and approvals</p>
          </div>
        </div>

        <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
          <CardContent className="p-0">
            {/* Action Bar & Stage Mapping */}
            <div className="p-4 border-b border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="gap-2 font-semibold">
                  <Save className="h-4 w-4" /> Save
                </Button>
                <Button size="sm" variant="outline" className="gap-2 font-semibold text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Discard
                </Button>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  Confirm
                </Button>
                <Button size="sm" variant="secondary" className="gap-2 font-semibold ml-2">
                  Approve
                </Button>
              </div>

              {/* Stage Pipeline */}
              <div className="flex items-center bg-background border border-border rounded-md overflow-hidden shadow-sm">
                {stages.map((stage, index) => {
                  const isActive = currentStage === stage;
                  const isPast = stages.indexOf(currentStage) > index;
                  return (
                    <button
                      key={stage}
                      onClick={() => handleStageClick(stage)}
                      className={`
                        relative px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors
                        flex items-center gap-1.5
                        ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}
                        ${index !== 0 ? 'border-l border-border' : ''}
                      `}
                    >
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {!isActive && isPast && <CheckCircle2 className="h-3.5 w-3.5 text-muted-green" />}
                      {stage}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsFormView(false)} 
                className="gap-2 mb-6 text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back to List
              </Button>

              <div className="max-w-4xl mx-auto">
                {/* Main Form Area */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="budgetName" className="text-xl font-bold text-foreground">Budget Name</label>
                      <Input 
                        id="budgetName"
                        placeholder="e.g. Q1 Marketing 2026" 
                        className="bg-background border-border text-lg font-semibold h-12"
                        defaultValue="Q1 Marketing 2026"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                      <div className="space-y-3">
                        <TooltipProvider>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Responsible</label>
                            <Tooltip>
                              <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">The user in charge of managing and approving this budget.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        <Select defaultValue="admin">
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select responsible user" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin User</SelectItem>
                            <SelectItem value="jane">Jane Doe</SelectItem>
                            <SelectItem value="john">John Smith</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <TooltipProvider>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
                            <Tooltip>
                              <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">The specific entity or organization this budget applies to.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        <Select defaultValue="modura">
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modura">Modura Inc</SelectItem>
                            <SelectItem value="subsidiary">Modura Retail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <TooltipProvider>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Start Date</label>
                            <Tooltip>
                              <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">When the budget period formally begins.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        <Input type="date" defaultValue="2026-01-01" className="bg-background" />
                      </div>

                      <div className="space-y-3">
                        <TooltipProvider>
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">End Date</label>
                            <Tooltip>
                              <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">When the budget period formally concludes.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        <Input type="date" defaultValue="2026-03-31" className="bg-background" />
                      </div>
                    </div>
                  </div>

                  {/* Budget Lines Sub-Table */}
                  <div className="space-y-4 pt-6 border-t border-border/50">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      Budget Lines
                    </h3>
                    <div className="border border-border/80 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="font-semibold text-muted-foreground">Analytic Account</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Planned Amount</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Practical Amount</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Theoretical Amount</TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-right">Achievement</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-muted/10">
                            <TableCell className="font-medium">Marketing / Advertising</TableCell>
                            <TableCell>₹1,50,000</TableCell>
                            <TableCell>₹1,20,000</TableCell>
                            <TableCell>₹1,25,000</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="text-muted-green border-muted-green/50 bg-muted-green/10">
                                80%
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-muted/10">
                            <TableCell className="font-medium">Marketing / Events</TableCell>
                            <TableCell>₹3,50,000</TableCell>
                            <TableCell>₹3,40,000</TableCell>
                            <TableCell>₹3,50,000</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="text-amber-600 border-amber-600/50 bg-amber-600/10">
                                97%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                      <Plus className="h-4 w-4 mr-2" /> Add a line
                    </Button>
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
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage corporate budgets and monitor spending limits.</p>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm bg-card h-full">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Action Bar */}
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsFormView(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4" />
                New Budget
              </Button>
            </div>
            <div className="relative max-w-sm w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search budgets..."
                className="pl-9 w-full md:w-[250px] bg-background h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableHead>Budget Name</TableHead>
                  <TableHead>Responsible</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.length > 0 ? (
                  filteredBudgets.map((budget) => (
                    <TableRow key={budget.id} onClick={() => setIsFormView(true)} className="group cursor-pointer hover:bg-muted/5 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        {budget.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {budget.responsible}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {budget.company}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {budget.startDate}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {budget.endDate}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`
                            ${budget.stage === "Approved" ? "border-muted-green text-muted-green bg-muted-green/10" : ""}
                            ${budget.stage === "Confirmed" ? "border-amber-600 text-amber-600 bg-amber-600/10" : ""}
                            ${budget.stage === "Draft" ? "border-muted-foreground text-muted-foreground bg-muted/10" : ""}
                          `}
                        >
                          {budget.stage}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No budgets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border/80 flex items-center justify-between mt-auto">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredBudgets.length}</span> budgets
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
