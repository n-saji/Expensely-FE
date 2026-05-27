import RatesClient from "./rates-client";

export async function generateMetadata() {
  return {
    title: "Exchange Rates | Expensely",
  };
}

export default function ExchangeRatesPage() {
  return <RatesClient />;
}
