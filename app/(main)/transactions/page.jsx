import React from "react";
import { getDashboardData } from "@/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { unstable_rethrow } from "next/navigation";
import TransactionTable from "../account/_components/transaction-table";
import { ExportCsvButton } from "@/components/export-csv-button";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  try {
    const transactions = await getDashboardData();

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title">
              Transactions
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              All transactions across every account — search, filter, and export in one place.
            </p>
          </div>
          <ExportCsvButton transactions={transactions || []} />
        </div>

        {/* Global Transaction Table */}
        <TransactionTable transactions={transactions || []} />
      </div>
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("TransactionsPage failed:", error);
    return (
      <div className="p-6">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-zinc-500">
              Could not load transactions. Please refresh and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
