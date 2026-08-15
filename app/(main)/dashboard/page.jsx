import { Card, CardContent } from '@/components/ui/card'
import React, { Suspense } from 'react'
import { DashboardOverviewSkeleton } from '@/components/skeletons'

import { DashboardOverview } from './_component/transaction-overview'
import { getDashboardData, getUserAccounts } from '@/actions/dashboard'
import { getCurrentBudget } from '@/actions/budget'
import { BudgetProgress } from './_component/budget-progress'
import { unstable_rethrow } from 'next/navigation'

export const dynamic = "force-dynamic";

async function DashboardPage() {
  try {
    const accounts = await getUserAccounts();
    const defaultAccount = accounts.find(account => account.isDefault);

    let budgetData = null;
    if (defaultAccount) {
      budgetData = await getCurrentBudget(defaultAccount.id);
    }

    const transactions = await getDashboardData();

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title">
              Financial Overview
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Monitor your accounts, monthly budget health, and recent transaction activities.
            </p>
          </div>
        </div>

        {/* Budget Progress Card */}
        {defaultAccount && (
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />
        )}

        {/* Overview Analytics Charts */}
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
