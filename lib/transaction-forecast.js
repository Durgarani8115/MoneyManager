const dayMilliseconds = 86_400_000;
const supportedPeriods = new Set(["week", "month", "year"]);
const intervalLabels = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};
const billCategories = new Set(["housing", "utilities", "insurance", "bills", "education", "entertainment"]);
const recurringIncomeCategories = new Set(["salary", "freelance", "investments", "business", "rental"]);

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function calendarDate(value, formatter) {
  if (value == null) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && isoDate(date) === value ? date : null;
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
}

function addDays(date, days) {
  return new Date(date.getTime() + days * dayMilliseconds);
}

function addMonths(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay)));
}

function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfWeek(date) {
  return addDays(date, -((date.getUTCDay() + 6) % 7));
}

function monthsBetween(first, second) {
  return (second.getUTCFullYear() - first.getUTCFullYear()) * 12 + second.getUTCMonth() - first.getUTCMonth();
}

function getWindows(today, period) {
  if (period === "week") {
    const currentStart = startOfWeek(today);
    return {
      start: addDays(currentStart, 7),
      end: addDays(currentStart, 14),
      historyStart: addDays(currentStart, -56),
      historyEnd: currentStart,
      previousStart: addDays(currentStart, -7),
      previousEnd: currentStart,
      minimumHistory: 4,
      bucket: startOfWeek,
      countBuckets: (first, second) => (second - first) / (dayMilliseconds * 7),
      bucketLabel: "week",
      forecastBuckets: 1,
    };
  }

  const currentMonth = startOfMonth(today);
  const year = period === "year";
  const currentStart = year ? new Date(Date.UTC(today.getUTCFullYear(), 0, 1)) : currentMonth;
  const months = year ? 12 : 1;
  return {
    start: addMonths(currentStart, months),
    end: addMonths(currentStart, months * 2),
    historyStart: addMonths(currentMonth, year ? -12 : -3),
    historyEnd: currentMonth,
    previousStart: addMonths(currentStart, -months),
    previousEnd: currentStart,
    minimumHistory: year ? 12 : 2,
    bucket: startOfMonth,
    countBuckets: monthsBetween,
    bucketLabel: "month",
    forecastBuckets: months,
  };
}

function addIntervals(date, interval, count) {
  if (interval === "DAILY") return addDays(date, count);
  if (interval === "WEEKLY") return addDays(date, count * 7);
  return addMonths(date, count * (interval === "YEARLY" ? 12 : 1));
}

function occurrencesInWindow(firstDue, interval, { start, end }) {
  const isShort = interval === "DAILY" || interval === "WEEKLY";
  const step = interval === "WEEKLY" ? 7 : 1;
  const difference = isShort
    ? (start - firstDue) / (dayMilliseconds * step)
    : monthsBetween(firstDue, start) / (interval === "YEARLY" ? 12 : 1);
  let index = Math.max(0, Math.floor(difference));
  let date = addIntervals(firstDue, interval, index);
  if (date < start) date = addIntervals(firstDue, interval, ++index);
  if (date >= end) return null;

  const first = date;
  let last = first;
  let count = 0;
  while (date < end) {
    last = date;
    count += 1;
    date = addIntervals(firstDue, interval, ++index);
  }
  return { first, last, count };
}

function merchantIdentity({ bankAccountId, type, category, description }) {
  const name = description.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  // Treat unlabelled salary on one account as a possible single source.
  if (!name && !(type === "INCOME" && category === "salary")) return null;
  return JSON.stringify([bankAccountId, type, category, name]);
}

function asEvidence(transaction) {
  return {
    id: transaction.id,
    date: isoDate(transaction.date),
    description: transaction.description,
    amount: transaction.cents / 100,
  };
}

function datedItem(kind, record, dates, cents, reason, evidence) {
  return {
    id: `${kind}:${record.id}`,
    kind,
    type: record.type,
    description: record.description || (record.type === "INCOME" ? "Recurring income" : "Recurring expense"),
    amount: cents / 100,
    accountId: record.bankAccountId,
    category: record.category,
    date: isoDate(dates.first),
    endDate: isoDate(dates.last),
    occurrenceCount: dates.count,
    reason,
    evidence,
  };
}

