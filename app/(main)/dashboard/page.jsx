import React, { Suspense } from "react";
import Link from "next/link";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { BudgetProgress } from "./_component/budget-progress";
import { GoalsSummary } from "./_component/goals-summary";
import { AiInsightsCard } from "./_component/ai-insights-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { unstable_rethrow } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  Receipt,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CreateAccountDrawer from "@/components/create-account-drawer";

import { AccountFilter } from "./_component/account-filter";

export const dynamic = "force-dynamic";

// --- Helper to compute monthly stats from raw transactions ---
function computeStats(accounts, transactions, selectedBankAccountId) {
  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const selectedAccount = selectedBankAccountId
    ? accounts.find((a) => a.id === selectedBankAccountId)
    : null;

  const netWorth = selectedAccount ? parseFloat(selectedAccount.balance) : 0;

  const monthlyIncome = thisMonth
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = thisMonth
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const netSavings = monthlyIncome - monthlyExpense;

  return { netWorth, monthlyIncome, monthlyExpense, netSavings, selectedAccount };
}

async function DashboardPage({ searchParams }) {
  try {
    const accounts = await getUserAccounts();
    const defaultAccount = accounts.find((a) => a.isDefault);
    
    // Resolve searchParams (Next.js 15 requires awaiting searchParams)
    const searchParamsObj = await searchParams;
    let selectedBankAccountId = searchParamsObj?.bankAccountId || (defaultAccount ? defaultAccount.id : (accounts.length > 0 ? accounts[0].id : null));

    // Validate if the selected account actually exists
    if (selectedBankAccountId && !accounts.some((a) => a.id === selectedBankAccountId)) {
      selectedBankAccountId = defaultAccount ? defaultAccount.id : (accounts.length > 0 ? accounts[0].id : null);
    }

    const transactions = selectedBankAccountId ? await getDashboardData(selectedBankAccountId) : [];

    let budgetData = null;
    if (selectedBankAccountId) {
      budgetData = await getCurrentBudget(selectedBankAccountId);
    }

    const { netWorth, monthlyIncome, monthlyExpense, netSavings, selectedAccount } =
      computeStats(accounts, transactions, selectedBankAccountId);

    // Last 5 transactions for the selected account, sorted by date
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return (
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title">
              Dashboard
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Your financial snapshot — {selectedAccount ? selectedAccount.name : "net worth"}, monthly health, and goals.
            </p>
          </div>
          {accounts.length > 0 && <AccountFilter accounts={accounts} />}
        </div>

        {/* ── Quick Actions Bar ── */}
        <div className="flex flex-wrap gap-2">
          <Link href="/transaction/create">
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-medium shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Transaction
            </Button>
          </Link>
          <Link href="/goals">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
            >
              <Target className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              Financial Goals
            </Button>
          </Link>
          <Link href="/accounts">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Manage Accounts
            </Button>
          </Link>
          <CreateAccountDrawer>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Account
            </Button>
          </CreateAccountDrawer>
        </div>

        {/* ── Net Worth + Monthly Stats Cards ── */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Net Worth (Account Balance) */}
          <Card className="col-span-2 lg:col-span-1 border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/5 dark:from-zinc-100/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Account Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                ₹{netWorth.toFixed(2)}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {selectedAccount ? selectedAccount.name : "No account selected"}
              </p>
            </CardContent>
          </Card>

          {/* Monthly Income */}
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                +₹{monthlyIncome.toFixed(2)}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                This month
              </p>
            </CardContent>
          </Card>

          {/* Monthly Expense */}
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">
                -₹{monthlyExpense.toFixed(2)}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                This month
              </p>
            </CardContent>
          </Card>

          {/* Net Savings */}
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none",
                netSavings >= 0 ? "from-blue-500/5" : "from-amber-500/5"
              )}
            />
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Net Savings
              </CardTitle>
              {netSavings >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-blue-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-amber-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-black tracking-tighter",
                  netSavings >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-amber-600 dark:text-amber-400"
                )}
              >
                {netSavings >= 0 ? "+" : ""}₹{netSavings.toFixed(2)}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Goals Summary & Budget Health Row ── */}
        <div className="grid gap-6 md:grid-cols-2">
          {selectedAccount && (
            <BudgetProgress
              initialBudget={budgetData?.budget}
              currentExpenses={budgetData?.currentExpenses || 0}
              accountName={selectedAccount.name}
            />
          )}
          <GoalsSummary />
        </div>

        {/* ── AI Insights Card ── */}
        <AiInsightsCard />

        {/* ── Recent Activity (Selected Account) ── */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Recent Activity {selectedAccount ? `(${selectedAccount.name})` : ""}
              </CardTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Latest transactions for this account
              </p>
            </div>
            <Link href="/transaction/create">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Receipt className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">No transactions yet.</p>
                <Link href="/transaction/create" className="mt-2">
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    Create your first transaction
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentTransactions.map((transaction) => {
                  const account = accounts.find(
                    (a) => a.id === transaction.bankAccountId
                  );
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "p-2 rounded-full shrink-0",
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
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none truncate">
                            {transaction.description || "Untitled Transaction"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "PP")} ·{" "}
                            <span className="capitalize text-zinc-500">
                              {account?.name || "Unknown Account"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "text-sm font-bold tracking-tight shrink-0 ml-4",
                          transaction.type === "EXPENSE"
                            ? "text-rose-500"
                            : "text-emerald-500"
                        )}
                      >
                        {transaction.type === "EXPENSE" ? "-" : "+"}₹{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("DashboardPage failed:", error);
    return (
      <div className="p-6">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-zinc-500">
              We could not load your dashboard right now. Please refresh and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default DashboardPage;
