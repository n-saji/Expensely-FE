export const currencyMap: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  SEK: "kr",
  NZD: "NZ$",
  INR: "₹",
  RUB: "₽",
  ZAR: "R",
  BRL: "R$",
  MXN: "$",
  KRW: "₩",
  SGD: "S$",
  HKD: "HK$",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
};

export const currencyNames: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  SEK: "Swedish Krona",
  NZD: "New Zealand Dollar",
  INR: "Indian Rupee",
  RUB: "Russian Ruble",
  ZAR: "South African Rand",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  KRW: "South Korean Won",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  PLN: "Polish Zloty",
};

export const currencyCodes = Object.keys(currencyMap);

export const currencyMapper = (currency: string): string => {
  return currencyMap[currency] || currency; // Return the mapped symbol or the original currency if not found
};

export const currencyLocale = (currency: string): string =>
  currency === "INR" ? "en-IN" : "en-US";

export const formatCurrency = (value: number, currency = "USD"): string =>
  new Intl.NumberFormat(currencyLocale(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
