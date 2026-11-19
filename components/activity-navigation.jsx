import Link from "next/link";
import { cn } from "@/lib/utils";

const views = [
  { id: "transactions", label: "Transactions", description: "What happened?" },
  { id: "analytics", label: "Analytics", description: "Where is my money going?" },
  { id: "future-insights", label: "Future Insights", description: "What is likely to happen next?" },
];

export function resolveActivityAccountId(value, accounts) {
  return accounts.find((account) => account.id === value)?.id ?? "all";
}

export function ActivityNavigation({ current, accountId = "all" }) {
  const isTransactionsView = current === "transactions";
  const visibleViews = isTransactionsView ? views.filter(({ id }) => id !== "analytics") : views;

  return (
    <nav
      aria-label="Transaction activity"
      className={cn(
        "grid gap-1 rounded-xl border bg-muted/40 p-1",
        isTransactionsView ? "grid-cols-2" : "grid-cols-3"
      )}
    >
      {visibleViews.map(({ id, label, description }) => {
        const active = current === id;
        const href = accountId === "all"
          ? `/${id}`
          : { pathname: `/${id}`, query: { account: accountId } };

        return (
          <Link
            key={id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg border px-2 py-2.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-4 sm:text-left",
              active
                ? "border-border bg-background text-foreground shadow-xs"
                : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
            )}
          >
            <span className="block text-xs font-semibold sm:text-sm">{label}</span>
            <span className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{description}</span>
          </Link>
        );
      })}
    </nav>
  );
}
