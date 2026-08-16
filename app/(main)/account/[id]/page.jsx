import { Suspense } from "react";
import { getAccountWithTransaction } from "@/actions/accounts";
import Link from "next/link";
import TransactionTable from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-char";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function ChartSkeleton() {
  return (
    <div className="space-y-3 p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default async function AccountPage({ params }) {
  const { id } = await params;

  let accountData;
  try {
    accountData = await getAccountWithTransaction(id);
  } catch (err) {
    notFound();
  }

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Link
          href="/accounts"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Accounts & Cards
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-900 dark:text-zinc-100 font-medium capitalize">
          {account.name}
        </span>
      </nav>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight gradient-title capitalize">
              {account.name}
            </h1>
            {account.isDefault && (
              <Badge
                variant="outline"
                className="text-[10px] font-extrabold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
              >
                Default
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account ·{" "}
            {account._count.transactions} transaction
            {account._count.transactions !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Balance display */}
          <div className="text-right">
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
              ₹{parseFloat(account.balance).toFixed(2)}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Current Balance
            </p>
          </div>
          {/* Add Transaction button pre-filled for this account */}
          <Link href={`/transaction/create?bankAccountId=${id}`}>
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-medium shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Transaction Bar Chart ── */}
      <Suspense fallback={<ChartSkeleton />}>
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* ── Transactions Table ── */}
      <Suspense fallback={<TableSkeleton />}>
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
