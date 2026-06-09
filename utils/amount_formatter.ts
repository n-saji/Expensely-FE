export const FormatAmount = (amount: number) => {
  if (amount >= 1000 && amount < 10000) {
    return (
      (amount / 1000).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "K"
    );
  } else if (amount >= 10000 && amount < 1000000) {
    return (
      (amount / 1000).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + "K"
    );
  } else if (amount >= 1000000 && amount < 10000000) {
    return (
      (amount / 1000000).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + "M"
    );
  } else if (amount >= 10000000) {
    return (
      (amount / 1000000).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + "M"
    );
  } else {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};

const DEFAULT_CURRENCY = "USD";
const DEFAULT_LOCALE = "en-US";

/**
 * Exact formatter — use for transaction lists, forms, totals, exports.
 * Always shows full amount with currency symbol.
 */
export const formatAmountExact = (
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Compact formatter — use for charts, summary cards, budget bars.
 * Abbreviates large numbers for space efficiency.
 */
export const formatAmountCompact = (
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE
): string => {
  const symbol = getCurrencySymbol(currency, locale);
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    const decimals = val < 10 ? 1 : 0; // "3.4M" vs "34M"
    return `${sign}${symbol}${val.toFixed(decimals)}M`;
  }

  if (abs >= 1_000) {
    const val = abs / 1_000;
    const decimals = val < 10 ? 1 : 0; // "1.2K" vs "12K"
    return `${sign}${symbol}${val.toFixed(decimals)}K`;
  }

  return formatAmountExact(amount, currency, locale);
};

const getCurrencySymbol = (currency: string, locale: string): string => {
  return (0)
    .toLocaleString(locale, { style: "currency", currency })
    .replace(/[\d.,\s]/g, "")
    .trim();
};