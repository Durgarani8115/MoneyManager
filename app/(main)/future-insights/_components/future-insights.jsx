"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronDown, EyeOff, LineChart, Repeat2, RotateCcw } from "lucide-react";
import { ActivityAccountFilter } from "@/components/activity-account-filter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultCategories } from "@/data/categories";
import { cn } from "@/lib/utils";

const periods = [
  { value: "week", label: "Next week" },
  { value: "month", label: "Next month" },
  { value: "year", label: "Next year" },
];

const forecastKinds = {
  scheduled: {
    label: "Scheduled",
    icon: CalendarDays,
    color: "text-emerald-700 dark:text-emerald-300",
    background: "bg-emerald-50 dark:bg-emerald-950/60",
    bar: "bg-emerald-500",
  },
  repeating: {
    label: "Repeat bills",
    itemLabel: "Repeat bill",
    icon: Repeat2,
    color: "text-violet-700 dark:text-violet-300",
    background: "bg-violet-50 dark:bg-violet-950/60",
    bar: "bg-violet-500",
  },
  estimate: {
    label: "Spending estimates",
    itemLabel: "Spending estimate",
    icon: LineChart,
    color: "text-amber-800 dark:text-amber-300",
    background: "bg-amber-50 dark:bg-amber-950/60",
    bar: "bg-amber-500",
  },
};

const categoryNames = new Map(defaultCategories.map((category) => [category.id, category.name]));
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const dates = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatRange(start, end) {
  return start === end ? dates.format(new Date(start)) : dates.formatRange(new Date(start), new Date(end));
}

function categoryName(category) {
  return categoryNames.get(category) || "Other expenses";
}

function itemTitle(item) {
  return item.kind === "estimate" ? categoryName(item.category) : item.description || categoryName(item.category);
}

