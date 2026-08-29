import TelemetryDashboard from "./telemetry-dashboard";

export async function generateMetadata() {
  return {
    title: "Telemetry | Expensely",
  };
}

export default function TelemetryPage() {
  return <TelemetryDashboard />;
}
