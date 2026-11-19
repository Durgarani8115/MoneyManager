const currencyNames = {
  INR: ["indian rupees", "indian rupee", "rupees", "rupee", "rs", "₹"],
  USD: ["us dollars", "us dollar", "american dollars", "american dollar", "dollars", "dollar", "us$", "$"],
  EUR: ["euros", "euro", "€"],
  GBP: ["british pounds", "pounds sterling", "pound sterling", "pounds", "pound", "£"],
  AUD: ["australian dollars", "australian dollar", "au$"],
  CAD: ["canadian dollars", "canadian dollar", "ca$"],
  NZD: ["new zealand dollars", "new zealand dollar", "nz$"],
  SGD: ["singapore dollars", "singapore dollar", "s$"],
  HKD: ["hong kong dollars", "hong kong dollar", "hk$"],
  AED: ["uae dirhams", "uae dirham", "dirhams", "dirham"],
  JPY: ["japanese yen", "yen", "jp¥"],
  CNY: ["chinese yuan", "yuan", "renminbi", "cn¥"],
  CHF: ["swiss francs", "swiss franc"],
  SAR: ["saudi riyals", "saudi riyal"],
};

const currencies = Object.entries(currencyNames)
  .flatMap(([code, names]) => [code.toLowerCase(), ...names].map((name) => [name, code]))
  .sort(([a], [b]) => b.length - a.length);

const smallNumbers = new Map(
  "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen"
    .split(" ")
    .map((word, value) => [word, value])
);
const tens = new Map(
  "twenty thirty forty fifty sixty seventy eighty ninety".split(" ").map((word, index) => [word, (index + 2) * 10])
);
const scales = new Map([
  ["thousand", 1_000],
  ["lakh", 100_000],
  ["lakhs", 100_000],
  ["million", 1_000_000],
  ["crore", 10_000_000],
  ["crores", 10_000_000],
  ["billion", 1_000_000_000],
]);

function parseBelowHundred(words) {
  const [first, second] = words;
  if (words.length === 1) return smallNumbers.get(first) ?? tens.get(first) ?? null;
  const unit = smallNumbers.get(second);
  if (words.length === 2 && tens.has(first) && unit > 0 && unit < 10) {
    return tens.get(first) + unit;
  }
  return null;
}

function parseNumberGroup(words) {
  if (words.length === 1 && /^\d{1,3}$/.test(words[0])) return Number(words[0]);
  if (words[1] !== "hundred") return parseBelowHundred(words);
  const units = words[0] === "a" ? 1 : smallNumbers.get(words[0]);
  if (!(units > 0 && units < 10)) return null;
  if (words.length === 2) return units * 100;
  const rest = parseNumberGroup(words.slice(words[2] === "and" ? 3 : 2));
  return rest !== null && rest < 100 ? units * 100 + rest : null;
}

function parseNumberWords(text) {
  const [whole, fraction, extra] = text.toLowerCase().split(/\s+point\s+/);
  if (extra !== undefined) return null;

  let decimals = "";
  if (fraction !== undefined) {
    const digits = fraction.split(/\s+/).map((digit) => {
      if (/^\d+$/.test(digit)) return digit;
      const value = smallNumbers.get(digit);
      return value >= 0 && value < 10 ? String(value) : "?";
    }).join("");
    if (!/^\d{1,2}$/.test(digits)) return null;
    decimals = "." + digits;
  }

  if (/^\d+$/.test(whole)) return whole + decimals;

  const words = whole.split(/[\s-]+/);
  let total = 0;
  let start = 0;
  let previousScale = Infinity;
  for (const [index, word] of words.entries()) {
    const scale = scales.get(word);
    if (!scale) continue;
    const group = words.slice(start + Number(start > 0 && words[start] === "and"), index);
    const value = group.length === 1 && group[0] === "a" ? 1 : parseNumberGroup(group);
    if (!(value > 0) || scale >= previousScale) return null;
    total += value * scale;
    previousScale = scale;
    start = index + 1;
  }

  if (start < words.length) {
    const rest = parseNumberGroup(words.slice(start + Number(start > 0 && words[start] === "and")));
    if (rest === null) return null;
    total += rest;
  }
  return String(total) + decimals;
}

