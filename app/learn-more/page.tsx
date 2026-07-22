import LearnMoreClient from "./learn-more-client";

export async function generateMetadata() {
  return {
    title: "Platform & Feature Guide | Expensely",
    description:
      "Explore the complete platform guide of Expensely, including real-time analytics, budget caps, multi-currency conversions, recurring bill automation, and cloud receipt storage.",
  };
}

export default function LearnMorePage() {
  return <LearnMoreClient />;
}
