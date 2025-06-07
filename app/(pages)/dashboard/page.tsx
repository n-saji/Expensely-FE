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
} from "@/components/ExpenseChartCard";

interface ExpenseOverview {
  userId: string;
  totalAmount: number;
  totalCount: number;
  amountByCategory: Record<string, number>;
  amountByMonth: Record<string, number>;
}

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
        {overview ? (
          <>
            <Card
              title="Expenses Summary"
              description="Overview of your expenses"
              className=""
            >
              <p className="text-gray-600">
                Total Money Spent: ${overview.totalAmount}
              </p>
              <p className="text-gray-600">
                Total Transactions: {overview.totalCount}
              </p>
            </Card>
          </>
        ) : (
          <p className="text-gray-500">Loading data...</p>
        )}
        {overview ? (
          <>
            <ExpensesChartCard amountByCategory={overview.amountByCategory} />
          </>
        ) : (
          <p className="text-gray-500">Loading data...</p>
        )}

        {overview ? (
          <>
            <ExpensesMonthlyBarChartCard
              amountByMonth={overview.amountByMonth}
            />
          </>
        ) : (
          <p className="text-gray-500">Loading data...</p>
        )}
        {overview ? (
          <>
            <ExpensesMonthlyLineChartCard
              amountByMonth={overview.amountByMonth}
            />
          </>
        ) : (
          <p className="text-gray-500">Loading data...</p>
        )}
      </div>
    </>
  );
}
