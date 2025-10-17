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
    <Card className="hover:shadow-md transition-shadow group relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Link href={`/account/${id}`} className="flex-1">
          <CardTitle className="text-sm font-medium capitalize cursor-pointer">
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
          <div className="text-2xl font-bold">${parseFloat(balance).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}

export default AccountCard;
