import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowLeft, 
  Plus,
  CheckCircle2,
  LayoutGrid,
  List,
  Calendar,
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie } from "recharts";
import { budgetApi, apiFetch } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const standardStages = ["DRAFT", "CONFIRMED", "CANCELLED", "DONE"];
const revisedStages = ["DRAFT", "REVISED", "CANCELLED", "DONE"];

export default function Budgets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormView, setIsFormView] = useState(false);
  const [reportViewMode, setReportViewMode] = useState<"list" | "kanban">("list");
  const [activeTab, setActiveTab] = useState("budgets");
  
  const [budgets, setBudgets] = useState<any[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = useState<any[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "New Budget",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    responsible: "",
    revisedWith: "",
    lines: [] as any[]
  });

  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    loadBudgets();
    loadAnalyticAccounts();
  }, []);

  const loadBudgets = async () => {
    try {
      const data = await budgetApi.getBudgets();
      setBudgets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAnalyticAccounts = async () => {
    try {
      const res = await apiFetch('/master/analytic-accounts');
      if (res && res.data) {
        setAnalyticAccounts(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBudgets = budgets.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    setSelectedBudget(null);
    setFormData({
      name: "New Budget",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      responsible: "",
      revisedWith: "",
      lines: analyticAccounts.length > 0 ? [{ analyticAccountId: analyticAccounts[0].id, committedAmount: 0 }] : []
    });
    setIsFormView(true);
  };

  const handleSelectBudget = (b: any) => {
    setSelectedBudget(b);
    setFormData({
      name: b.name,
      startDate: b.startDate.split('T')[0],
      endDate: b.endDate.split('T')[0],
      responsible: b.responsible || "",
      revisedWith: b.revisedWith || "",
      lines: b.lines || []
    });
    setIsFormView(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedBudget) {
        await budgetApi.createBudget(formData);
      } else if (selectedBudget.status === 'REVISED') {
        await budgetApi.reviseBudget(selectedBudget.id, {
          revisedWith: formData.revisedWith,
          lines: formData.lines
        });
      }
      await loadBudgets();
      setIsFormView(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save budget");
    }
  };

  const handleConfirm = async () => {
    if (!selectedBudget) return;
    try {
      await budgetApi.confirmBudget(selectedBudget.id);
      await loadBudgets();
      setIsFormView(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviseClick = async () => {
    if (!selectedBudget) return;
    try {
      await budgetApi.reviseBudget(selectedBudget.id, { revisedWith: "Revised Budget", lines: formData.lines });
      await loadBudgets();
      setIsFormView(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async () => {
    if (!selectedBudget) return;
    try {
      await budgetApi.cancelBudget(selectedBudget.id);
      await loadBudgets();
      setIsFormView(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkDone = async (id: string, e: any) => {
    e.stopPropagation();
    try {
      const res: any = await budgetApi.completeBudget(id);
      setSummaryData(res.summary);
      await loadBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const currentStage = selectedBudget ? selectedBudget.status : "DRAFT";
  const stagesToUse = (selectedBudget?.status === 'REVISED' || selectedBudget?.revisedWith) ? revisedStages : standardStages;
  const isEditable = !selectedBudget || selectedBudget.status === 'DRAFT' || selectedBudget.status === 'REVISED';

  if (isFormView) {
    return (
      <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {selectedBudget?.status === 'REVISED' ? "Budget (Revised)" : "Budget"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage budget details, timeline, and approvals</p>
          </div>
        </div>

        <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
          <CardContent className="p-0">
            {/* Action Bar & Stage Mapping */}
            <div className="p-4 border-b border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {isEditable && (
                  <Button size="sm" variant="outline" className="font-medium bg-background" onClick={handleSave}>
                    Save
                  </Button>
                )}
                {selectedBudget && selectedBudget.status === 'DRAFT' && (
                  <Button 
                    size="sm" 
                    className="bg-[#5F6848] hover:bg-[#454D35] text-white font-medium shadow-sm"
                    onClick={handleConfirm}
                  >
                    Confirm
                  </Button>
                )}
                {selectedBudget && selectedBudget.status === 'CONFIRMED' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="font-medium bg-background" 
                    onClick={handleReviseClick}
                  >
                    Revise
                  </Button>
                )}
                {selectedBudget && ['DRAFT', 'CONFIRMED', 'REVISED'].includes(selectedBudget.status) && (
                  <Button size="sm" variant="outline" className="font-medium bg-background" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>

              {/* Stage Pipeline */}
              <div className="flex items-center bg-background border border-border rounded-md overflow-hidden shadow-sm">
                {stagesToUse.map((stage, index) => {
                  const isActive = currentStage === stage;
                  const isPast = stagesToUse.indexOf(currentStage) > index;
                  return (
                    <div
                      key={stage}
                      className={`
                        relative px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors
                        flex items-center gap-1.5
                        ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground bg-muted/20'}
                        ${index !== 0 ? 'border-l border-border' : ''}
                      `}
                    >
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {!isActive && isPast && <CheckCircle2 className="h-3.5 w-3.5 text-muted-green" />}
                      {stage}
                    </div>
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
                <div className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <label htmlFor="budgetName" className="text-[15px] font-medium text-[#A65D52] w-32 shrink-0">Budget Name</label>
                        <Input 
                          id="budgetName"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          disabled={!isEditable}
                          className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 focus-visible:ring-0 shadow-none text-center text-foreground font-medium text-base flex-1"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="text-[15px] font-medium text-[#A65D52] w-32 shrink-0">Budget Period</label>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex-1 flex items-center">
                            <Input 
                              type="date" 
                              value={formData.startDate}
                              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                              disabled={!isEditable}
                              className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 text-left text-muted-foreground focus-visible:ring-0 shadow-none w-full" 
                            />
                          </div>
                          <span className="text-[15px] font-medium text-[#A65D52]">To</span>
                          <div className="relative flex-1 flex items-center">
                            <Input 
                              type="date" 
                              value={formData.endDate}
                              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                              disabled={!isEditable}
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
                          value={formData.revisedWith}
                          onChange={(e) => setFormData({...formData, revisedWith: e.target.value})}
                          disabled={!isEditable}
                          className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 text-center text-muted-foreground focus-visible:ring-0 shadow-none flex-1" 
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="text-[15px] font-medium text-[#A65D52] w-28 shrink-0">Responsible</label>
                        <Input 
                          type="text" 
                          value={formData.responsible}
                          onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                          disabled={!isEditable}
                          className="bg-transparent border-b-2 border-t-0 border-x-0 border-muted-foreground/30 rounded-none h-8 p-0 text-center text-muted-foreground focus-visible:ring-0 shadow-none flex-1" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Budget Lines Sub-Table */}
                  <div className="space-y-4 pt-6 border-t border-border/80">
                    <div className="flex justify-between items-center">
                       <h3 className="text-lg font-semibold text-foreground">Budget Lines</h3>
                       {isEditable && (
                         <Button size="sm" variant="outline" onClick={() => setFormData({...formData, lines: [...formData.lines, { analyticAccountId: analyticAccounts[0]?.id, committedAmount: 0 }]})}>
                            <Plus className="h-4 w-4 mr-2" /> Add Line
                         </Button>
                       )}
                    </div>
                    <div className="border border-border/80 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/10">
                            <TableHead className="font-semibold text-foreground">Analytic Account</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">Committed Amount</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">Achieved Amount</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">Amount To Achieve</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.lines.map((line, idx) => {
                            const aa = analyticAccounts.find(a => a.id === line.analyticAccountId);
                            const toAchieve = line.committedAmount - (line.achievedAmount || 0);
                            return (
                              <TableRow key={idx} className="hover:bg-muted/5">
                                <TableCell className="font-medium">
                                  {isEditable ? (
                                    <select 
                                      className="w-full bg-transparent border rounded p-1"
                                      value={line.analyticAccountId}
                                      onChange={(e) => {
                                        const newLines = [...formData.lines];
                                        newLines[idx].analyticAccountId = e.target.value;
                                        setFormData({...formData, lines: newLines});
                                      }}
                                    >
                                      {analyticAccounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="text-muted-foreground">{line.analyticAccount?.name || aa?.name}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditable ? (
                                    <Input
                                      type="number"
                                      className="text-right h-8"
                                      value={line.committedAmount}
                                      onChange={(e) => {
                                        const newLines = [...formData.lines];
                                        newLines[idx].committedAmount = Number(e.target.value);
                                        setFormData({...formData, lines: newLines});
                                      }}
                                    />
                                  ) : (
                                    <span className="text-muted-foreground">{line.committedAmount}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{line.achievedAmount || 0}</TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  <span className={toAchieve < 0 ? "text-red-500 font-semibold" : ""}>{toAchieve}</span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {formData.lines.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-4">No lines added</TableCell>
                            </TableRow>
                          )}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full w-full">
          <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-center gap-4">
              <TabsList className="bg-muted/50 border border-border/50">
                <TabsTrigger value="budgets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">Budgets</TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">Budget Reports</TabsTrigger>
              </TabsList>
              <div className="h-6 w-px bg-border/80 hidden sm:block"></div>
              <Button size="sm" onClick={handleCreateNew} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
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
              {activeTab === "reports" && (
                <div className="flex items-center gap-1 bg-background border border-border rounded-md p-0.5">
                  <Button 
                    variant={reportViewMode === "list" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setReportViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={reportViewMode === "kanban" ? "secondary" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setReportViewMode("kanban")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="budgets" className="flex-1 m-0 flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10 hover:bg-muted/10">
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.length > 0 ? (
                    filteredBudgets.map((budget) => {
                      const isExpired = new Date(budget.endDate) < new Date() && budget.status !== 'DONE' && budget.status !== 'CANCELLED';
                      return (
                        <TableRow key={budget.id} onClick={() => handleSelectBudget(budget)} className="group cursor-pointer hover:bg-muted/5 transition-colors">
                          <TableCell className="font-medium text-foreground">
                            {budget.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {budget.responsible}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {budget.startDate.split('T')[0]}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {budget.endDate.split('T')[0]}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {budget.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isExpired && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-7 border-blue-500 text-blue-500 hover:bg-blue-50"
                                onClick={(e) => handleMarkDone(budget.id, e)}
                              >
                                Mark Done
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
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
                    <TableHead className="text-right">Over Budget Amt</TableHead>
                    <TableHead className="text-right">Pie Chart</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.length > 0 ? (
                    filteredBudgets.map((budget) => {
                      let totalCommitted = 0;
                      let totalAchieved = 0;
                      budget.lines.forEach((l: any) => {
                        totalCommitted += l.committedAmount;
                        totalAchieved += l.achievedAmount;
                      });
                      const overAmt = totalAchieved > totalCommitted ? (totalAchieved - totalCommitted) : 0;

                      return (
                        <TableRow key={budget.id} onClick={() => handleSelectBudget(budget)} className="group cursor-pointer hover:bg-muted/5 transition-colors">
                          <TableCell className="font-medium text-foreground">
                            {budget.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {budget.startDate.split('T')[0]}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {budget.endDate.split('T')[0]}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{budget.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             {overAmt > 0 ? (
                               <span className="text-red-500 font-semibold flex items-center justify-end gap-1">
                                 <AlertCircle className="h-4 w-4" /> {overAmt}
                               </span>
                             ) : <span className="text-muted-foreground">0</span>}
                          </TableCell>
                          <TableCell className="flex justify-end pr-8">
                            <div className="w-8 h-8 rounded-full shadow-sm border border-border bg-white p-0.5">
                              <PieChart width={26} height={26}>
                                <Pie
                                  data={[
                                    { name: "Achieved", value: totalAchieved, fill: "#5F6848" },
                                    { name: "Balance", value: Math.max(0, totalCommitted - totalAchieved), fill: "#B58A4A" }
                                  ]}
                                  cx="50%" cy="50%" innerRadius={0} outerRadius={13} dataKey="value" stroke="none"
                                />
                              </PieChart>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
                {filteredBudgets.length > 0 ? (
                  filteredBudgets.map((budget) => {
                    let totalCommitted = 0;
                    let totalAchieved = 0;
                    budget.lines.forEach((l: any) => {
                      totalCommitted += l.committedAmount;
                      totalAchieved += l.achievedAmount;
                    });
                    const overAmt = totalAchieved > totalCommitted ? (totalAchieved - totalCommitted) : 0;
                    
                    return (
                      <Card key={budget.id} onClick={() => handleSelectBudget(budget)} className="cursor-pointer hover:border-primary/40 transition-colors shadow-sm">
                        <CardContent className="p-5 flex flex-col gap-4">
                          <h3 className="font-semibold text-lg text-foreground truncate">{budget.name}</h3>
                          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                             <div className="text-muted-foreground">Start Date</div>
                             <div className="text-right font-medium text-foreground">{budget.startDate.split('T')[0]}</div>
                             <div className="text-muted-foreground">End Date</div>
                             <div className="text-right font-medium text-foreground">{budget.endDate.split('T')[0]}</div>
                             <div className="text-muted-foreground">Over Budget</div>
                             <div className={`text-right font-medium ${overAmt > 0 ? 'text-red-500' : 'text-foreground'}`}>{overAmt}</div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground">
                    No reports found.
                  </div>
                )}
              </div>
            </div>
          )}
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={!!summaryData} onOpenChange={() => setSummaryData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Budget Period Summary</DialogTitle>
            <DialogDescription>
              The budget period has concluded. Here is the summary.
            </DialogDescription>
          </DialogHeader>
          {summaryData && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Total Committed</span>
                <span className="font-medium">{summaryData.totalCommitted}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Total Achieved</span>
                <span className="font-medium">{summaryData.totalAchieved}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={summaryData.statusText.includes('Loss') ? 'destructive' : (summaryData.statusText.includes('Profit') ? 'default' : 'secondary')}>
                  {summaryData.statusText}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difference</span>
                <span className="font-semibold">{summaryData.difference}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSummaryData(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
