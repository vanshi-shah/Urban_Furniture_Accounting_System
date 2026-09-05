import React from "react";
import { Plus, Trash2, FileSpreadsheet, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExcelColumn {
  key: string;
  header: string;
  colLetter?: string;
  width?: string;
  type?: "text" | "number" | "currency" | "select" | "readonly";
  options?: { value: string; label: string; price?: number }[];
  placeholder?: string;
  align?: "left" | "center" | "right";
}

interface ExcelGridProps {
  columns: ExcelColumn[];
  data: any[];
  onChange: (newData: any[]) => void;
  onAddRow?: () => void;
  onRemoveRow?: (index: number) => void;
  title?: string;
  readOnly?: boolean;
  showExport?: boolean;
  exportFileName?: string;
  footerContent?: React.ReactNode;
}

export function ExcelGrid({
  columns,
  data,
  onChange,
  onAddRow,
  onRemoveRow,
  title = "Sheet1",
  readOnly = false,
  showExport = true,
  exportFileName = "Document",
  footerContent
}: ExcelGridProps) {
  const colLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

  const handleCellChange = (rowIndex: number, columnKey: string, value: any) => {
    const updated = [...data];
    updated[rowIndex] = { ...updated[rowIndex], [columnKey]: value };

    // Auto calculate if qty or unitPrice changed
    if (columnKey === "qty" || columnKey === "unitPrice") {
      const q = Number(columnKey === "qty" ? value : updated[rowIndex].qty) || 0;
      const p = Number(columnKey === "unitPrice" ? value : updated[rowIndex].unitPrice) || 0;
      updated[rowIndex].total = q * p;
    }

    // Auto set unit price if product selected
    if (columnKey === "productId") {
      const col = columns.find(c => c.key === "productId");
      const opt = col?.options?.find(o => o.value === value);
      if (opt && opt.price !== undefined) {
        updated[rowIndex].unitPrice = opt.price;
        const q = Number(updated[rowIndex].qty) || 1;
        updated[rowIndex].total = q * opt.price;
      }
    }

    onChange(updated);
  };

  const handleExportExcel = () => {
    const headers = columns.map(c => c.header).join(",");
    const rows = data.map(row => {
      return columns.map(col => {
        let val = row[col.key];
        if (col.type === "select" && col.options) {
          const matched = col.options.find(o => o.value === val);
          val = matched ? matched.label : val;
        }
        val = val !== undefined && val !== null ? String(val).replace(/,/g, " ") : "";
        return `"${val}"`;
      }).join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFileName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col border border-border/80 rounded-lg overflow-hidden bg-card shadow-sm excel-sheet-container">
      {/* Excel Sheet Ribbon Header */}
      <div className="bg-muted/40 px-4 py-2 border-b border-border/80 flex items-center justify-between gap-2 text-xs text-muted-foreground select-none print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{title}</span>
          </div>
          <span className="text-[11px] text-muted-foreground border-l border-border/80 pl-3">
            {data.length} row{data.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {showExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1 px-2.5 font-medium border-border/80 text-foreground hover:bg-muted"
                onClick={handleExportExcel}
                title="Export sheet to Excel (.csv)"
              >
                <Download className="h-3 w-3 text-emerald-600" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1 px-2.5 font-medium border-border/80 text-foreground hover:bg-muted"
                onClick={handleExportPDF}
                title="Export sheet to PDF"
              >
                <FileText className="h-3 w-3 text-rose-600" />
                PDF
              </Button>
            </>
          )}

          {!readOnly && onAddRow && (
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-[11px] gap-1 px-2.5 font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              onClick={onAddRow}
            >
              <Plus className="h-3 w-3" />
              Add Row
            </Button>
          )}
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-xs font-mono text-left select-text">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground border-b border-border/80">
              {/* Row Index Indicator Column */}
              <th className="w-10 px-2 py-1.5 text-center font-semibold border-r border-border/70 select-none bg-muted/70 text-[10px]">
                #
              </th>
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-semibold border-r border-border/70 text-foreground font-sans tracking-tight ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-muted-foreground/70 font-mono select-none">
                      {col.colLetter || colLetters[idx % colLetters.length]}
                    </span>
                    <span className="truncate">{col.header}</span>
                  </div>
                </th>
              ))}
              {!readOnly && onRemoveRow && (
                <th className="w-10 px-2 py-2 text-center border-r border-border/70 text-[10px] print:hidden">
                  Del
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border/50 hover:bg-muted/15 transition-colors group"
              >
                {/* Excel Row Number Index */}
                <td className="px-2 py-1 text-center text-muted-foreground/80 font-semibold border-r border-border/70 select-none bg-muted/30 text-[11px]">
                  {rowIndex + 1}
                </td>

                {columns.map((col) => {
                  const val = row[col.key] ?? "";
                  return (
                    <td
                      key={col.key}
                      className={`p-0 border-r border-border/70 relative ${
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      }`}
                    >
                      {readOnly || col.type === "readonly" ? (
                        <div
                          className={`px-3 py-1.5 font-mono text-xs truncate ${
                            col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                          }`}
                        >
                          {col.type === "currency"
                            ? typeof val === "number"
                              ? val.toLocaleString()
                              : val
                            : val}
                        </div>
                      ) : col.type === "select" ? (
                        <select
                          value={val}
                          onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                          className="w-full h-8 px-2 bg-transparent text-xs font-sans text-foreground border-none outline-none focus:bg-background focus:ring-1 focus:ring-primary focus:z-10 cursor-pointer"
                        >
                          <option value="" disabled>
                            {col.placeholder || "Select..."}
                          </option>
                          {col.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={col.type === "number" || col.type === "currency" ? "number" : "text"}
                          value={val}
                          placeholder={col.placeholder || "-"}
                          onChange={(e) =>
                            handleCellChange(
                              rowIndex,
                              col.key,
                              col.type === "number" || col.type === "currency"
                                ? Number(e.target.value)
                                : e.target.value
                            )
                          }
                          className={`w-full h-8 px-3 bg-transparent text-xs font-mono text-foreground border-none outline-none focus:bg-background focus:ring-1 focus:ring-primary focus:z-10 ${
                            col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                          }`}
                        />
                      )}
                    </td>
                  );
                })}

                {!readOnly && onRemoveRow && (
                  <td className="px-1 py-1 text-center border-r border-border/70 print:hidden">
                    <button
                      type="button"
                      disabled={data.length <= 1}
                      onClick={() => onRemoveRow(rowIndex)}
                      className="p-1 rounded text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Delete Row"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>

          {/* Grid Footer (Totals, Formula results) */}
          {footerContent && (
            <tfoot>
              <tr className="bg-muted/40 font-semibold border-t-2 border-border text-foreground">
                <td className="px-2 py-2 text-center bg-muted/60 select-none text-[10px]">Σ</td>
                {footerContent}
                {!readOnly && onRemoveRow && <td className="border-r border-border/70 print:hidden"></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Bottom Sheet Status Bar */}
      <div className="bg-muted/30 px-3 py-1.5 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground font-mono select-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] uppercase tracking-wider font-semibold">Live Formulas Active</span>
        </div>
        <div>
          <span>SUM(Qty * Unit Price) = Total</span>
        </div>
      </div>
    </div>
  );
}
