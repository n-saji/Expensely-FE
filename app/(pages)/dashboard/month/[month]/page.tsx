export default async function MonthlyDashboardPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  return <div>Monthly Dashboard Page for {month}</div>;
}
