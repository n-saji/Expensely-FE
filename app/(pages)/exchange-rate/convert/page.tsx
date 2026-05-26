import ConvertClient from "./convert-client";

export async function generateMetadata() {
  return {
    title: "Currency Converter | Expensely",
  };
}

export default function CurrencyConverterPage() {
  return <ConvertClient />;
}
