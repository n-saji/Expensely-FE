"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ExpensesChartCard, {
  ExpensesMonthlyBarChartCard,
  ExpensesMonthlyLineChartCard,
  ExpensesOverDays,
} from "@/components/ExpenseChartCard";
import { ExpenseOverview } from "@/global/dto";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { currencyMapper } from "@/utils/currencyMapper";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/ProgressBar";
import {
  AlertTriangle,
  FileWarning,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";
import CardComponent from "@/components/CardComponent";

const SkeletonLoader = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="w-full h-full flex justify-center items-center">
        <Skeleton className="w-full h-full rounded-md" />
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.user);
  const [overview, setOverview] = useState<ExpenseOverview | null>(null);
  const [loadingYear, setLoadingYear] = useState<boolean>(true);
  const [loadingMonth, setLoadingMonth] = useState<boolean>(true);
  const [newUser, setNewUser] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentMonthYear, setCurrentMonthYear] = useState(
    new Date().getFullYear()
  );
  const [currentYearForYearly, setCurrentYearForYearly] = useState(
    new Date().getFullYear()
  );

  const fetchOverview = async ({
    monthYear = currentMonthYear,
    month = currentMonth,
    yearly = currentYearForYearly,
    hasConstraint = false,
    type = "",
  }: {
    monthYear?: number;
    month?: number;
    yearly?: number;
    hasConstraint: boolean;
    type?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (hasConstraint) {
        if (month !== undefined && monthYear !== undefined) {
          queryParams.append("req_month", month.toString());
          queryParams.append("req_month_year", monthYear.toString());
        }
        if (yearly !== undefined) {
          queryParams.append("req_year", yearly.toString());
        }
      }
      if (type === "") {
        setLoadingMonth(true);
        setLoadingYear(true);
      }
      if (type === "month") {
        setLoadingMonth(true);
      }
      if (type === "year") {
        setLoadingYear(true);
      }
      const res = await api.get(
        `/expenses/user/${user.id}/overview?${queryParams.toString()}`
      );

      if (res.status !== 200) {
        throw new Error("Network response was not ok");
      }

      const data = (await res.data) as ExpenseOverview;
      if (data.totalCount === 0) {
        setNewUser(true);
      }
      setOverview(data);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      if (type === "") {
        setLoadingMonth(false);
        setLoadingYear(false);
      }
      if (type === "month") {
        setLoadingMonth(false);
      }
      if (type === "year") {
        setLoadingYear(false);
      }
    }
  };

  useEffect(() => {
    fetchOverview({
      hasConstraint: true,
      month: currentMonth,
      monthYear: currentMonthYear,
      type: "month",
    });
  }, [currentMonth, currentMonthYear]);

  const min_year = overview ? overview.earliestStartYear : 2000;
  const min_month = overview ? overview.earliestStartMonth : 1;

  useEffect(() => {
    fetchOverview({
      hasConstraint: true,
      yearly: currentYearForYearly,
      type: "year",
    });
  }, [currentYearForYearly]);

  const mostExp = overview?.thisMonthMostExpensiveItem;
  const [itemName, itemValue] = mostExp ? Object.entries(mostExp)[0] : [];

  if (newUser) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl text-gray-700 p-4 font-bold dark:text-gray-200">
          Welcome to Expensely!
        </h1>
        <p className="text-gray-600 p-2 text-center dark:text-gray-400">
          {`It looks like you haven't added any expenses yet.`}
        </p>
        <p className="text-gray-600 p-2 text-center dark:text-gray-400">
          Start tracking your expenses by adding your first expense.
        </p>
      </div>
    );
  }


  return (
    <div className="flex flex-col flex-wrap w-full gap-4 h-full">
      {/* left module */}
      <div className="flex-1/4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4">
        {/* Monthly Summary */}
        {overview ? (
          <CardComponent
            title={`${new Date().toLocaleString("default", {
              month: "long",
            })} Expense`}
            cardAction={
              <div className="flex items-center gap-1 border rounded-md px-2 py-1">
                {overview!.thisMonthTotalExpense -
                  overview!.lastMonthTotalExpense >
                0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <p className="text-xs font-mono">
                  {overview!.lastMonthTotalExpense === 0
                    ? "0%"
                    : `${(
                        ((overview!.thisMonthTotalExpense -
                          overview!.lastMonthTotalExpense) /
                          overview!.lastMonthTotalExpense) *
                        100
                      ).toFixed(2)}%
`}
                </p>
              </div>
            }
            numberData={`${currencyMapper(
              user?.currency || "USD"
            )}${overview?.thisMonthTotalExpense.toFixed(2)}`}
            description={`You have spent ${currencyMapper(
              user?.currency || "USD"
            )}${Math.abs(
              overview?.thisMonthTotalExpense - overview?.lastMonthTotalExpense
            ).toFixed(2)} ${
              overview?.thisMonthTotalExpense -
                overview?.lastMonthTotalExpense >
              0
                ? "more"
                : "less"
            } than last month.`}
          />
        ) : (
          <SkeletonLoader
            title={`${new Date().toLocaleString("default", {
              month: "long",
            })} Expense`}
            className="h-[150px]"
          />
        )}

        {/* Yearly Summary */}
        {overview ? (
          <CardComponent
            title="This Year's Expense"
            numberData={`${currencyMapper(
              user?.currency || "USD"
            )}${overview?.totalAmount.toFixed(2)}`}
            description={`On an average you have spent ${currencyMapper(
              user?.currency || "USD"
            )}${overview?.averageMonthlyExpense.toFixed(
              2
            )} every month this year.`}
          />
        ) : (
          <SkeletonLoader title="This Year's Expense" className="h-[150px]" />
        )}

        {/* Category */}
        {overview ? (
          <CardComponent
            title="Total Categories"
            numberData={`${overview?.totalCategories || 0}`}
            description={`Most used category: ${
              overview?.mostFrequentCategory || "N/A"
            }`}
          />
        ) : (
          <SkeletonLoader title="Total Categories" className="h-[150px]" />
        )}
        {/* Dummy - 2 */}

        {overview ? (
          <CardComponent
            title="This month most expensive item"
            numberData={itemName && itemValue ? `${currencyMapper(
              user?.currency || "USD"
            )}${(itemValue as number).toFixed(2)}` : "N/A"}
            description={itemName ? `You spent most on ${itemName}` : ""}
          />
        ) : (
          <SkeletonLoader title="This month most expensive item" className="h-[150px]" />
        )}
      </div>
      {/* right module */}
      <div className="flex-2/3 gap-4 w-full grid grid-cols-1">
        {!loadingYear && overview ? (
          <ExpensesMonthlyBarChartCard
            amountByMonth={overview.amountByMonth}
            darkMode={user.theme === "dark"}
            currency={user.currency}
            title="Expense Summary"
            setCurrentYearForYearly={setCurrentYearForYearly}
            currentYearForYearly={currentYearForYearly}
            min_year={min_year}
          />
        ) : (
          <SkeletonLoader title="Expense Summary" className="h-[300px]" />
        )}

        <div className="flex flex-col md:flex-row gap-4">
          {!loadingYear && overview ? (
            <ExpensesMonthlyLineChartCard
              amountByMonth={overview.monthlyCategoryExpense}
              darkMode={user.theme === "dark"}
              currency={user.currency}
              title="Monthly Spending Trends"
              setCurrentYearForYearly={setCurrentYearForYearly}
              currentYearForYearly={currentYearForYearly}
              min_year={min_year}
            />
          ) : (
            <SkeletonLoader
              title="Monthly Spending Trends"
              className="w-full"
            />
          )}
          {!loadingMonth && overview ? (
            <ExpensesOverDays
              overTheDaysThisMonth={overview.overTheDaysThisMonth}
              darkMode={user.theme === "dark"}
              currency={user.currency}
              title="Spending Over Days"
              setCurrentMonth={setCurrentMonth}
              setCurrentMonthYear={setCurrentMonthYear}
              currentMonth={currentMonth}
              currentMonthYear={currentMonthYear}
              min_year={min_year}
              min_month={min_month}
            />
          ) : (
            <SkeletonLoader title="Spending Over Days" className="w-full" />
          )}
        </div>
      </div>
      {/* down module */}
      <div className="flex-1/4 gap-4 w-full grid grid-cols-1 md:grid-cols-2 ">
        {/* Spending by Category */}
        {!loadingYear && overview ? (
          <ExpensesChartCard
            amountByCategory={overview.amountByCategory}
            darkMode={user.theme === "dark"}
            currency={user.currency}
            title="Spending by Category"
            setCurrentYearForYearly={setCurrentYearForYearly}
            currentYearForYearly={currentYearForYearly}
            min_year={min_year}
          />
        ) : (
          <SkeletonLoader title="Spending by Category" className="h-[300px]" />
        )}
        {/* Budget */}
        {overview && overview.budgetServiceMap ? (
          <Card>
            <CardHeader>
              <CardTitle>Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.values(overview.budgetServiceMap).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No budgets found.
                </p>
              )}
              {Object.values(overview.budgetServiceMap).map((budget) => (
                <div key={budget.id} className="mb-4">
                  <div className="flex justify-between mb-1 items-center">
                    <Label className="text-sm">
                      {budget.category.name}{" "}
                      {budgetIcon(budget.amountSpent, budget.amountLimit)}
                    </Label>
                    <Label className="text-sm text-muted-foreground">
                      {currencyMapper(user?.currency || "USD")}
                      {budget.amountSpent.toFixed(2)} /{" "}
                      {currencyMapper(user?.currency || "USD")}
                      {budget.amountLimit.toFixed(2)}
                    </Label>
                  </div>

                  <ProgressBar
                    value={budget.amountSpent}
                    max={budget.amountLimit}
                    variant={budgetVariant(
                      budget.amountSpent,
                      budget.amountLimit
                    )}
                    showAnimation={true}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <SkeletonLoader title="Budgets" className="h-[150px]" />
        )}
      </div>
    </div>
  );
}

function budgetVariant(amountSpent: number, amountLimit: number) {
  const usagePercentage = (amountSpent / amountLimit) * 100;

  if (usagePercentage <= 70) {
    return "success";
  } else if (usagePercentage > 70 && usagePercentage <= 100) {
    return "warning";
  } else {
    return "error";
  }
}

function budgetIcon(amountSpent: number, amountLimit: number) {
  const usagePercentage = (amountSpent / amountLimit) * 100;
  if (usagePercentage <= 70) {
    return <></>;
  } else if (usagePercentage > 70 && usagePercentage <= 100) {
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  } else {
    return <FileWarning className="h-4 w-4 text-red-500" />;
  }
}
