import React, { Suspense } from "react";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import { getCurrentBudget, getCategoryBudgets } from "@/actions/budget";
import { DashboardOverview } from "../dashboard/_component/transaction-overview";
import { BudgetProgress } from "../dashboard/_component/budget-progress";
import { SpendingTrends } from "./_components/spending-trends";
import { CategoryBudgets } from "./_components/category-budgets";
import { DashboardOverviewSkeleton } from "@/components/skeletons";
import { unstable_rethrow } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  try {
    const accounts = await getUserAccounts();
    const transactions = await getDashboardData();
    const defaultAccount = accounts.find((a) => a.isDefault);

    let budgetData = null;
    if (defaultAccount) {
      budgetData = await getCurrentBudget(defaultAccount.id);
    }

    const categoryBudgetsRes = await getCategoryBudgets();
    const categoryBudgetsData = categoryBudgetsRes?.success ? categoryBudgetsRes.data : [];

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title">
            Analytics & Budget
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Deep-dive into your spending patterns, 6-month trends, category limits, and budget performance.
          </p>
        </div>

        {/* Global Monthly Budget Health */}
        {defaultAccount && (
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />
        )}

        {/* 6-Month Spending & Income Trend Line Chart */}
        <SpendingTrends transactions={transactions || []} />

        {/* Category Budget Limits Grid */}
        <CategoryBudgets initialBudgets={categoryBudgetsData} />

        {/* Dynamic Period Charts — Expense Breakdown & Recent Transactions */}
        <Suspense fallback={<DashboardOverviewSkeleton />}>
          <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
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
