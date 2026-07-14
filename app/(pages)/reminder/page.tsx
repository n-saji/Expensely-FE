import Page from "./reminder-client";

export async function generateMetadata() {
  return {
    title: "Reminders | Expensely",
  };
}

export default function ReminderPage() {
  return (
    <>
      <Page />
    </>
  );
}
