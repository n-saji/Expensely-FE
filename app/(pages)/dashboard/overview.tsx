import Card from "@/components/card";
import { DashboardPageProps } from "@/global/dto";
import { currencyMapper } from "@/utils/currencyMapper";

export default function Overview({
  dashboardProps,
}: {
  dashboardProps: DashboardPageProps;
}) {
  const { user } = dashboardProps;
  const overview = dashboardProps.overview;

  return (
    <>
      {overview ? (
        <Card title="Yearly Expense" description="" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4">
            <div className="card-overview">
              <span>Total Spent This Year</span>
              <span className="card-overview-quantity">
                {currencyMapper(user?.currency || "USD")}
                {overview.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="card-overview">
              <span>Total Transactions</span>
              <span className="card-overview-quantity">
                {overview.totalCount}
              </span>
            </div>

            <div className="card-overview">
              <span>Avg Monthly Expense</span>
              <span className="card-overview-quantity">
                {currencyMapper(user?.currency || "USD")}
                {overview.averageMonthlyExpense.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          title="Expenses Summary For this Year"
          description="Loading your expenses overview..."
          className=""
          loading={true}
        />
      )}

      {/* Monthly Overview */}
      {overview ? (
        <Card title="This Month's Expense" description="" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 w-full">
            <div className="card-overview">
              <span>{`Total Spent`}</span>
              <span className="card-overview-quantity">
                {currencyMapper(user?.currency || "USD")}
                {overview.thisMonthTotalExpense.toFixed(2)}
              </span>
            </div>

            <div className="card-overview">
              <span>Change from Last Month</span>
              <span
                className={`card-overview-quantity ${
                  overview.comparedToLastMonthExpense >= 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {currencyMapper(user?.currency || "USD")}
                {Math.abs(overview.comparedToLastMonthExpense).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          title="Expenses Summary For this Year"
          description="Loading your expenses overview..."
          className=""
          loading={true}
        />
      )}

      {/* Category Overview */}
      {overview ? (
        <Card title="Category Overview" description="" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4">
            <div className="card-overview">
              <span>Total Categories</span>
              <span className="card-overview-quantity">
                {overview.totalCategories}
              </span>
            </div>
            <div className="card-overview">
              <span>Most Frequent Category</span>
              <span className="card-overview-quantity">
                {overview.mostFrequentCategory || "N/A"}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          title="Category Overview"
          description="Loading your category overview..."
          className=""
          loading={true}
        />
      )}
    </>
  );
}
