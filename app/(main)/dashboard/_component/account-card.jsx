"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { updateDefaultAccount } from "@/actions/accounts";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  // Radix Switch's onCheckedChange gives (checked) or (checked, event)
  const handleDefaultChange = async (checked, event) => {
    // stop Link navigation when toggling
    if (event?.stopPropagation) event.stopPropagation();

    // If this account is already default and user is trying to turn it off, block it
    if (isDefault && !checked) {
      toast.warning("You need at least 1 default account");
      return;
    }

    // Only handle when turning on (checked === true)
    if (!checked) return;

    try {
      const res = await updateDefaultFn(id);
      if (res?.success) {
        toast.success("Default account updated successfully");
      } else {
        toast.error(res?.error || "Failed to update default account");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update default account");
    }
  };

  return (
    <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-1 group relative overflow-hidden bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-zinc-100/50 dark:to-zinc-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Link href={`/account/${id}`} className="flex-1">
          <CardTitle className="text-sm font-semibold capitalize cursor-pointer text-zinc-900 dark:text-zinc-100 hover:text-zinc-600">
            {name}
          </CardTitle>
        </Link>
       <Switch
    checked={isDefault}
    onCheckedChange={handleDefaultChange}
    disabled={updateDefaultLoading}
  />
      </CardHeader>

      <Link href={`/account/${id}`} className="block">
        <CardContent>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">${parseFloat(balance).toFixed(2)}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter className="flex justify-between pb-4">
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full text-xs font-semibold transition-colors">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-full text-xs font-semibold transition-colors">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Expense</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}

export default AccountCard;