function inferRepeat(records, today) {
  const latest = records[0];
  const eligible = latest.type === "INCOME"
    ? recurringIncomeCategories.has(latest.category) || /\b(?:payroll|paycheck|salary|pension|retainer|dividend|rental income)\b/i.test(latest.description)
    : billCategories.has(latest.category) || /\b(?:subscription|membership|rent|renewal|premium|fee|internet)\b/i.test(latest.description);
  if (!eligible) return null;

  const rules = [
    { interval: "YEARLY", tolerance: 32, minimum: 2, grace: 45 },
    { interval: "MONTHLY", tolerance: 7, minimum: 2, grace: 12 },
    { interval: "WEEKLY", tolerance: 2, minimum: 3, grace: 4 },
  ];
  for (const { interval, tolerance, minimum, grace } of rules) {
    const sample = [latest];
    for (let index = 1; index < Math.min(6, records.length); index += 1) {
      const expected = addIntervals(records[index].date, interval, 1);
      const actual = records[index - 1].date;
      if (Math.abs(actual - expected) > tolerance * dayMilliseconds) break;
      sample.push(records[index]);
    }
    if (sample.length < minimum) continue;

    const next = addIntervals(latest.date, interval, 1);
    return { interval, next, sample, active: addDays(next, grace) >= today };
  }
  return null;
}

function estimateCategories(records, window, firstObservedByAccount, items) {
  const categoryGroups = new Map();
  for (const record of records) {
    const key = JSON.stringify([record.bankAccountId, record.category]);
    if (!categoryGroups.has(key)) categoryGroups.set(key, []);
    categoryGroups.get(key).push(record);
  }

  for (const [key, group] of categoryGroups) {
    // Exclude a single unusually large purchase when two other amounts establish a comparable baseline.
    const [largest, second, third] = [...group].sort((a, b) => b.cents - a.cents);
    const hasOutlier = Boolean(third && largest.cents >= 5 * second.cents && second.cents <= 2 * third.cents);
    const samples = hasOutlier ? group.filter((record) => record !== largest) : group;
    const totals = new Map();
    for (const record of samples) {
      const bucket = isoDate(window.bucket(record.date));
      totals.set(bucket, (totals.get(bucket) ?? 0) + record.cents);
    }
    if (totals.size < 2) continue;
    const { bankAccountId, category } = samples[0];
    const first = firstObservedByAccount.get(bankAccountId);
    const coverageStart = first < window.historyStart ? window.historyStart : window.bucket(first);
    const observedBuckets = window.countBuckets(coverageStart, window.historyEnd);
    const amounts = [...totals.values()].sort((a, b) => a - b);
    const typicalAmount = (amounts[Math.floor((amounts.length - 1) / 2)] + amounts[Math.floor(amounts.length / 2)]) / 2;
    const cents = Math.round(typicalAmount * (totals.size / observedBuckets) * window.forecastBuckets);
    if (cents <= 0) continue;

    const recent = [...samples].sort((a, b) => b.date - a.date);
    const coverage = `Typical spending for this category, recorded in ${totals.size} of ${observedBuckets} observed ${window.bucketLabel}s.`;
    items.push({
      id: `estimate:${key}`,
      kind: "estimate",
      type: "EXPENSE",
      description: "Variable spending",
      amount: cents / 100,
      accountId: bankAccountId,
      category,
      date: null,
      endDate: null,
      occurrenceCount: null,
      reason: hasOutlier ? `${coverage} One unusually large purchase was excluded.` : coverage,
      evidence: recent.slice(0, 3).map(asEvidence),
    });
  }
}

function rupeeTotals(entries) {
  return Object.fromEntries(Array.from(entries, ([key, cents]) => [key, cents / 100]));
}

function totalRupees(amounts) {
  return Array.from(amounts).reduce((total, cents) => total + cents, 0) / 100;
}

