export const analyticsPeriods = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const dayMilliseconds = 86_400_000;
const calendarFormatter = new Intl.DateTimeFormat("en", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
const dayLabel = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});
const monthLabel = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "short" });

// Store local calendar dates at UTC midnight to make day arithmetic independent of the server timezone.
function calendarDay(instant) {
  const parts = Object.fromEntries(calendarFormatter.formatToParts(instant).map(({ type, value }) => [type, value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

function periodStart(today, period) {
  const day = new Date(today);
  if (period === "week") return today - ((day.getUTCDay() + 6) % 7) * dayMilliseconds;
  return Date.UTC(day.getUTCFullYear(), period === "year" ? 0 : day.getUTCMonth(), 1);
}

function transactionDay(value, now) {
  if (value == null) return NaN;
  const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const instant = new Date(value).getTime();
  if (!Number.isFinite(instant)) return NaN;
  if (dateOnly) return new Date(instant).toISOString().slice(0, 10) === value ? instant : NaN;
  return instant <= now ? calendarDay(instant) : NaN;
}

function monthStart(day) {
  const date = new Date(day);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function getAnalyticsPeriod(transactions = [], period = "month", now = new Date()) {
  const selectedPeriod = analyticsPeriods.find(({ value }) => value === period)?.value ?? "month";
  const nowInstant = new Date(now).getTime();
  const today = calendarDay(nowInstant);
  const start = periodStart(today, selectedPeriod);
  const filteredTransactions = [];
  const buckets = new Map();

  for (const transaction of transactions) {
    const day = transactionDay(transaction.date, nowInstant);
    if (!(day >= start && day <= today)) continue;
    if (transaction.type !== "INCOME" && transaction.type !== "EXPENSE") continue;
    const { amount } = transaction;
    if (typeof amount !== "number" && (typeof amount !== "string" || amount.trim() === "")) continue;
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isSafeInteger(cents)) continue;

    const normalizedAmount = cents / 100;
    filteredTransactions.push(normalizedAmount === amount ? transaction : { ...transaction, amount: normalizedAmount });
    const key = selectedPeriod === "year" ? monthStart(day) : day;
    const totals = buckets.get(key) ?? { income: 0, expense: 0 };
    if (transaction.type === "INCOME") totals.income += cents;
    else totals.expense += cents;
    buckets.set(key, totals);
  }

  const chartData = [];
  if (filteredTransactions.length) {
    const monthly = selectedPeriod === "year";
    const year = new Date(start).getUTCFullYear();
    const length = monthly ? new Date(today).getUTCMonth() + 1 : (today - start) / dayMilliseconds + 1;
    const formatter = monthly ? monthLabel : dayLabel;
    for (let index = 0; index < length; index++) {
      const key = monthly ? Date.UTC(year, index, 1) : start + index * dayMilliseconds;
      const totals = buckets.get(key);
      chartData.push({
        date: formatter.format(key),
        Income: (totals?.income ?? 0) / 100,
        Expense: (totals?.expense ?? 0) / 100,
      });
    }
  }

  return {
    period: selectedPeriod,
    label: `This ${selectedPeriod}`,
    transactions: filteredTransactions,
    chartData,
  };
}
