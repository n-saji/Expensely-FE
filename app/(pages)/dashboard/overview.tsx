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
  const card_classname = "grid grid-cols-1 sm:grid-cols-2 w-full gap-4 px-4";
  const entries_top_five = Object.entries(
    overview?.topFiveMostExpensiveItemThisMonth || {}
  );
  console.log("entries_top_five", entries_top_five);

  return (
    <>
      {overview ? (
        <Card
          title="Yearly Expense"
          // description=""
          className="space-y-4"
        >
          <div className={card_classname}>
            <div className="card-overview">
              <span className="card-overview-label">Total Spent This Year</span>
              <span className="card-overview-quantity">
                {currencyMapper(user?.currency || "USD")}
                {overview.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="card-overview">
              <span className="card-overview-label">Total Transactions</span>
              <span className="card-overview-quantity">
                {overview.totalCount}
              </span>
            </div>

            <div className="card-overview">
              <span className="card-overview-label">Avg Monthly Expense</span>
              <span className="card-overview-quantity">
                {currencyMapper(user?.currency || "USD")}
                {overview.averageMonthlyExpense.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          title="Yearly Expense"
          // description="Loading your expenses overview..."
          className=""
          loading={true}
        />
      )}

      {/* Monthly Overview */}
      {overview ? (
        <Card
          title="This Month's Expense"
          // description=""
          className="space-y-4"
        >
          <div className={card_classname}>
            <div className="card-overview">
              <span className="card-overview-label">{`Total Spent`}</span>
              <span className="card-overview-quantity">
                {currencyMapper(user?.currency || "USD")}
                {overview.thisMonthTotalExpense.toFixed(2)}
              </span>
            </div>

            <div className="card-overview">
              <span className="card-overview-label">
                Change from Last Month
              </span>
              <span
                className={`card-overview-quantity ${
                  overview.thisMonthTotalExpense - overview.lastMonthTotalExpense >= 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {currencyMapper(user?.currency || "USD")}
                {Math.abs(overview.thisMonthTotalExpense - overview.lastMonthTotalExpense).toFixed(2)}
              </span>
            </div>

            {entries_top_five.length > 0 && (
              <div className="card-overview">
                <span className="card-overview-label">Biggest Transaction</span>
                <div>
                  <span className="card-overview-quantity">
                    {currencyMapper(user?.currency || "USD")}
                    {entries_top_five[0][1].toFixed(2)}
                  </span>
                  <span className="card-overview-subtext">
                    {"(" + entries_top_five[0][0] + ")"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card
          title="This Month's Expense"
          // description="Loading your expenses overview..."
          className=""
          loading={true}
        />
      )}

      {/* Category Overview */}
      {overview ? (
        <Card
          title="Category Overview"
          // description=""
          className="space-y-4"
        >
          <div className={card_classname}>
            <div className="card-overview">
              <span className="card-overview-label">Total Categories</span>
              <span className="card-overview-quantity">
                {overview.totalCategories}
              </span>
            </div>
            <div className="card-overview">
              <span className="card-overview-label">
                Most Frequent Category
              </span>
              <span className="card-overview-quantity">
                {overview.mostFrequentCategory || "N/A"}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          title="Category Overview"
          // description="Loading your category overview..."
          className=""
          loading={true}
        />
      )}
    </>
  );
}
