"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
  AlertTriangle,
  FileWarning,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { RootState } from "@/redux/store";
import {
  ExpenseOverview,
  ExpenseOverviewV2,
  IncomeOverview,
  OverviewEnum,
} from "@/global/dto";
import api from "@/lib/api";
import CardComponent from "@/components/CardComponent";
import { IncomeExpenseComparisonChart } from "@/components/ExpenseChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "@/components/ProgressBar";
import { currencyMapper } from "@/utils/currencyMapper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import ExpenseInsightsSection from "./_components/expense-insights";
import IncomeInsightsSection from "./_components/income-insights";

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

  const [incomeOverview, setIncomeOverview] = useState<IncomeOverview | null>(
    null,
  );
  const [incomeOverviewV2, setIncomeOverviewV2] =
    useState<ExpenseOverviewV2 | null>(null);
  const [incomeOverviewV2Loading, setIncomeOverviewV2Loading] =
    useState<boolean>(true);
  const [loadingIncomeYear, setLoadingIncomeYear] = useState<boolean>(true);
  const [loadingIncomeMonth, setLoadingIncomeMonth] = useState<boolean>(true);
  const [incomeCurrentMonth, setIncomeCurrentMonth] = useState(
    new Date().getMonth() + 1,
  );
  const [incomeCurrentMonthYear, setIncomeCurrentMonthYear] = useState(
    new Date().getFullYear(),
  );
  const [incomeCurrentYearForYearly, setIncomeCurrentYearForYearly] = useState(
    new Date().getFullYear(),
  );

  const [overviewParams, setOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 6,
    type: OverviewEnum.MONTH,
  });
  const [incomeOverviewParams, setIncomeOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 6,
    type: OverviewEnum.MONTH,
  });
  const [compareOverviewParams, setCompareOverviewParams] = useState<{
    count?: number;
    type?: OverviewEnum;
  }>({
    count: 6,
    type: OverviewEnum.MONTH,
  });

  const [expenseMonthlyCompare, setExpenseMonthlyCompare] = useState<
    Record<string, number>
  >({});
  const [incomeMonthlyCompare, setIncomeMonthlyCompare] = useState<
    Record<string, number>
  >({});
  const [compareLoading, setCompareLoading] = useState<boolean>(true);

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
      if (type === "month") setLoadingMonth(true);
      if (type === "year") setLoadingYear(true);

      const res = await api.get(
        `/expenses/user/${user.id}/overview?${queryParams.toString()}`,
      );

      if (res.status !== 200) throw new Error("Network response was not ok");

      const data = res.data as ExpenseOverview;
      if (data.earliestStartYear === null) setNewUser(true);
      setOverview(data);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      if (type === "") {
        setLoadingMonth(false);
        setLoadingYear(false);
      }
      if (type === "month") setLoadingMonth(false);
      if (type === "year") setLoadingYear(false);
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

  const fetchIncomeOverview = async ({
    startDate,
    endDate,
    yearly = incomeCurrentYearForYearly,
    monthYear = incomeCurrentMonthYear,
    month = incomeCurrentMonth,
    hasConstraint = false,
    type = "",
  }: {
    startDate?: string;
    endDate?: string;
    yearly?: number;
    monthYear?: number;
    month?: number;
    hasConstraint: boolean;
    type?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);

      if (hasConstraint) {
        if (month !== undefined && monthYear !== undefined) {
          queryParams.append("req_month", month.toString());
          queryParams.append("req_month_year", monthYear.toString());
        }
        if (yearly !== undefined)
          queryParams.append("req_year", yearly.toString());
      }

      if (type === "") {
        setLoadingIncomeMonth(true);
        setLoadingIncomeYear(true);
      }
      if (type === "month") setLoadingIncomeMonth(true);
      if (type === "year") setLoadingIncomeYear(true);

      const res = await api.get(`/incomes/overview?${queryParams.toString()}`);
      if (res.status !== 200) throw new Error("Network response was not ok");

      setIncomeOverview(res.data as IncomeOverview);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      if (type === "") {
        setLoadingIncomeMonth(false);
        setLoadingIncomeYear(false);
      }
      if (type === "month") setLoadingIncomeMonth(false);
      if (type === "year") setLoadingIncomeYear(false);
    }
  };

  const fetchIncomeMonthlyOverview = async () => {
    try {
      setIncomeOverviewV2Loading(true);

      const [monthlyRes, categoryRes] = await Promise.all([
        api.get(
          `/incomes/monthly?count=${incomeOverviewParams.count ?? 6}&type=${incomeOverviewParams.type ?? OverviewEnum.MONTH}`,
        ),
        api.get(
          `/incomes/monthly/category?count=${incomeOverviewParams.count ?? 6}&type=${incomeOverviewParams.type ?? OverviewEnum.MONTH}`,
        ),
      ]);

      if (monthlyRes.status !== 200 || categoryRes.status !== 200) {
        throw new Error("Network response was not ok");
      }

      setIncomeOverviewV2({
        amountByMonthV2: monthlyRes.data,
        monthlyCategoryExpenseV2: categoryRes.data,
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIncomeOverviewV2Loading(false);
    }
  };

  const fetchIncomeExpenseCompareOverview = async () => {
    try {
      setCompareLoading(true);

      const expenseParams = new URLSearchParams();
      const incomeParams = new URLSearchParams();

      if (compareOverviewParams.type) {
        expenseParams.append("type", compareOverviewParams.type);
        incomeParams.append("type", compareOverviewParams.type);
      }

      if (compareOverviewParams.count !== undefined) {
        expenseParams.append("count", compareOverviewParams.count.toString());
        incomeParams.append("count", compareOverviewParams.count.toString());
      }

      const [expenseRes, incomeRes] = await Promise.all([
        api.get(`/expenses/monthly?${expenseParams.toString()}`),
        api.get(`/incomes/monthly?${incomeParams.toString()}`),
      ]);

      if (expenseRes.status !== 200 || incomeRes.status !== 200) {
        throw new Error("Network response was not ok");
      }

      setExpenseMonthlyCompare(expenseRes.data || {});
      setIncomeMonthlyCompare(incomeRes.data || {});
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setCompareLoading(false);
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
    fetchIncomeOverview({
      hasConstraint: true,
      month: incomeCurrentMonth,
      monthYear: incomeCurrentMonthYear,
      type: "month",
    });
  }, [incomeCurrentMonth, incomeCurrentMonthYear]);

  useEffect(() => {
    fetchIncomeOverview({
      hasConstraint: true,
      yearly: incomeCurrentYearForYearly,
      type: "year",
    });
  }, [incomeCurrentYearForYearly]);

  useEffect(() => {
    const handler = () => {
      fetchOverview({ hasConstraint: true, type: "" });
      fetchMonthlyOverview();
    };
    window.addEventListener("expense-added", handler);
    return () => window.removeEventListener("expense-added", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      fetchIncomeOverview({ hasConstraint: true, type: "" });
      fetchIncomeMonthlyOverview();
    };
    window.addEventListener("income-added", handler);
    return () => window.removeEventListener("income-added", handler);
  }, []);

  useEffect(() => {
    fetchMonthlyOverview();
  }, [overviewParams]);

  useEffect(() => {
    fetchIncomeMonthlyOverview();
  }, [incomeOverviewParams]);

  useEffect(() => {
    fetchIncomeExpenseCompareOverview();
  }, [compareOverviewParams]);

  const min_year = overview ? overview.earliestStartYear : 2000;
  const min_month = overview ? overview.earliestStartMonth : 1;
  const min_income_year = incomeOverview
    ? incomeOverview.earliestStartYear
    : 2000;
  const min_income_month = incomeOverview
    ? incomeOverview.earliestStartMonth
    : 1;

  const mostExp = overview?.thisMonthMostExpensiveItem;
  const [itemName, itemValue] =
    mostExp && Object.entries(mostExp)[0]
      ? Object.entries(mostExp)[0]
      : [null, null];

  const budgetCount = overview
    ? Object.values(overview.budgetServiceMap).length
    : 0;

  const mostIncome = incomeOverview?.thisMonthMostIncomeItem;
  const [incomeItemName, incomeItemValue] =
    mostIncome && Object.entries(mostIncome)[0]
      ? Object.entries(mostIncome)[0]
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
            Your financial snapshot
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <CardComponent
          title={`${monthLabel} Expense`}
          cardAction={
            overview && (
              <div
                className={`flex items-center gap-1 rounded-md px-2 py-1 border ${
                  overview.thisMonthTotalExpense -
                    overview.lastMonthTotalExpense >
                  0
                    ? "border-red-500/40 bg-red-500/10 text-red-400"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {overview.thisMonthTotalExpense -
                  overview.lastMonthTotalExpense >
                0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <p className="text-xs font-mono">
                  {(overview.lastMonthTotalExpense === 0 || overview.lastMonthTotalExpense === null)
                    ? "100%"
                    : `${(
                        ((overview.thisMonthTotalExpense -
                          overview.lastMonthTotalExpense) /
                          overview.lastMonthTotalExpense) *
                        100
                      ).toFixed(2)}%`}
                </p>
              </div>
            )
          }
          numberData={
            overview
              ? `${currencyMapper(user?.currency || "USD")}${overview.thisMonthTotalExpense.toLocaleString(
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
              ? `You have spent ${currencyMapper(user?.currency || "USD")}${Math.abs(
                  overview.thisMonthTotalExpense -
                    overview.lastMonthTotalExpense,
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ${
                  overview.thisMonthTotalExpense -
                    overview.lastMonthTotalExpense >
                  0
                    ? "more"
                    : "less"
                } than last month.`
              : undefined
          }
          loading={overview === null}
        />

        <CardComponent
          title={`${monthLabel} Income`}
          cardAction={
            incomeOverview && (
              <div
                className={`flex items-center gap-1 rounded-md px-2 py-1 border ${
                  incomeOverview.thisMonthTotalIncome -
                    incomeOverview.lastMonthTotalIncome >
                  0
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/40 bg-red-500/10 text-red-400"
                }`}
              >
                {incomeOverview.thisMonthTotalIncome -
                  incomeOverview.lastMonthTotalIncome >
                0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <p className="text-xs font-mono">
                  {incomeOverview.lastMonthTotalIncome === 0
                    ? "0%"
                    : `${(
                        ((incomeOverview.thisMonthTotalIncome -
                          incomeOverview.lastMonthTotalIncome) /
                          incomeOverview.lastMonthTotalIncome) *
                        100
                      ).toFixed(2)}%`}
                </p>
              </div>
            )
          }
          numberData={
            incomeOverview
              ? `${currencyMapper(user?.currency || "USD")}${incomeOverview.thisMonthTotalIncome.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
                )}`
              : undefined
          }
          description={
            incomeOverview
              ? `You earned ${currencyMapper(user?.currency || "USD")}${Math.abs(
                  incomeOverview.thisMonthTotalIncome -
                    incomeOverview.lastMonthTotalIncome,
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} ${
                  incomeOverview.thisMonthTotalIncome -
                    incomeOverview.lastMonthTotalIncome >
                  0
                    ? "more"
                    : "less"
                } than last month.`
              : undefined
          }
          loading={incomeOverview === null}
        />

        <Card
          className="flex h-full flex-col min-w-0 transition-[transform,scale,box-shadow] duration-300 ease-in-out
            hover:shadow-[0_8px_20px_rgb(0,0,0,0.4)]"
        >
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
                  <CarouselContent>
                    {(overview.upcomingRecurringExpenses || []).map(
                      (expense, index) => (
                        <CarouselItem
                          key={`${expense.id || expense.description}-${index}`}
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

      <div className="grid grid-cols-1 gap-6 items-stretch">
        <IncomeExpenseComparisonChart
          expenseByMonth={expenseMonthlyCompare}
          incomeByMonth={incomeMonthlyCompare}
          darkMode={user.theme === "dark"}
          currency={user.currency}
          loading={compareLoading}
          setOverviewParams={setCompareOverviewParams}
        />
      </div>

      <Card className="w-full border-border/70 shadow-sm overflow-hidden">
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
          <CardContent>
            {Object.values(overview.budgetServiceMap).length === 0 ? (
              <p className="text-sm text-muted-foreground">No budgets found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.values(overview.budgetServiceMap).map((budget) => (
                  <div
                    key={budget.id}
                    className="group rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-emerald-500/30 hover:bg-gradient-to-br hover:from-emerald-500/5 hover:to-cyan-500/5"
                  >
                    <div className="flex flex-wrap justify-between gap-2 items-center">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-foreground">
                          {budget.category.name}
                        </Label>
                        {budgetIcon(budget.amountSpent, budget.amountLimit)}
                      </div>
                      <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {budget.period}
                      </div>
                    </div>

                    <div className="mt-3 rounded-full bg-muted/60 p-1">
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

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {currencyMapper(user?.currency || "USD")}
                        {budget.amountSpent.toFixed(2)} /{" "}
                        {currencyMapper(user?.currency || "USD")}
                        {budget.amountLimit.toFixed(2)}
                      </span>
                      <span>
                        {Math.round(
                          (budget.amountSpent / budget.amountLimit) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        ) : (
          <CardContent className="min-h-[140px] flex items-center justify-center">
            <Spinner className="text-muted-foreground h-6 w-6" />
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="expense" className="w-full space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="expense">Expense Insights</TabsTrigger>
          <TabsTrigger value="income">Income Insights</TabsTrigger>
        </TabsList>

        <ExpenseInsightsSection
          userCurrency={user.currency}
          userTheme={user.theme}
          overview={overview}
          overviewV2={overviewV2}
          overviewV2Loading={overViewV2Loading}
          itemName={itemName as string | null}
          itemValue={itemValue as number | null}
          minYear={min_year}
          minMonth={min_month}
          loadingYear={loadingYear}
          loadingMonth={loadingMonth}
          currentYearForYearly={currentYearForYearly}
          setCurrentYearForYearly={setCurrentYearForYearly}
          currentMonth={currentMonth}
          currentMonthYear={currentMonthYear}
          setCurrentMonth={setCurrentMonth}
          setCurrentMonthYear={setCurrentMonthYear}
          overviewParams={overviewParams}
          setOverviewParams={setOverviewParams}
        />

        <IncomeInsightsSection
          userCurrency={user.currency}
          userTheme={user.theme}
          incomeOverview={incomeOverview}
          incomeOverviewV2={incomeOverviewV2}
          incomeOverviewV2Loading={incomeOverviewV2Loading}
          incomeItemName={incomeItemName as string | null}
          incomeItemValue={incomeItemValue as number | null}
          minIncomeYear={min_income_year}
          minIncomeMonth={min_income_month}
          loadingIncomeYear={loadingIncomeYear}
          loadingIncomeMonth={loadingIncomeMonth}
          incomeCurrentYearForYearly={incomeCurrentYearForYearly}
          setIncomeCurrentYearForYearly={setIncomeCurrentYearForYearly}
          incomeCurrentMonth={incomeCurrentMonth}
          incomeCurrentMonthYear={incomeCurrentMonthYear}
          setIncomeCurrentMonth={setIncomeCurrentMonth}
          setIncomeCurrentMonthYear={setIncomeCurrentMonthYear}
          incomeOverviewParams={incomeOverviewParams}
          setIncomeOverviewParams={setIncomeOverviewParams}
        />
      </Tabs>
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

function formatDayNumberMonth(dateValue: string) {
  const date = parseLocalDate(dateValue);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month}`;
}
