"use client";
import Card from "@/components/card";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import ExpensesChartCard, {
  ExpensesMonthlyBarChartCard,
  ExpensesMonthlyLineChartCard,
  ExpensesTop5Monthly,
  ExpensesOverDays,
} from "@/components/ExpenseChartCard";
import { DashboardPageProps, ExpenseOverview } from "@/global/dto";
import Overview from "./overview";

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.user);
  const token = FetchToken();
  const [overview, setOverview] = useState<ExpenseOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newUser, setNewUser] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentMonthYear, setCurrentMonthYear] = useState(
    new Date().getFullYear()
  );
  const currentYear = new Date().getFullYear();
  const [currentYearForYearly, setCurrentYearForYearly] = useState(
    new Date().getFullYear()
  );
  const [clickedButton, setClickedButton] = useState<string>(
    sessionStorage.getItem("clickedButton") || "overview"
  );
  const dashboardProps: DashboardPageProps = {
    userId: user.id,
    token: token,
    user: user,
    overview: overview,
  };
  const fetchOverview = async ({
    monthYear = currentMonthYear,
    month = currentMonth,
    yearly = currentYearForYearly,
    hasConstraint = false,
  }: {
    monthYear?: number;
    month?: number;
    yearly?: number;
    hasConstraint: boolean;
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
      setLoading(true);
      const res = await fetch(
        `${API_URL}/expenses/user/${
          user.id
        }/overview?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = (await res.json()) as ExpenseOverview;
      if (data.totalCount === 0) {
        setNewUser(true);
      }
      setOverview(data);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.id && token) {
      fetchOverview({ hasConstraint: false });
    } else {
      throw new Error("User ID or token is missing");
    }
  }, []);

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

  const handleButtonClick = (button: string) => {
    setClickedButton(button);
    sessionStorage.setItem("clickedButton", button);
  };

  const min_year = overview ? overview.earliestStartYear : 2000;
  const min_month = overview ? overview.earliestStartMonth : 1;
  return (
    <>
      <div className="flex gap-4 w-full max-md:flex-col">
        <div className="flex gap-3 items-start w-full flex-wrap">
          <button
            className={`dashboard-button ${
              clickedButton === "overview"
                ? "dashboard-button-active"
                : ""
            }`}
            onClick={() => handleButtonClick("overview")}
          >
            Overview
          </button>
          <button
            className={`dashboard-button ${
              clickedButton === "yearly"
                ? "dashboard-button-active"
                : ""
            }`}
            onClick={() => handleButtonClick("yearly")}
          >
            Yearly
          </button>
          <button
            className={`dashboard-button ${
              clickedButton === "monthly"
                ? "dashboard-button-active"
                : ""
            }`}
            onClick={() => handleButtonClick("monthly")}
          >
            Monthly
          </button>
        </div>
        {clickedButton === "yearly" && overview?.earliestStartYear !== null && (
          <select
            className="border border-gray-300 rounded-md px-1.5 focus:outline-none w-fit
            cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200
            text-sm"
            defaultValue={currentYearForYearly}
            onChange={(e) => {
              setCurrentYearForYearly(parseInt(e.target.value));
              fetchOverview({
                hasConstraint: true,
                yearly: parseInt(e.target.value),
              });
            }}
          >
            {Array.from({ length: currentYear - min_year + 1 }, (_, i) => {
              const year = currentYear - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        )}
        {clickedButton === "monthly" && overview?.earliestStartMonth !== null && (
          <input
            type="month"
            min={`${min_year}-${min_month < 10 ? `0${min_month}` : min_month}`}
            max={new Date().toISOString().slice(0, 7)} /* YYYY-MM */
            value={`${currentMonthYear}-${
              currentMonth < 10 ? `0${currentMonth}` : currentMonth
            }`} /* YYYY-MM */
            className="border border-gray-300 rounded-md p-1.5 focus:outline-none w-fit
            cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200
            text-sm"
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              setCurrentMonthYear(parseInt(year));
              setCurrentMonth(parseInt(month));
              fetchOverview({
                hasConstraint: true,
                month: parseInt(month),
                monthYear: parseInt(year),
              });
            }}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full py-4">
        {clickedButton === "overview" && (
          <Overview dashboardProps={dashboardProps} />
        )}

        {clickedButton === "monthly" && (
          <>
            {!loading && overview ? (
              <div className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
                <ExpensesTop5Monthly
                  amountByItem={overview.topFiveMostExpensiveItemThisMonth}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                  title="Top Contributors"
                />
              </div>
            ) : (
              <Card
                title="Top Contributors"
                // description="Loading your top 5 most expensive items..."
                className=""
                loading={true}
              />
            )}
            {!loading && overview ? (
              <div className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
                <ExpensesOverDays
                  overTheDaysThisMonth={overview.overTheDaysThisMonth}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                  title="Spending Over Days"
                />
              </div>
            ) : (
              <Card
                title="Spending Over Days"
                // description="Loading your expenses by category..."
                className=""
                loading={true}
              />
            )}
          </>
        )}

        {clickedButton === "yearly" && (
          <>
            {!loading && overview ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <ExpensesMonthlyBarChartCard
                  amountByMonth={overview.amountByMonth}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                  title="Expense Summary"
                />
              </div>
            ) : (
              <Card
                title="Expense Summary"
                // description="Loading your monthly expenses..."
                className=""
                loading={true}
              />
            )}

            {/* Expenses by Category */}
            {!loading && overview ? (
              <div className="col-span-1 md:col-span-1 lg:col-span-1">
                <ExpensesChartCard
                  amountByCategory={overview.amountByCategory}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                  title="Spending by Category"
                />
              </div>
            ) : (
              <Card
                title="Spending by Category"
                // description="Loading your expenses by category..."
                className=""
                loading={true}
              />
            )}

            {!loading && overview ? (
              <div className="col-span-1 md:col-span-1 lg:col-span-1">
                <ExpensesMonthlyLineChartCard
                  amountByMonth={overview.monthlyCategoryExpense}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                  title="Monthly Spending Trends"
                />
              </div>
            ) : (
              <Card
                title="Monthly Spending Trends"
                // description="Loading your monthly expenses..."
                className=""
                loading={true}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
