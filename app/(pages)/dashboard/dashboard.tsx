"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ExpensesChartCard, {
  ExpensesOverDays,
  YearlyExpenseLineChart,
} from "@/components/ExpenseChartCard";
import { ExpenseOverview } from "@/global/dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { currencyMapper } from "@/utils/currencyMapper";
import { ProgressBar } from "@/components/ProgressBar";
import {
  AlertTriangle,
  FileWarning,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";
import CardComponent from "@/components/CardComponent";
import Expense from "../expense/_components/expense_old/expense";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

const SkeletonLoader = ({ className }: { className?: string }) => {
  return (
    <Card className={className}>
      <CardContent className="w-full h-full flex justify-center items-center">
        <Spinner className="text-muted-foreground h-8 w-8" />
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
  const [itemName, itemValue] =
    mostExp && Object.entries(mostExp)[0]
      ? Object.entries(mostExp)[0]
      : [null, null];

  if (newUser) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Label className="text-3xl mb-4 font-bold text-green-400">
          Welcome to Expensely!
        </Label>
        <p className="text-lg text-center mb-2">
          {`It looks like you haven't added any expenses yet. Start tracking your
          expenses by adding your first expense.`}
        </p>
        <div>
          <ul className="list-decimal list-inside p-2 text-left text-muted-foreground">
            <li>
              Create a{" "}
              <Link href="/category/add" className="underline">
                new category
              </Link>{" "}
              .
            </li>
            <li>
              Add a new expense using the{" "}
              <Link href="/expense/add" className="underline">
                Add Expense
              </Link>{" "}
              from the side bar.
            </li>
            <li>Categorize your expenses for better tracking.</li>
            <li>Set budgets to manage your spending effectively.</li>
            <li>Explore reports and insights as you add more data.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-wrap w-full gap-4 h-full">
      {/* cards module */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        {/* Monthly Summary */}
        <CardComponent
          title={`${new Date().toLocaleString("default", {
            month: "long",
          })} Expense`}
          cardAction={
            overview && (
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
            )
          }
          numberData={
            overview
              ? `${currencyMapper(
                  user?.currency || "USD"
                )}${overview?.thisMonthTotalExpense.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : undefined
          }
          description={
            overview
              ? `You have spent ${currencyMapper(
                  user?.currency || "USD"
                )}${Math.abs(
                  overview?.thisMonthTotalExpense -
                    overview?.lastMonthTotalExpense
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ${
                  overview?.thisMonthTotalExpense -
                    overview?.lastMonthTotalExpense >
                  0
                    ? "more"
                    : "less"
                } than last month.`
              : undefined
          }
          loading={overview === null}
        />
        {/* Yearly Summary */}
        <CardComponent
          title="This Year's Expense"
          numberData={`${currencyMapper(
            user?.currency || "USD"
          )}${overview?.totalAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          description={`On an average you have spent ${currencyMapper(
            user?.currency || "USD"
          )}${overview?.averageMonthlyExpense.toFixed(2)} every month.`}
          loading={overview === null}
        />
        {/* Category */}

        <CardComponent
          title="Total Categories"
          numberData={`${overview?.totalCategories || 0}`}
          description={`Most used category: ${
            overview?.mostFrequentCategory || "N/A"
          }`}
          loading={overview === null}
        />

        {/* Most Expensive Item */}

        <CardComponent
          title="This month most expensive item"
          numberData={itemName && itemValue ? `${itemName}` : "N/A"}
          description={
            itemName
              ? `You have spent ${currencyMapper(user?.currency || "USD")}${(
                  itemValue as number
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : ""
          }
          loading={overview === null}
        />
      </div>

      {/* yearly module */}
      <div className="gap-4 w-full grid grid-cols-1">
        <YearlyExpenseLineChart
          amountByMonth={overview?.amountByMonth}
          amountByMonthV2={overview?.monthlyCategoryExpense}
          darkMode={user.theme === "dark"}
          currency={user.currency}
          setCurrentYearForYearly={setCurrentYearForYearly}
          currentYearForYearly={currentYearForYearly}
          min_year={min_year}
          loading={loadingYear || overview === null}
        />
      </div>

      {/* category + monthly module */}
      <div className="flex-1/4 gap-4 w-full grid grid-cols-1 md:grid-cols-2 ">
        {/* Spending by Category */}

        <ExpensesChartCard
          amountByCategory={overview?.amountByCategory}
          darkMode={user.theme === "dark"}
          currency={user.currency}
          title="Spending by Category"
          setCurrentYearForYearly={setCurrentYearForYearly}
          currentYearForYearly={currentYearForYearly}
          min_year={min_year}
          loading={loadingYear || overview === null}
        />

        {/* Budget */}

        <ExpensesOverDays
          overTheDaysThisMonth={overview?.overTheDaysThisMonth}
          darkMode={user.theme === "dark"}
          currency={user.currency}
          title="Spending Over Days"
          setCurrentMonth={setCurrentMonth}
          setCurrentMonthYear={setCurrentMonthYear}
          currentMonth={currentMonth}
          currentMonthYear={currentMonthYear}
          min_year={min_year}
          min_month={min_month}
          loading={loadingMonth || overview === null}
        />
      </div>

      {/* recent transactions module */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="overflow-scroll">
            <Expense isDemo={true} />
          </CardContent>
        </Card>
      </div>

      {/*  budget module */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-x-4">
        <div className="w-full h-full">
          {overview && overview.budgetServiceMap ? (
            <Card
              className="w-full h-full
            "
            >
              <CardHeader>
                <CardTitle>Budgets</CardTitle>
              </CardHeader>
              <CardContent className="md:max-h-[280px] overflow-y-auto">
                {Object.values(overview.budgetServiceMap).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No budgets found.
                  </p>
                )}
                {Object.values(overview.budgetServiceMap).map((budget) => (
                  <div key={budget.id} className="mb-6">
                    <div className="flex flex-wrap justify-between mb-1 items-center">
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
            <SkeletonLoader className="h-full" />
          )}
        </div>
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
