import AboutPage from "./about";

export async function generateMetadata() {
  return {
    title: "About | Expensely",
  };
}

export default function AboutPageWrapper() {
  return <AboutPage />;
}
