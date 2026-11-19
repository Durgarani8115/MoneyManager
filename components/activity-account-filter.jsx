"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function ActivityAccountFilter({
  accounts,
  accountId,
  className,
  queryParam = "account",
  label = "Filter by account",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function selectAccount(value) {
    const params = new URLSearchParams(searchParams);
    if (value === "all") params.delete(queryParam);
    else params.set(queryParam, value);

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <Select value={accountId} onValueChange={selectAccount} disabled={isPending || accounts.length === 0}>
      <SelectTrigger aria-label={label} className={cn("w-full bg-background sm:w-48", className)}>
        <Wallet className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
