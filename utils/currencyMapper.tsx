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

export const currencyCodes = Object.keys(currencyMap);

export const currencyMapper = (currency: string): string => {
  return currencyMap[currency] || currency; // Return the mapped symbol or the original currency if not found
};
