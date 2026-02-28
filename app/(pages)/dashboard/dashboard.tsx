"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import PieChartComp, {
  ExpensesOverDays,
  YearlyExpenseLineChartV2,
} from "@/components/ExpenseChartCard";
import { ExpenseOverview, ExpenseOverviewV2, OverviewEnum } from "@/global/dto";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.user);
  const [overview, setOverview] = useState<ExpenseOverview | null>(null);
  const [loadingYear, setLoadingYear] = useState<boolean>(true);
  const [loadingMonth, setLoadingMonth] = useState<boolean>(true);
  const [newUser, setNewUser] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentMonthYear, setCurrentMonthYear] = useState(
    new Date().getFullYear(),
  );
  const [currentYearForYearly, setCurrentYearForYearly] = useState(
    new Date().getFullYear(),
  );
  const [overviewV2, setOverviewV2] = useState<ExpenseOverviewV2 | null>(null);
  const [overViewV2Loading, setOverviewV2Loading] = useState<boolean>(true);
  const [overviewParams, setOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 6,
    type: OverviewEnum.MONTH,
  });

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
        `/expenses/user/${user.id}/overview?${queryParams.toString()}`,
      );

      if (res.status !== 200) {
        throw new Error("Network response was not ok");
      }

      const data = (await res.data) as ExpenseOverview;
      if (data.earliestStartYear === null) {
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

  const fetchMonthlyOverview = async () => {
    try {
      setOverviewV2Loading(true);

      const [monthlyRes, categoryRes] = await Promise.all([
        api.get(
          `/expenses/monthly?count=${overviewParams.count}&type=${overviewParams.type}`,
        ),
        api.get(
          `/expenses/monthly/category?count=${overviewParams.count}&type=${overviewParams.type}`,
        ),
      ]);

      if (monthlyRes.status !== 200 || categoryRes.status !== 200) {
        throw new Error("Network response was not ok");
      }

      setOverviewV2({
        amountByMonthV2: monthlyRes.data,
        monthlyCategoryExpenseV2: categoryRes.data,
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setOverviewV2Loading(false);
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

  useEffect(() => {
    fetchOverview({
      hasConstraint: true,
      yearly: currentYearForYearly,
      type: "year",
    });
  }, [currentYearForYearly]);

  useEffect(() => {
    const handler = () => {
      fetchOverview({ hasConstraint: true, type: "" });
      fetchMonthlyOverview();
    };
    window.addEventListener("expense-added", handler);
    return () => window.removeEventListener("expense-added", handler);
  }, []);

  useEffect(() => {
    fetchMonthlyOverview();
  }, [overviewParams]);

  const min_year = overview ? overview.earliestStartYear : 2000;
  const min_month = overview ? overview.earliestStartMonth : 1;

  const mostExp = overview?.thisMonthMostExpensiveItem;
  const [itemName, itemValue] =
    mostExp && Object.entries(mostExp)[0]
      ? Object.entries(mostExp)[0]
      : [null, null];
  const budgetCount = overview
    ? Object.values(overview.budgetServiceMap).length
    : 0;

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

  const monthLabel = new Date(
    currentMonthYear,
    Math.max(currentMonth - 1, 0),
  ).toLocaleString("default", { month: "long" });
  const todayLabel = new Date().toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative flex flex-col flex-wrap w-full gap-6 h-full px-4 md:px-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            Your spending snapshot
          </h1>
          <p className="text-sm text-muted-foreground">
            Updated {todayLabel} · Tracking {monthLabel} {currentMonthYear}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm text-muted-foreground shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live insights
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-stretch">
        {/* TODO: in future */}
        {/* <Link
          prefetch={true}
          href={`/dashboard/month/${currentYearForYearly}-${
            currentMonth < 10 ? `0${currentMonth}` : currentMonth
          }`}
          scroll={false}
        ></Link> */}
        <div className="md:col-span-1 xl:col-span-3">
          <CardComponent
            title={`${monthLabel} Expense`}
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
                    user?.currency || "USD",
                  )}${overview?.thisMonthTotalExpense.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}`
                : undefined
            }
            description={
              overview
                ? `You have spent ${currencyMapper(
                    user?.currency || "USD",
                  )}${Math.abs(
                    overview?.thisMonthTotalExpense -
                      overview?.lastMonthTotalExpense,
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
        </div>

        <div className="md:col-span-1 xl:col-span-3">
          <CardComponent
            title="This Year's Expense"
            numberData={`${currencyMapper(
              user?.currency || "USD",
            )}${overview?.totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description={`On an average you have spent ${currencyMapper(
              user?.currency || "USD",
            )}${overview?.averageMonthlyExpense.toFixed(2)} every month.`}
            loading={overview === null}
          />
        </div>

        <div className="md:col-span-1 xl:col-span-3">
          <Card className="h-full border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Upcoming Recurring Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {overview === null ? (
                <div className="flex h-[90px] items-center justify-center">
                  <Spinner className="text-muted-foreground h-6 w-6" />
                </div>
              ) : (overview.upcomingRecurringExpenses || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming recurring expenses.
                </p>
              ) : (
                <div className="w-[95%] mx-auto">
                  <Carousel className="w-full">
                    <CarouselContent className="">
                      {(overview.upcomingRecurringExpenses || []).map(
                        (expense, index) => (
                          <CarouselItem
                            key={`${expense.id || expense.description}-${index}`}
                            className=""
                          >
                            <div className="w-full rounded-lg border border-border/70 px-3 py-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-foreground truncate">
                                  {expense.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {currencyMapper(user.currency)}
                                  {expense.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                              <div className="h-14 w-14 shrink-0 rounded-md border border-border/70 bg-background/80 flex flex-col items-center justify-center">
                                <p className="text-[10px] leading-none text-muted-foreground">
                                  {getWeekdayShort(expense.nextOccurrence)}
                                </p>
                                <p className="mt-1 text-xs leading-none text-foreground">
                                  {formatDayNumberMonth(expense.nextOccurrence)}
                                </p>
                              </div>
                            </div>
                          </CarouselItem>
                        ),
                      )}
                    </CarouselContent>
                    <CarouselPrevious className="-ml-2" />
                    <CarouselNext className="-mr-2" />
                  </Carousel>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1 xl:col-span-3">
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

        <div className="md:col-span-2 xl:col-span-12">
          <YearlyExpenseLineChartV2
            amountByMonth={overviewV2?.amountByMonthV2}
            amountByMonthV2={overviewV2?.monthlyCategoryExpenseV2}
            darkMode={user.theme === "dark"}
            currency={user.currency}
            setOverviewParams={setOverviewParams}
            overviewParams={overviewParams}
            loading={overViewV2Loading || overviewV2 === null}
          />
        </div>

        <div className="md:col-span-2 xl:col-span-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
            <PieChartComp
              amountByCategory={overview?.amountByCategory}
              currency={user.currency}
              title="Spending by Category"
              setCurrentYearForYearly={setCurrentYearForYearly}
              currentYearForYearly={currentYearForYearly}
              min_year={min_year}
              loading={loadingYear || overview === null}
            />

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
        </div>

        <div className="md:col-span-2 xl:col-span-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
            <Card className="flex min-h-[360px] md:min-h-[420px] h-full flex-col shadow-sm border-border/70 overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Budgets</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {budgetCount} active budget{budgetCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              {overview ? (
                <CardContent className="flex-1 md:max-h-[320px] overflow-y-auto space-y-4">
                  {Object.values(overview.budgetServiceMap).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No budgets found.
                    </p>
                  )}
                  {Object.values(overview.budgetServiceMap).map((budget) => (
                    <div
                      key={budget.id}
                      className="group rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm transition-all duration-200  hover:shadow-lg hover:border-emerald-500/30 hover:bg-gradient-to-br hover:from-emerald-500/5 hover:to-cyan-500/5 slide-in-from-bottom-3"
                    >
                      <div className="flex flex-col md:flex-row flex-wrap justify-between gap-2 items-start md:items-center">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-foreground">
                            {budget.category.name}
                          </Label>
                          {budgetIcon(budget.amountSpent, budget.amountLimit)}
                          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {budget.period}
                          </div>
                        </div>
                        <Label className="text-xs text-muted-foreground">
                          {currencyMapper(user?.currency || "USD")}
                          {budget.amountSpent.toFixed(2)} /{" "}
                          {currencyMapper(user?.currency || "USD")}
                          {budget.amountLimit.toFixed(2)}
                        </Label>
                      </div>

                      <div className="mt-3">
                        <div className="rounded-full bg-muted/60 p-1">
                          <ProgressBar
                            value={budget.amountSpent}
                            max={budget.amountLimit}
                            variant={budgetVariant(
                              budget.amountSpent,
                              budget.amountLimit,
                            )}
                            showAnimation={true}
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {Math.round(
                            (budget.amountSpent / budget.amountLimit) * 100,
                          )}
                          % of limit used
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              ) : (
                <CardContent className="flex-1 md:max-h-[320px] overflow-y-auto">
                  <div className="flex h-full w-full justify-center items-center">
                    <Spinner className="text-muted-foreground h-6 w-6" />
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="flex min-h-[360px] md:min-h-[420px] h-full flex-col shadow-sm border-border/70">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <Expense isDemo={true} />
              </CardContent>
            </Card>
          </div>
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

function parseLocalDate(dateValue: string) {
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyRegex.test(dateValue)) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateValue);
}

function getWeekdayShort(dateValue: string) {
  const date = parseLocalDate(dateValue);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatDayMonth(dateValue: string) {
  const date = parseLocalDate(dateValue);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const suffix = getDaySuffix(day);
  return `${day}${suffix} ${month}`;
}

function formatDayNumberMonth(dateValue: string) {
  const date = parseLocalDate(dateValue);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month}`;
}

function getDaySuffix(day: number) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
