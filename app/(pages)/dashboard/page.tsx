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
  ExpensesTop10Monthly,
} from "@/components/ExpenseChartCard";
import { currencyMapper } from "@/utils/currencyMapper";

interface ExpenseOverview {
  userId: string;
  totalAmount: number;
  totalCount: number;
  amountByCategory: Record<string, number>;
  amountByMonth: Record<string, number>;
  mostFrequentCategory: string;
  totalCategories: number;
  mostFrequentCategoryCount: number;
  thisMonthTotalExpense: number;
  comparedToLastMonthExpense: number;
  categoryCount: Record<string, number>;
  averageMonthlyExpense: number;
  topTenMostExpenseiveItemThisMonth: Record<string, number>;
}

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.user);
  const token = FetchToken();
  const [overview, setOverview] = useState<ExpenseOverview | null>(null);
  const [newUser, setNewUser] = useState<boolean>(false);

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
        <h1 className="text-2xl text-gray-700 p-4">Welcome to Expensely!</h1>
        <p className="text-gray-600 p-2">
          {`It looks like you haven't added any expenses yet.`}
        </p>
        <p className="text-gray-600 p-2 text-center">
          Start tracking your expenses by adding your first expense.
        </p>

      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {/* Yearly Overview */}
        {overview ? (
          <Card
            title="Expenses Summary For this Year"
            description="Overview of your expenses"
            className="space-y-4"
          >
            <div className="flex justify-between text-gray-700">
              <span>Total Spent This Year &nbsp;</span>
              <span className="font-semibold">
                {currencyMapper(user?.currency || "USD")}{" "}
                {overview.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Total Transactions &nbsp;</span>
              <span className="font-semibold">{overview.totalCount}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Most Frequent Category &nbsp;</span>
              <span className="font-semibold">
                {overview.mostFrequentCategory || "N/A"}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Most Frequent Category Count &nbsp;</span>
              <span className="font-semibold">
                {overview.mostFrequentCategoryCount}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Total Categories &nbsp;</span>
              <span className="font-semibold">{overview.totalCategories}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Avg Monthly Expense &nbsp;</span>
              <span className="font-semibold">
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

        {overview ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <ExpensesMonthlyBarChartCard
              amountByMonth={overview.amountByMonth}
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

        {overview ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <ExpensesTop10Monthly
              amountByItem={overview.topTenMostExpenseiveItemThisMonth}
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

        {/* Monthly Overview */}
        {overview ? (
          <Card
            title="Expenses Summary For this Month"
            description="Overview of your expenses"
            className="space-y-4"
          >
            <div className="flex justify-between text-gray-700">
              <span>{`This Month's Expense &nbsp;`}</span>
              <span className="font-semibold">
                {currencyMapper(user?.currency || "USD")}
                {overview.thisMonthTotalExpense.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Change from Last Month &nbsp;</span>
              <span
                className={`font-semibold ${
                  overview.comparedToLastMonthExpense >= 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {overview.comparedToLastMonthExpense >= 0 ? "+" : "-"}
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

        {overview ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <ExpensesMonthlyLineChartCard
              amountByMonth={overview.amountByMonth}
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
        {overview ? (
          <ExpensesChartCard amountByCategory={overview.amountByCategory} />
        ) : (
          <Card
            title="Expenses by Category"
            description="Loading your expenses by category..."
            className=""
            loading={true}
          />
        )}
      </div>
    </>
  );
}
