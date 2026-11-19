"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export function ExportCsvButton({ transactions = [], filename = "trakex_transactions.csv" }) {
  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("No transactions available to export");
      return;
    }

    try {
      // CSV Headers
      const headers = ["Date", "Description", "Category", "Type", "Amount (₹)", "Recurring", "Status"];

      // CSV Rows
      const rows = transactions.map((t) => [
        `"${format(new Date(t.date), "yyyy-MM-dd")}"`,
        `"${(t.description || "Untitled").replace(/"/g, '""')}"`,
        `"${(t.category || "Uncategorized").replace(/"/g, '""')}"`,
        `"${t.type}"`,
        `"${t.type === "EXPENSE" ? "-" : "+"}${parseFloat(t.amount).toFixed(2)}"`,
        `"${t.isRecurring ? "Yes" : "No"}"`,
        `"${t.status || "COMPLETED"}"`,
      ]);

      // Combine headers & rows
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      // Include a UTF-8 BOM so spreadsheet apps recognize the rupee symbol.
      const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${transactions.length} transactions to CSV`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to export CSV");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 px-3 text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
      onClick={handleExport}
    >
      <Download className="h-3.5 w-3.5 mr-1.5" />
      Export CSV
    </Button>
  );
}

export default ExportCsvButton;