function parseAmountText(text) {
  const digits = /^(?:(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d{1,2})?|\.\d{1,2})$/;
  const amount = digits.test(text) ? text.replaceAll(",", "").replace(/^\./, "0.") : parseNumberWords(text);
  return amount && Number.isFinite(Number(amount)) && Number(amount) > 0 ? amount : null;
}

function parseAmount(text) {
  const amount = parseAmountText(text);
  if (amount) return { amount, currency: "INR" };

  for (const [name, currency] of currencies) {
    const symbol = /[$€£₹¥]$/.test(name);
    const prefix = symbol ? name : name + " ";
    const suffix = symbol ? name : " " + name;
    const portion = text.startsWith(prefix) ? text.slice(prefix.length)
      : text.endsWith(suffix) ? text.slice(0, -suffix.length) : "";
    if (!portion) continue;
    const originalAmount = parseAmountText(portion.trim());
    // Longer matches keep named dollars separate from the generic dollar alias.
    if (originalAmount) return { amount: originalAmount, currency };
  }
  return null;
}

const categoryHints = {
  EXPENSE: {
    groceries: /\b(?:grocer(?:y|ies)|produce|vegetables)\b/i,
    food: /\b(?:lunch|dinner|breakfast|coffee|tea|meal|food|restaurant|snack)\b/i,
    transportation: /\b(?:fuel|petrol|gasoline|taxi|bus|train|parking|uber|transport)\b/i,
    housing: /\b(?:rent|mortgage|housing)\b/i,
    utilities: /\b(?:electricity|water|internet|utility|utilities)\b/i,
    healthcare: /\b(?:doctor|medical|medicine|pharmacy|healthcare)\b/i,
    shopping: /\b(?:clothing|clothes|electronics|shopping)\b/i,
    entertainment: /\b(?:movie|cinema|concert|streaming|entertainment)\b/i,
  },
  INCOME: {
    salary: /\b(?:salary|paycheck|wages|bonus)\b/i,
    freelance: /\bfreelanc(?:e|ing)\b/i,
    investments: /\b(?:interest|dividends?|investments?)\b/i,
    rental: /\b(?:rent|rental)\b/i,
  },
};

export function parseVoiceTransactionFallback(transcript) {
  if (typeof transcript !== "string") return null;
  const text = transcript.trim().replace(/[.!?]$/, "").replace(/\s+/g, " ").trim();
  const amountOnly = parseAmount(text.replace(/^amount:\s*/i, "").toLowerCase());
  if (amountOnly) {
    return { ...amountOnly, amountOnly: true, type: "EXPENSE", description: "", category: "other-expense" };
  }

  const transaction = text.match(/^(?:i\s+)?(spent|paid|received|earned)\s+(.+)$/i);
  if (!transaction) return null;
  const [, verb, remainder] = transaction;
  const type = /^(spent|paid)$/i.test(verb) ? "EXPENSE" : "INCOME";

  const details = remainder.match(/^(.+?)\s+(?:on|for|at|from|towards|as)\s+(.+)$/i)
    ?? (type === "INCOME" ? remainder.match(/^(.+?)\s+(salary|paycheck|wages|bonus|freelance|interest|dividends?|rent|refund)$/i) : null);
  const amount = parseAmount((details?.[1] ?? remainder).toLowerCase());
  const description = details?.[2]?.trim() ?? "";
  const extraAmount = description.split(/\s+(?:and|then)\s+/i).slice(1).some((clause) => {
    const [first] = clause.toLowerCase().split(/\s+(?:on|for|at|from|towards|as)\s+/);
    return parseAmount(first) !== null;
  });
  if (
    !amount || extraAmount ||
    /(?:\d|[$€£₹¥]|\b(?:and|then)\s+(?:i\s+)?(?:spent|paid|received|earned)\b)/i.test(description)
  ) return null;

  const hints = Object.entries(categoryHints[type]);
  const category = hints.find(([, words]) => words.test(description))?.[0]
    ?? (type === "INCOME" ? "other-income" : "other-expense");
  return { ...amount, amountOnly: false, type, description, category };
}
