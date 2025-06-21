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
} from "@/components/ExpenseChartCard";
import { DashboardPageProps, ExpenseOverview } from "@/global/dto";
import Overview from "./overview";

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.user);
  const token = FetchToken();
  const [overview, setOverview] = useState<ExpenseOverview | null>(null);
  const [newUser, setNewUser] = useState<boolean>(false);
  const [clickedButton, setClickedButton] = useState<string>("overview");
  const dashboardProps: DashboardPageProps = {
    userId: user.id,
    token: token,
    user: user,
    overview: overview,
  };

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch(
          `${API_URL}/expenses/user/${user.id}/overview`,
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
        console.log("Expense overview data:", data);
        setOverview(data);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    if (user.id && token) {
      fetchOverview();
    }
  }, []);

  if (!user.isAuthenticated) {
    return (
      <div className="flex  items-center justify-center h-screen">
        <h1 className="text-2xl text-gray-700">Please log in to continue.</h1>
      </div>
    );
  }

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
  };

  return (
    <>
      <div className="flex gap-3 items-start w-full flex-wrap">
        <button
          className={`dashboard-button ${
            clickedButton === "overview"
              ? "border-green-700 bg-green-600/40 dark:bg-green-600/20"
              : ""
          }`}
          onClick={() => handleButtonClick("overview")}
        >
          Overview
        </button>
        <button
          className={`dashboard-button ${
            clickedButton === "yearly"
              ? "border-green-700 bg-green-600/40 dark:bg-green-600/20"
              : ""
          }`}
          onClick={() => handleButtonClick("yearly")}
        >
          Yearly
        </button>
        <button
          className={`dashboard-button ${
            clickedButton === "monthly"
              ? "border-green-700 bg-green-600/40 dark:bg-green-600/20"
              : ""
          }`}
          onClick={() => handleButtonClick("monthly")}
        >
          Monthly
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
        {clickedButton === "overview" && (
          <Overview dashboardProps={dashboardProps} />
        )}

        {clickedButton === "monthly" && (
          <>
            {overview ? (
              <div className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
                <ExpensesTop5Monthly
                  amountByItem={overview.topFiveMostExpensiveItemThisMonth}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                />
              </div>
            ) : (
              <Card
                title="Top 5 Most Expensive Items This Month"
                description="Loading your top 5 most expensive items..."
                className=""
                loading={true}
              />
            )}
          </>
        )}

        {clickedButton === "yearly" && (
          <>
            {overview ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <ExpensesMonthlyBarChartCard
                  amountByMonth={overview.amountByMonth}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                />
              </div>
            ) : (
              <Card
                title="Monthly Expenses (Bar)"
                description="Loading your monthly expenses..."
                className=""
                loading={true}
              />
            )}

            {/* Expenses by Category */}
            {overview ? (
              <div className="col-span-1 md:col-span-1 lg:col-span-1">
                <ExpensesChartCard
                  amountByCategory={overview.amountByCategory}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                />
              </div>
            ) : (
              <Card
                title="Expenses by Category"
                description="Loading your expenses by category..."
                className=""
                loading={true}
              />
            )}

            {overview ? (
              <div className="col-span-1 md:col-span-1 lg:col-span-1">
                <ExpensesMonthlyLineChartCard
                  amountByMonth={overview.monthlyCategoryExpense}
                  darkMode={user.theme === "dark"}
                  currency={user.currency}
                />
              </div>
            ) : (
              <Card
                title="Monthly Expenses (Line)"
                description="Loading your monthly expenses..."
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