export function buildTransactionForecast({
  transactions = [],
  accountId = "all",
  period = "month",
  now = new Date(),
  timeZone = "Asia/Kolkata",
} = {}) {
  const selectedPeriod = supportedPeriods.has(period) ? period : "month";
  const formatter = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "numeric", day: "numeric" });
  const today = calendarDate(now, formatter);
  if (!today) throw new RangeError("Forecast date is invalid");
  const window = getWindows(today, selectedPeriod);
  const items = [];
  const history = [];
  const scheduledIdentities = new Set();
  const firstObservedByAccount = new Map();
  const previousTotals = { EXPENSE: new Map(), INCOME: new Map() };
  const historyBuckets = { EXPENSE: new Set(), INCOME: new Set() };
  const historyCount = { EXPENSE: 0, INCOME: 0 };
  const previousCount = { EXPENSE: 0, INCOME: 0 };

  for (const transaction of transactions) {
    const { type } = transaction;
    if (type !== "EXPENSE" && type !== "INCOME") continue;
    if (transaction.status && transaction.status !== "COMPLETED") continue;
    if (accountId !== "all" && transaction.bankAccountId !== accountId) continue;

    const date = calendarDate(transaction.date, formatter);
    const cents = Math.round(Number(transaction.amount) * 100);
    if (!date || date > today || !Number.isSafeInteger(cents) || cents <= 0) continue;

    const record = {
      id: transaction.id,
      type,
      date,
      cents,
      description: transaction.description?.trim() || "",
      bankAccountId: transaction.bankAccountId,
      category: transaction.category,
    };
    if (type === "EXPENSE") {
      const first = firstObservedByAccount.get(record.bankAccountId);
      if (!first || date < first) firstObservedByAccount.set(record.bankAccountId, date);
    }
    if (date >= window.historyStart && date < window.historyEnd) {
      historyCount[type] += 1;
      historyBuckets[type].add(isoDate(window.bucket(date)));
    }
    if (date >= window.previousStart && date < window.previousEnd) {
      previousCount[type] += 1;
      const categories = previousTotals[type];
      categories.set(record.category, (categories.get(record.category) ?? 0) + cents);
    }

    if (!transaction.isRecurring) {
      if (!/\s\(auto\)$/i.test(record.description)) history.push(record);
      continue;
    }

    const interval = transaction.recurringInterval;
    if (!Object.hasOwn(intervalLabels, interval)) continue;
    const identity = merchantIdentity(record);
    if (identity) scheduledIdentities.add(identity);
    const firstDue = calendarDate(transaction.nextRecurringDate, formatter) ?? addIntervals(date, interval, 1);
    const dates = occurrencesInWindow(firstDue, interval, window);
    if (!dates) continue;

    const reason = `Set to repeat ${intervalLabels[interval]} in Transactions.`;
    items.push(datedItem("scheduled", record, dates, record.cents * dates.count, reason, [asEvidence(record)]));
  }

  const merchantGroups = new Map();
  for (const record of history) {
    const identity = merchantIdentity(record);
    if (!identity || scheduledIdentities.has(identity)) continue;
    if (!merchantGroups.has(identity)) merchantGroups.set(identity, []);
    merchantGroups.get(identity).push(record);
  }

  const inferredIdentities = new Set();
  for (const [identity, records] of merchantGroups) {
    records.sort((a, b) => b.date - a.date);
    const repeat = inferRepeat(records, today);
    if (!repeat) continue;
    inferredIdentities.add(identity);
    if (!repeat.active) continue;

    const dates = occurrencesInWindow(repeat.next, repeat.interval, window);
    if (!dates) continue;

    const income = records[0].type === "INCOME";
    const amounts = repeat.sample.map((record) => record.cents);
    const estimate = income
      ? amounts.sort((a, b) => a - b)[Math.floor((amounts.length - 1) / 2)]
      : Math.round(amounts.reduce((sum, cents) => sum + cents, 0) / amounts.length);
    const reason = `${repeat.sample.length} similar ${intervalLabels[repeat.interval]} ${income ? "deposits" : "payments"} in your transaction history.`;
    items.push(datedItem("repeating", records[0], dates, estimate * dates.count, reason, repeat.sample.slice(0, 3).map(asEvidence)));
  }

  const variableExpenses = history.filter((record) => {
    if (record.type !== "EXPENSE" || record.date < window.historyStart || record.date >= window.historyEnd) return false;
    const identity = merchantIdentity(record);
    return !scheduledIdentities.has(identity) && !inferredIdentities.has(identity);
  });
  estimateCategories(variableExpenses, window, firstObservedByAccount, items);

  items.sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999") || b.amount - a.amount || a.id.localeCompare(b.id));
  const totalsCents = {
    EXPENSE: { scheduled: 0, repeating: 0, estimate: 0 },
    INCOME: { scheduled: 0, repeating: 0, estimate: 0 },
  };
  for (const item of items) totalsCents[item.type][item.kind] += Math.round(item.amount * 100);
  return {
    period: selectedPeriod,
    startDate: isoDate(window.start),
    endDate: isoDate(addDays(window.end, -1)),
    historyStartDate: isoDate(window.historyStart),
    historyEndDate: isoDate(addDays(window.historyEnd, -1)),
    historyCount: historyCount.EXPENSE,
    incomeHistoryCount: historyCount.INCOME,
    hasLimitedHistory: historyBuckets.EXPENSE.size < window.minimumHistory,
    hasLimitedIncomeHistory: historyBuckets.INCOME.size < window.minimumHistory,
    previousPeriod: {
      startDate: isoDate(window.previousStart),
      endDate: isoDate(addDays(window.previousEnd, -1)),
      amount: totalRupees(previousTotals.EXPENSE.values()),
      count: previousCount.EXPENSE,
      totalsByCategory: rupeeTotals(previousTotals.EXPENSE),
      incomeAmount: totalRupees(previousTotals.INCOME.values()),
      incomeCount: previousCount.INCOME,
      incomeTotalsByCategory: rupeeTotals(previousTotals.INCOME),
    },
    projectedTotal: totalRupees(Object.values(totalsCents.EXPENSE)),
    projectedIncome: totalRupees(Object.values(totalsCents.INCOME)),
    totals: rupeeTotals(Object.entries(totalsCents.EXPENSE)),
    incomeTotals: rupeeTotals(Object.entries(totalsCents.INCOME)),
    items,
  };
}
