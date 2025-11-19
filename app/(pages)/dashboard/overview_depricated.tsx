import CardTemplate from "@/components/card";
import { DashboardPageProps } from "@/global/dto";
import { currencyMapper } from "@/utils/currencyMapper";
import Expense from "../expense/expense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function Overview({
  dashboardProps,
}: {
  dashboardProps: DashboardPageProps;
}) {
  const { user } = dashboardProps;
  const overview = dashboardProps.overview;
  const card_classname =
    "grid grid-cols-1 sm:grid-cols-2 w-full h-full gap-4 px-1";
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>MONTHLY SUMMARY</CardTitle>
        </CardHeader>
        {overview ? (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <div>
                <Label className="text-muted-foreground">Total Expenses</Label>
                <p className="text-lg font-semibold font-mono">
                  {currencyMapper(user?.currency || "USD")}
                  {overview?.thisMonthTotalExpense.toFixed(2)}
                </p>
              </div>
              <div>
                <Label>Change from Last Month</Label>
                <p>
                  {currencyMapper(user?.currency || "USD")}
                  {Math.abs(
                    overview!.thisMonthTotalExpense -
                      overview!.lastMonthTotalExpense
                  ).toFixed(2)}{" "}
                  {overview!.lastMonthTotalExpense === 0
                    ? "(0%)"
                    : `(${(
                        ((overview!.thisMonthTotalExpense -
                          overview!.lastMonthTotalExpense) /
                          overview!.lastMonthTotalExpense) *
                        100
                      ).toFixed(2)}%) ${
                        overview!.thisMonthTotalExpense -
                          overview!.lastMonthTotalExpense >=
                        0
                          ? "↑"
                          : "↓"
                      }
`}
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <Skeleton className="h-6 w-3/4 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Monthly Overview */}
      {overview ? (
        <CardTemplate
          title="This Month's Expense"
          // description=""
          className="space-y-4 col-span-2 md:col-span-1"
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
              <div className="flex flex-wrap items-center space-x-2">
                <span
                  className={`card-overview-quantity ${
                    overview.thisMonthTotalExpense -
                      overview.lastMonthTotalExpense >=
                    0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {currencyMapper(user?.currency || "USD")}
                  {Math.abs(
                    overview.thisMonthTotalExpense -
                      overview.lastMonthTotalExpense
                  ).toFixed(2)}
                </span>
                <span className="card-overview-subtext">
                  {overview.lastMonthTotalExpense === 0
                    ? "(0%)"
                    : `(${(
                        ((overview.thisMonthTotalExpense -
                          overview.lastMonthTotalExpense) /
                          overview.lastMonthTotalExpense) *
                        100
                      ).toFixed(2)}%) ${
                        overview.thisMonthTotalExpense -
                          overview.lastMonthTotalExpense >=
                        0
                          ? "↑"
                          : "↓"
                      }
`}
                </span>
              </div>
            </div>

            {Object.keys(overview.thisMonthMostExpensiveItem).length > 0 &&
              (() => {
                const firstKey = Object.keys(
                  overview.thisMonthMostExpensiveItem
                )[0];
                const firstValue =
                  overview.thisMonthMostExpensiveItem[firstKey];

                return (
                  <div className="card-overview">
                    <span className="card-overview-label">
                      Biggest Transaction
                    </span>
                    <div className="flex flex-wrap items-center space-x-2">
                      <span className="card-overview-quantity">
                        {currencyMapper(user?.currency || "USD")}
                        {firstValue}
                      </span>
                      <span className="card-overview-subtext">
                        {"(" + firstKey + ")"}
                      </span>
                    </div>
                  </div>
                );
              })()}
          </div>
        </CardTemplate>
      ) : (
        <CardTemplate
          title="This Month's Expense"
          // description="Loading your expenses overview..."
          className=""
          loading={true}
        />
      )}

      {overview ? (
        <CardTemplate
          title="Yearly Expense"
          // description=""
          className="space-y-4 col-span-2 md:col-span-1"
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

            <div className="card-overview">
              <span className="card-overview-label">
                Most Frequent Category
              </span>
              <span className="card-overview-quantity">
                {overview.mostFrequentCategory || "N/A"}
              </span>
            </div>
          </div>
        </CardTemplate>
      ) : (
        <CardTemplate
          title="Yearly Expense"
          // description="Loading your expenses overview..."
          className=""
          loading={true}
        />
      )}

      {/* Category Overview */}
      {/* {overview ? (
        <Card
          title="Category Overview"
          // description=""
          className="space-y-4 col-span-2 md:col-span-1"
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
      )} */}

      {/* Recent Transactions */}
      <CardTemplate className="col-span-2" title="Recent Transactions">
        <Expense isDemo={true} />
      </CardTemplate>
    </>
  );
}