function ForecastItem({ item, accountName, onExclude }) {
  const kind = forecastKinds[item.kind];
  const Icon = kind.icon;
  const title = itemTitle(item);
  const category = categoryName(item.category);
  const subtitle = [kind.itemLabel || kind.label, title.toLowerCase() !== category.toLowerCase() && category, accountName]
    .filter(Boolean)
    .join(" · ");
  const timing = item.date ? formatRange(item.date, item.endDate || item.date) : "Across the period";

  return (
    <li>
      <details className="group">
        <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3.5 outline-none hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.55fr)_minmax(6rem,auto)_auto] sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-3">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", kind.background, kind.color)}>
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block break-words text-sm font-semibold">{title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{subtitle}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground sm:hidden">{timing}</span>
            </span>
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">
            {timing}
            {item.occurrenceCount > 1 && <span className="mt-0.5 block">{item.occurrenceCount} payments</span>}
          </span>
          <span className="text-right text-sm font-semibold tabular-nums">{money.format(item.amount)}</span>
          <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-3 border-t bg-muted/25 px-4 py-4 sm:px-5">
          <div>
            <p className="text-sm font-medium">Why this appears</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
          </div>
          {item.evidence.length > 0 && (
            <ul aria-label="Supporting transactions" className="divide-y rounded-lg border bg-background px-3">
              {item.evidence.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-xs">
                  <span>
                    {entry.description || categoryName(item.category)}
                    <span className="ml-2 text-muted-foreground">{dates.format(new Date(entry.date))}</span>
                  </span>
                  <span className="ml-auto font-medium tabular-nums">{money.format(entry.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => onExclude(item.id)}>
            <EyeOff aria-hidden="true" /> Exclude from forecast
          </Button>
        </div>
      </details>
    </li>
  );
}

export function FutureInsights({ accounts, accountId = "all", period = "month", forecast }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [exclusions, setExclusions] = useState({});
  const { items, startDate, endDate, historyStartDate, historyEndDate, historyCount, hasLimitedHistory, previousPeriod } = forecast;
  const periodKey = startDate + "/" + endDate;
  const excludedIds = exclusions[periodKey] || [];
  const accountNames = new Map(accounts.map((account) => [account.id, account.name]));
  const categories = [...new Set(items.map((item) => item.category))]
    .sort((a, b) => categoryName(a).localeCompare(categoryName(b)));
  const category = categories.includes(selectedCategory) ? selectedCategory : "all";
  const matchingItems = items.filter((item) => category === "all" || item.category === category);
  const excludedItems = matchingItems.filter((item) => excludedIds.includes(item.id));
  const visibleItems = matchingItems.filter((item) => !excludedIds.includes(item.id));
  const totals = { scheduled: 0, repeating: 0, estimate: 0 };
  for (const item of visibleItems) totals[item.kind] += Math.round(item.amount * 100);
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0) / 100;
  const previousTotal = previousPeriod && (category === "all"
    ? previousPeriod.amount
    : previousPeriod.totalsByCategory[category] || 0);

  function choosePeriod(value) {
    if (period === value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "month") params.delete("period");
    else params.set("period", value);
    const query = params.toString();
    startTransition(() => router.push(query ? "/future-insights?" + query : "/future-insights", { scroll: false }));
  }

  function toggleExclusion(id, exclude) {
    setExclusions((current) => {
      const ids = current[periodKey] || [];
      const nextIds = exclude ? [...new Set([...ids, id])] : ids.filter((item) => item !== id);
      return { ...current, [periodKey]: nextIds };
    });
  }

  return (
    <div className="space-y-4" aria-busy={isPending}>
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border bg-card p-3 sm:p-4">
        <div className="space-y-1.5">
          <p id="forecast-period-label" className="text-xs font-medium text-muted-foreground">Forecast period</p>
          <div role="group" aria-labelledby="forecast-period-label" className="flex flex-wrap gap-0.5 rounded-lg bg-muted p-0.5">
            {periods.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={period === option.value}
                disabled={isPending}
                onClick={() => choosePeriod(option.value)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 sm:px-3 sm:text-sm",
                  period === option.value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {accounts.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Account</p>
              <ActivityAccountFilter accounts={accounts} accountId={accountId} className="w-40 sm:w-44" />
            </div>
          )}
          {categories.length > 1 && (
            <div className="space-y-1.5">
              <label htmlFor="forecast-category" className="block text-xs font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setSelectedCategory}>
                <SelectTrigger id="forecast-category" className="w-40 sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((id) => <SelectItem key={id} value={id}>{categoryName(id)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="flex flex-col justify-between gap-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-xs sm:p-6 dark:bg-zinc-900">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <CalendarDays aria-hidden="true" className="size-4" /> {formatRange(startDate, endDate)}
            </p>
            <h2 className="mt-3 text-sm font-medium text-zinc-300">Expected expenses</h2>
            <p aria-live="polite" className="mt-1 break-words text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {items.length ? money.format(total) : "—"}
            </p>
          </div>
          {previousPeriod?.count > 0 && (
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-zinc-700 pt-3">
              <div>
                <p className="text-xs font-medium text-zinc-200">Last completed {period}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{formatRange(previousPeriod.startDate, previousPeriod.endDate)}</p>
              </div>
              <p className="text-sm font-medium tabular-nums">{money.format(previousTotal)} <span className="text-xs font-normal text-zinc-400">recorded</span></p>
            </div>
          )}
        </section>

        <section className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 shadow-xs sm:p-6">
          <div>
            <h2 className="text-sm font-semibold">Forecast mix</h2>
            {historyCount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {historyCount} recorded {historyCount === 1 ? "expense" : "expenses"} · {formatRange(historyStartDate, historyEndDate)}
              </p>
            )}
          </div>
          <div>
            <div aria-hidden="true" className="mb-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted">
              {Object.entries(forecastKinds).map(([key, kind]) => totals[key] > 0 && (
                <div key={key} className={kind.bar} style={{ flexGrow: totals[key], flexBasis: 0 }} />
              ))}
            </div>
            <dl className="grid gap-2 text-xs sm:grid-cols-3">
              {Object.entries(forecastKinds).map(([key, kind]) => (
                <div key={key} className="flex items-center justify-between gap-2 sm:block">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", kind.bar)} />
                    {kind.label}
                  </dt>
                  <dd className="font-semibold tabular-nums sm:mt-1">{money.format(totals[key] / 100)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border bg-card shadow-xs" aria-labelledby="forecast-items-heading">
        <div className="border-b px-4 py-3.5 sm:px-5">
          <h2 id="forecast-items-heading" className="text-sm font-semibold">Forecast items</h2>
          {hasLimitedHistory && <p className="mt-1 text-xs text-muted-foreground">Limited history for this forecast. More recorded expenses can improve coverage.</p>}
        </div>
        {visibleItems.length ? (
          <>
            <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1fr)_minmax(8rem,0.55fr)_minmax(6rem,auto)_1rem] gap-3 border-b bg-muted/35 px-5 py-2 text-xs text-muted-foreground sm:grid">
              <span>Expense</span><span>Expected timing</span><span className="text-right">Amount</span>
            </div>
            <ul className="divide-y">
              {visibleItems.map((item) => (
                <ForecastItem key={item.id} item={item} accountName={accountNames.get(item.accountId)} onExclude={(id) => toggleExclusion(id, true)} />
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <span className="mb-3 grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
              <LineChart aria-hidden="true" className="size-5" />
            </span>
            <p className="text-sm font-semibold">{excludedItems.length ? "All matching items excluded" : "No forecast items for this period"}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {excludedItems.length
                ? "Restore an item below to include it in the total."
                : accounts.length
                  ? "Record expenses or set up recurring transactions to build your forecast."
                  : "Add an account to start recording expenses."}
            </p>
            {!excludedItems.length && (
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={accounts.length ? "/transaction/create" : "/accounts"}>
                  {accounts.length ? "New transaction" : "View accounts"}
                </Link>
              </Button>
            )}
          </div>
        )}
        {!!excludedItems.length && (
          <details className="group border-t bg-muted/25 px-4 py-3 sm:px-5">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <EyeOff aria-hidden="true" className="size-4 text-muted-foreground" />
              {excludedItems.length} excluded {excludedItems.length === 1 ? "item" : "items"}
              <ChevronDown aria-hidden="true" className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-2 divide-y">
              {excludedItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span>{itemTitle(item)} <span className="text-xs text-muted-foreground">{money.format(item.amount)}</span></span>
                  <Button type="button" variant="ghost" size="sm" aria-label={"Restore " + itemTitle(item)} onClick={() => toggleExclusion(item.id, false)}>
                    <RotateCcw aria-hidden="true" /> Restore
                  </Button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}
