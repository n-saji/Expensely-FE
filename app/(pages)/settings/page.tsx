import SettingsPage from "./settings";

export async function generateMetadata() {
  return {
    title: "Settings | Expensely",
  };
}

export default function SettingsPageWrapper({}: {}) {
  return <SettingsPage />;
}
