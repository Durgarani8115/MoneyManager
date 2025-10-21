import { getAccountWithTransaction } from "@/actions/accounts";
import React, { Suspense } from "react";
import TransactionTable from "../_components/transaction-table"; // ✅ FIXED: default import (no curly braces)
import { BarLoader } from "react-spinners";
import { notFound, redirect } from "next/navigation";
import {AccountChart} from "../_components/account-char";
const AccountPage = async ({ params }) => {
  // Access params.id synchronously before awaiting other async operations
  const { id } = params;
  const accountData = await getAccountWithTransaction(id);

  if (accountData && accountData.unauthenticated) {
    // server-side redirect to sign-in
    redirect('/sign-in');
  }

  if (!accountData) {
    notFound();
  }

  // ✅ FIXED: should be 'transactions', not 'transaction'
  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-muted-foreground text-sm">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart section — you can add your chart here later */}
     <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
        <AccountChart transactions={transactions} />
      </Suspense>


      {/* ✅ Transaction Table */}
      <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountPage;
