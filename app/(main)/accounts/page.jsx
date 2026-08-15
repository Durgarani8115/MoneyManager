import React from "react";
import { getUserAccounts } from "@/actions/dashboard";
import AccountCard from "../dashboard/_component/account-card";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getUserAccounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title">
            Accounts & Cards
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your bank accounts, view balances, and create new financial accounts.
          </p>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:border-zinc-400 dark:hover:border-zinc-700 transition-all border-dashed border-zinc-300 dark:border-zinc-700 cursor-pointer min-h-[140px] flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-6">
              <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-2">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider">
                Add New Account
              </p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
}
