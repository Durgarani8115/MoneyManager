"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyticsPeriods } from "@/lib/analytics-period";

export function AnalyticsPeriodFilter({ period }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function selectPeriod(value) {
    const params = new URLSearchParams(searchParams);
    if (value === "month") params.delete("period");
    else params.set("period", value);

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/analytics?${query}` : "/analytics", { scroll: false });
    });
  }

  return (
    <Select value={period} onValueChange={selectPeriod} disabled={isPending}>
      <SelectTrigger aria-label="Filter by period" className="w-full bg-background sm:w-40">
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {analyticsPeriods.map(({ value, label }) => (
          <SelectItem key={value} value={value}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
