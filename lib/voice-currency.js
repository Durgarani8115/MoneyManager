import { Prisma } from "@prisma/client";

const { Decimal } = Prisma;
const maxSafeRupees = new Decimal(Number.MAX_SAFE_INTEGER).div(100);

export async function convertVoiceAmountToInr(originalAmount, currency) {
  let quote;
  try {
    const response = await fetch(`https://api.frankfurter.dev/v2/rate/${currency}/INR`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });
    if (response.status === 404 || response.status === 422) {
      return { error: `No INR reference rate is available for ${currency}. Enter the amount in INR.` };
    }
    if (response.ok) quote = await response.json();
  } catch {
    // The draft must stay unchanged if the reference rate could not be fetched.
  }

  const rateDate = new Date(`${quote?.date}T00:00:00Z`);
  if (
    quote?.base !== currency ||
    quote.quote !== "INR" ||
    !Number.isFinite(quote.rate) ||
    quote.rate <= 0 ||
    !Number.isFinite(rateDate.getTime()) ||
    rateDate.toISOString().slice(0, 10) !== quote.date
  ) {
    return { error: `Couldn’t get the ${currency} to INR rate. Try again or enter the amount in INR.` };
  }

  const amount = new Decimal(originalAmount)
    .times(quote.rate)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  if (amount.lte(0) || amount.gt(maxSafeRupees)) {
    return { error: "The converted amount is outside the supported range in INR." };
  }

  return {
    amount: amount.toFixed(2),
    conversion: { currency, originalAmount, rate: quote.rate, date: quote.date },
  };
}
