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
  Trash2,
  LayoutGrid,
  List,
  Calendar
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PieChart, Pie, Cell } from "recharts";

// Mock Data
const initialBudgets = [
  { id: "1", name: "Q1 Marketing 2026", responsible: "Admin User", startDate: "2026-01-01", endDate: "2026-03-31", company: "Modura Inc", stage: "Approved" },
  { id: "2", name: "R&D Operations Q1", responsible: "Jane Doe", startDate: "2026-01-01", endDate: "2026-03-31", company: "Modura Inc", stage: "Confirmed" },
  { id: "3", name: "IT Hardware Upgrade", responsible: "John Smith", startDate: "2026-02-01", endDate: "2026-02-28", company: "Modura Inc", stage: "Draft" },
];

const budgetReportsData = [
  { id: "1", name: "January 2026", startDate: "01/01/2026", endDate: "31/01/2026", stage: "Confirm", achieved: 40000, balance: 60000 },
  { id: "2", name: "February 2026", startDate: "01/02/2026", endDate: "28/02/2026", stage: "Approved", achieved: 75000, balance: 25000 },
  { id: "3", name: "March 2026", startDate: "01/03/2026", endDate: "31/03/2026", stage: "Draft", achieved: 10000, balance: 90000 },
];

const standardStages = ["Draft", "Confirmed", "Approved", "Cancelled", "Done"];
const revisedStages = ["Draft", "Confirm", "Revised", "Cancelled", "Done"];

