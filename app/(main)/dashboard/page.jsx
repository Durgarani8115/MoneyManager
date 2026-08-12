import CreateAccountDrawer from '@/components/create-account-drawer'
import { DashboardOverview } from './_component/transaction-overview'
import { Card, CardContent } from '@/components/ui/card'
import React, { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { getDashboardData, getUserAccounts } from '@/actions/dashboard'
import AccountCard from './_component/account-card'
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
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
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
        <Suspense fallback={
          <Card className="p-8 text-center text-xs text-zinc-400 border-zinc-200 dark:border-zinc-800">
            Loading analytics overview...
          </Card>
        }>
          <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
          />
        </Suspense>

        {/* Accounts Section Header */}
        <div className="pt-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">
            Your Accounts
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateAccountDrawer>
              <Card className="hover:border-zinc-400 dark:hover:border-zinc-700 transition-all border-dashed border-zinc-300 dark:border-zinc-700 cursor-pointer min-h-[140px] flex items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-6">
                  <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-2">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider">Add New Account</p>
                </CardContent>
              </Card>
            </CreateAccountDrawer>

            {accounts.length > 0 &&
              accounts.map((account) => {
                return <AccountCard key={account.id} account={account} />;
              })}
          </div>
        </div>
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
