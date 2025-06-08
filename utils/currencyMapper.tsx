export const currencyMapper = (currency: string): string => {
  const currencyMap: { [key: string]: string } = {
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
  };

  return currencyMap[currency] || currency; // Return the mapped symbol or the original currency if not found
};