export default function Budgets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormView, setIsFormView] = useState(false);
  const [isRevisedView, setIsRevisedView] = useState(false);
  const [currentStage, setCurrentStage] = useState("Draft");
  const [reportViewMode, setReportViewMode] = useState<"list" | "kanban">("list");

  const filteredBudgets = initialBudgets.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStageClick = (stage: string) => {
    setCurrentStage(stage);
  };

  const handleReviseClick = () => {
    setIsRevisedView(true);
    setCurrentStage("Draft");
  };

  const handleBackToList = () => {
    setIsFormView(false);
    setIsRevisedView(false);
  };

  const stagesToUse = isRevisedView ? revisedStages : standardStages;

  if (isFormView) {
    return (
      <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isRevisedView ? "Budget (Revised)" : "Budget"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage budget details, timeline, and approvals</p>
          </div>
        </div>

        <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
          <CardContent className="p-0">
            {/* Action Bar & Stage Mapping */}
            <div className="p-4 border-b border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="font-medium bg-background">
                  New
                </Button>
                <Button 
                  size="sm" 
                  className="bg-[#5F6848] hover:bg-[#454D35] text-white font-medium shadow-sm"
                  onClick={() => setCurrentStage(isRevisedView ? "Confirm" : "Confirmed")}
                >
                  Confirm
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="font-medium bg-background" 
                  onClick={handleReviseClick}
                >
                  Revise
                </Button>
                <Button size="sm" variant="outline" className="font-medium bg-background">
                  Cancel
                </Button>
              </div>

              {/* Stage Pipeline */}
              <div className="flex items-center bg-background border border-border rounded-md overflow-hidden shadow-sm">
                {stagesToUse.map((stage, index) => {
                  const isActive = currentStage === stage;
                  const isPast = stagesToUse.indexOf(currentStage) > index;
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
                onClick={handleBackToList} 
                className="gap-2 mb-6 text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back to List
              </Button>

              <div className="max-w-4xl mx-auto">
                {/* Main Form Area */}
                <div className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <label htmlFor="budgetName" className="text-[15px] font-medium text-[#A65D52] w-32 shrink-0">Budget Name</label>
                        <Input 
                          id="budgetName"
                          placeholder="" 
                          className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 focus-visible:ring-0 shadow-none text-center text-foreground font-medium text-base flex-1"
                          defaultValue="January 2026"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="text-[15px] font-medium text-[#A65D52] w-32 shrink-0">Budget Period</label>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex-1 flex items-center">
                            <Input 
                              type="date" 
                              defaultValue="2026-01-01" 
                              className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 text-left text-muted-foreground focus-visible:ring-0 shadow-none w-full" 
                            />
                          </div>
                          <span className="text-[15px] font-medium text-[#A65D52]">To</span>
                          <div className="relative flex-1 flex items-center">
                            <Input 
                              type="date" 
                              defaultValue="2026-01-31" 
                              className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 text-left text-muted-foreground focus-visible:ring-0 shadow-none w-full" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <label className="text-[15px] font-medium text-[#A65D52] w-28 shrink-0">Revised With</label>
                        <Input 
                          type="text" 
                          defaultValue="Revised Budget" 
                          className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 text-center text-muted-foreground focus-visible:ring-0 shadow-none flex-1" 
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="text-[15px] font-medium text-[#A65D52] w-28 shrink-0">Responsible</label>
                        <Input 
                          type="text" 
                          defaultValue="" 
                          className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 text-center text-muted-foreground focus-visible:ring-0 shadow-none flex-1" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Budget Lines Sub-Table */}
                  <div className="space-y-4 pt-6 border-t border-border/80">
                    <div className="border border-border/80 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/10">
                            <TableHead className="font-semibold text-foreground">Analytic</TableHead>
                            <TableHead className="font-semibold text-foreground">Type</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">Committed Amount</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">Achieved Amount</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">Achieved %</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">Amount To Achieve</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-muted/5">
                            <TableCell className="font-medium text-muted-foreground">Furniture</TableCell>
                            <TableCell className="text-muted-foreground">Expense</TableCell>
                            <TableCell className="text-right text-muted-foreground">200000</TableCell>
                            <TableCell className="text-right text-muted-foreground">10000</TableCell>
                            <TableCell className="text-right text-muted-foreground">5%</TableCell>
                            <TableCell className="text-right text-muted-foreground">190000</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
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
        <Tabs defaultValue="budgets" className="flex flex-col h-full w-full">
          {/* Action Bar & Tabs Header */}
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-center gap-4">
              <TabsList className="bg-muted/50 border border-border/50">
                <TabsTrigger value="budgets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">Budgets</TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">Budget Reports</TabsTrigger>
              </TabsList>
              <div className="h-6 w-px bg-border/80 hidden sm:block"></div>
              <Button size="sm" onClick={() => setIsFormView(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4" />
                New Budget
              </Button>
            </div>
            <div className="relative max-w-sm w-full md:w-auto flex items-center gap-4">
              <div className="relative w-full md:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 w-full bg-background h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 bg-background border border-border rounded-md p-0.5">
                <Button 
                  variant={reportViewMode === "list" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setReportViewMode("list")}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={reportViewMode === "kanban" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setReportViewMode("kanban")}
                  title="Kanban View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="budgets" className="flex-1 m-0 flex flex-col h-full">
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
          </TabsContent>

          <TabsContent value="reports" className="flex-1 m-0 flex flex-col h-full">

          {reportViewMode === "list" ? (
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10 hover:bg-muted/10">
                    <TableHead>Budget</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Pie Chart</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetReportsData.length > 0 ? (
                    budgetReportsData.map((budget) => (
                      <TableRow key={budget.id} onClick={() => setIsFormView(true)} className="group cursor-pointer hover:bg-muted/5 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          {budget.name}
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
                              ${budget.stage === "Confirm" || budget.stage === "Confirmed" ? "border-amber-600 text-amber-600 bg-amber-600/10" : ""}
                              ${budget.stage === "Draft" ? "border-muted-foreground text-muted-foreground bg-muted/10" : ""}
                            `}
                          >
                            {budget.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex justify-end pr-8">
                          <div className="w-8 h-8 rounded-full shadow-sm border border-border bg-white p-0.5">
                            <PieChart width={26} height={26}>
                              <Pie
                                data={[
                                  { name: "Achieved", value: budget.achieved, fill: "#5F6848" }, // Deep Olive (Achieved)
                                  { name: "Balance", value: budget.balance, fill: "#B58A4A" }  // Warm Amber (Balance)
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={13}
                                dataKey="value"
                                stroke="none"
                              />
                            </PieChart>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No reports found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {budgetReportsData.length > 0 ? (
                  budgetReportsData.map((budget) => (
                    <Card key={budget.id} onClick={() => setIsFormView(true)} className="cursor-pointer hover:border-primary/40 transition-colors shadow-sm">
                      <CardContent className="p-5 flex flex-col gap-4">
                        <h3 className="font-semibold text-lg text-foreground truncate">{budget.name}</h3>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                           <div className="text-muted-foreground">Start Date</div>
                           <div className="text-right font-medium text-foreground">{budget.startDate}</div>
                           <div className="text-muted-foreground">End Date</div>
                           <div className="text-right font-medium text-foreground">{budget.endDate}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground">
                    No reports found.
                  </div>
                )}
              </div>
            </div>
          )}

          </TabsContent>

          {/* Pagination */}
          <div className="p-4 border-t border-border/80 flex items-center justify-between mt-auto">
            <div className="text-sm text-muted-foreground">
              Showing items
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
        </Tabs>
      </Card>
    </div>
  );
}
