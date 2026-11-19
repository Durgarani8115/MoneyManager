import React, { Suspense } from "react";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import { getCurrentBudget, getCategoryBudgets } from "@/actions/budget";
import { ActivityAccountFilter } from "@/components/activity-account-filter";
import { ActivityNavigation, resolveActivityAccountId } from "@/components/activity-navigation";
import { DashboardOverview } from "../dashboard/_component/transaction-overview";
import { BudgetProgress } from "../dashboard/_component/budget-progress";
import { AnalyticsPeriodFilter } from "./_components/analytics-period-filter";
import { SpendingTrends } from "./_components/spending-trends";
import { CategoryBudgets } from "./_components/category-budgets";
import { DashboardOverviewSkeleton } from "@/components/skeletons";
import { unstable_rethrow } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getAnalyticsPeriod } from "@/lib/analytics-period";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ searchParams }) {
  try {
    const [accounts, params] = await Promise.all([getUserAccounts(), searchParams]);
    const accountId = resolveActivityAccountId(params?.account, accounts);
    const bankAccountId = accountId === "all" ? undefined : accountId;
    const [transactions, budgetData, categoryBudgetsRes] = await Promise.all([
      getDashboardData(bankAccountId),
      accounts.length > 0 ? getCurrentBudget(bankAccountId) : null,
      getCategoryBudgets(bankAccountId),
    ]);

    const categoryBudgetsData = categoryBudgetsRes?.success ? categoryBudgetsRes.data : [];
    const analytics = getAnalyticsPeriod(transactions, params?.period);

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <header className="border-b border-zinc-200 pb-2 dark:border-zinc-800">
          <h1 className="gradient-title text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Analytics
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            See spending by category and track your income, expenses, and monthly budgets.
          </p>
        </header>

        <ActivityNavigation current="analytics" accountId={accountId} />

        {/* Monthly Budget Health */}
        {budgetData && (
          <BudgetProgress
            key={`monthly-budget-${accountId}`}
            initialBudget={budgetData.budget}
            currentExpenses={budgetData.currentExpenses}
            controls={<ActivityAccountFilter accounts={accounts} accountId={accountId} />}
          />
        )}

        <SpendingTrends
          chartData={analytics.chartData}
          periodLabel={analytics.label}
          controls={
            <>
              <ActivityAccountFilter accounts={accounts} accountId={accountId} />
              <AnalyticsPeriodFilter period={analytics.period} />
            </>
          }
        />

        {/* Category Budget Limits Grid */}
        <CategoryBudgets key={`category-budgets-${accountId}`} initialBudgets={categoryBudgetsData} />

        {/* Dynamic Period Charts — Expense Breakdown & Recent Transactions */}
        <Suspense fallback={<DashboardOverviewSkeleton />}>
          <DashboardOverview
            key={`overview-${accountId}`}
            accounts={accounts}
            transactions={analytics.transactions}
            showAccountFilter={false}
            periodLabel={analytics.label}
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
