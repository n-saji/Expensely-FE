import Card from "@/components/card";
import { DashboardPageProps } from "@/global/dto";
import { currencyMapper } from "@/utils/currencyMapper";

export default function Overview({
  dashboardProps,
}: {
  dashboardProps: DashboardPageProps;
}) {
  const { user, token } = dashboardProps;
  const overview = dashboardProps.overview;

  return (
    <>
      {overview ? (
        <Card
          title="Yearly Expenses Overview"
          description=""
          className="space-y-4"
        >
          <div className="flex justify-between text-gray-700 dark:text-gray-500">
            <span>Total Spent This Year: &nbsp;</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {currencyMapper(user?.currency || "USD")}
              {overview.totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-gray-700 dark:text-gray-500">
            <span>Total Transactions: &nbsp;</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {overview.totalCount}
            </span>
          </div>

          <div className="flex justify-between text-gray-700 dark:text-gray-500">
            <span>Most Frequent Category: &nbsp;</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {overview.mostFrequentCategory || "N/A"}
            </span>
          </div>
          {/* <div className="flex justify-between text-gray-700 dark:text-gray-500">
                      <span>Most Frequent Category Count &nbsp;</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {overview.mostFrequentCategoryCount}
                      </span>
                    </div> */}

          <div className="flex justify-between text-gray-700 dark:text-gray-500">
            <span>Total Categories: &nbsp;</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {overview.totalCategories}
            </span>
          </div>

          <div className="flex justify-between text-gray-700 dark:text-gray-500">
            <span>Avg Monthly Expense: &nbsp;</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {currencyMapper(user?.currency || "USD")}
              {overview.averageMonthlyExpense.toFixed(2)}
            </span>
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
        <Card
          title="This Month's Expenses Overview"
          description=""
          className="space-y-4"
        >
          <div className="flex justify-between text-gray-700 dark:text-gray-500">
            <span>{`This Month's Expense: ${"\u00A0"}`}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {currencyMapper(user?.currency || "USD")}
              {overview.thisMonthTotalExpense.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-gray-700 dark:text-gray-500">
            <span>Change from Last Month: &nbsp;</span>
            <span
              className={`font-semibold ${
                overview.comparedToLastMonthExpense >= 0
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {currencyMapper(user?.currency || "USD")}
              {Math.abs(overview.comparedToLastMonthExpense).toFixed(2)}
            </span>
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
    </>
  );
}
