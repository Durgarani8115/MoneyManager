"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet } from "lucide-react";

export function AccountFilter({ accounts }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentBankAccountId = searchParams.get("bankAccountId") || (accounts.length > 0 ? accounts.find(a => a.isDefault)?.id || accounts[0].id : "");

  const handleSelect = (val) => {
    router.push(`/dashboard?bankAccountId=${val}`);
  };

  if (accounts.length === 0) return null;

  return (
    <Select value={currentBankAccountId} onValueChange={handleSelect}>
      <SelectTrigger className="w-[200px] h-8 text-xs border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-medium shadow-xs">
        <div className="flex items-center gap-1.5 truncate">
          <Wallet className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <SelectValue placeholder="Select Account" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {accounts.map(acc => (
          <SelectItem key={acc.id} value={acc.id} className="text-xs cursor-pointer">
            {acc.name} {acc.isDefault ? "(Default)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
