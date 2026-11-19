import React, { Suspense } from "react";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import { getCurrentBudget, getCategoryBudgets } from "@/actions/budget";
import { ActivityAccountFilter } from "@/components/activity-account-filter";
import { ActivityNavigation, resolveActivityAccountId } from "@/components/activity-navigation";
import { DashboardOverview } from "../dashboard/_component/transaction-overview";
import { BudgetProgress } from "../dashboard/_component/budget-progress";
import { SpendingTrends } from "./_components/spending-trends";
import { CategoryBudgets } from "./_components/category-budgets";
import { DashboardOverviewSkeleton } from "@/components/skeletons";
import { unstable_rethrow } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ searchParams }) {
  try {
    const [accounts, params] = await Promise.all([getUserAccounts(), searchParams]);
    const accountId = resolveActivityAccountId(params?.account, accounts);
    const bankAccountId = accountId === "all" ? undefined : accountId;
    const accountName = accounts.find((account) => account.id === bankAccountId)?.name;
    const [transactions, budgetData, categoryBudgetsRes] = await Promise.all([
      getDashboardData(bankAccountId),
      accounts.length > 0 ? getCurrentBudget(bankAccountId) : null,
      getCategoryBudgets(bankAccountId),
    ]);

    const categoryBudgetsData = categoryBudgetsRes?.success ? categoryBudgetsRes.data : [];

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title">
              Analytics
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              See spending by category and track your income, expenses, and monthly budgets.
            </p>
          </div>
          <ActivityAccountFilter accounts={accounts} accountId={accountId} />
        </div>

        <ActivityNavigation current="analytics" accountId={accountId} />

        {accountName && (
          <p className="text-xs text-muted-foreground">
            Spending shown is for {accountName}. Monthly budget limits apply across all accounts.
          </p>
        )}

        {/* Monthly Budget Health */}
        {budgetData && (
          <BudgetProgress
            key={`monthly-budget-${accountId}`}
            initialBudget={budgetData.budget}
            currentExpenses={budgetData.currentExpenses}
            accountName={accountName ?? "All accounts"}
          />
        )}

        {/* 6-Month Spending & Income Trend Line Chart */}
        <SpendingTrends transactions={transactions} />

        {/* Category Budget Limits Grid */}
        <CategoryBudgets key={`category-budgets-${accountId}`} initialBudgets={categoryBudgetsData} />

        {/* Dynamic Period Charts — Expense Breakdown & Recent Transactions */}
        <Suspense fallback={<DashboardOverviewSkeleton />}>
          <DashboardOverview
            key={`overview-${accountId}`}
            accounts={accounts}
            transactions={transactions}
            showAccountFilter={false}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("AnalyticsPage failed:", error);
    return (
      <div className="p-6">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-zinc-500">
              Could not load analytics. Please refresh and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
