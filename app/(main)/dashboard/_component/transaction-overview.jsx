"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLORS = [
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

const DATE_RANGES = {
  "7D":  { label: "Last 7 Days",    days: 7   },
  "1M":  { label: "Last Month",     days: 30  },
  "3M":  { label: "Last 3 Months",  days: 90  },
  "6M":  { label: "Last 6 Months",  days: 180 },
  "1Y":  { label: "Last Year",      days: 365 },
  "ALL": { label: "All Time",       days: null },
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl">
        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{payload[0].name}</p>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          ₹{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardOverview({ accounts, transactions, showAccountFilter = true, periodLabel }) {
  const [selectedBankAccountId, setSelectedBankAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const [dateRange, setDateRange] = useState("1M");

  // Compute date filter bounds
  const dateFilteredTransactions = useMemo(() => {
    if (periodLabel) return transactions;

    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));
    const endDate = endOfDay(now);
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= startDate && d <= endDate;
    });
  }, [transactions, dateRange, periodLabel]);

  // Filter by selected account for recent transactions panel
  const accountTransactions = useMemo(
    () => showAccountFilter
      ? dateFilteredTransactions.filter((t) => t.bankAccountId === selectedBankAccountId)
      : dateFilteredTransactions,
    [dateFilteredTransactions, selectedBankAccountId, showAccountFilter]
  );

  // Recent 5 for this account in the chosen date range
  const recentTransactions = [...accountTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Expense breakdown (all accounts, chosen date range)
  const expensesByCategory = useMemo(() => {
    return dateFilteredTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
  }, [dateFilteredTransactions]);

  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Summary totals for the period
  const totalIncome = useMemo(
    () => dateFilteredTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
    [dateFilteredTransactions]
  );
  const totalExpense = useMemo(
    () => dateFilteredTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
    [dateFilteredTransactions]
  );

  return (
    <div className="space-y-4">
      {/* ── Period Selector + Summary Totals ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Income</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +₹{totalIncome.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Expenses</p>
            <p className="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">
              -₹{totalExpense.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Net</p>
            <p className={cn(
              "text-lg font-black tracking-tight",
              totalIncome - totalExpense >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
            )}>
              {totalIncome - totalExpense >= 0 ? "+" : ""}${(totalIncome - totalExpense).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Date Range Picker */}
        {!periodLabel && (
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] border-zinc-300 dark:border-zinc-700 text-sm">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Transactions
            </CardTitle>
            {showAccountFilter && (
              <Select value={selectedBankAccountId} onValueChange={setSelectedBankAccountId}>
                <SelectTrigger className="w-[140px] text-xs">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Receipt className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">No transactions in this period</p>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          transaction.type === "EXPENSE"
                            ? "bg-rose-100/50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"
                            : "bg-emerald-100/50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
                        )}
                      >
                        {transaction.type === "EXPENSE" ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                          {transaction.description || "Untitled Transaction"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), "PP")}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-sm font-bold tracking-tight",
                        transaction.type === "EXPENSE" ? "text-rose-500" : "text-emerald-500"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? "-" : "+"}$
                      {transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Expense Breakdown
              <span className="ml-2 text-xs text-zinc-400 font-normal">
                ({periodLabel ?? DATE_RANGES[dateRange].label})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-5">
            {pieChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <Receipt className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">No expenses in this period</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
