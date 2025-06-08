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

// {
//     "userId": "5c0ae527-da68-4da1-9714-f6a31edf009d",
//     "amountByCategory": {
//         "Utilities": 984.0,
//         "Groceries": 18.0,
//         "Hair Cut": 101.0
//     },
//     "amountByMonth": {
//         "January": 21.0,
//         "April": 30.0,
//         "June": 1052.0
//     },
//     "totalCount": 7,
//     "mostFrequentCategory": "Hair Cut",
//     "totalCategories": 3,
//     "mostFrequentCategoryCount": 3,
//     "thisMonthTotalExpense": 1052.0,
//     "comparedToLastMonthExpense": 1052.0,
//     "categoryCount": {
//         "Utilities": 2,
//         "Groceries": 2,
//         "Hair Cut": 3
//     },
//     "averageMonthlyExpense": 367.6666666666667,
//     "topTenMostExpenseiveItemThisMonth": {
//         "Laptop": 884.0,
//         "Electricity Bill": 100.0,
//         "Hair Cut": 50.0,
//         "Meals": 12.0,
//         "Eggs": 6.0
//     },
//     "totalAmount": 1103.0
// }

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.user);
  const token = FetchToken();
  const [overview, setOverview] = useState<ExpenseOverview | null>(null);

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
              <span>Total Spent This Year</span>
              <span className="font-semibold">
                {currencyMapper(user?.currency || "USD")}
                {overview.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Total Transactions</span>
              <span className="font-semibold">{overview.totalCount}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Most Frequent Category</span>
              <span className="font-semibold">
                {overview.mostFrequentCategory || "N/A"}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Most Frequent Category Count</span>
              <span className="font-semibold">
                {overview.mostFrequentCategoryCount}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Total Categories</span>
              <span className="font-semibold">{overview.totalCategories}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Avg Monthly Expense</span>
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
              <span>This Month's Expense</span>
              <span className="font-semibold">
                {currencyMapper(user?.currency || "USD")}
                {overview.thisMonthTotalExpense.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Change from Last Month</span>
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

            <div className="flex justify-between text-gray-700">
              <span>Avg Monthly Expense</span>
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
