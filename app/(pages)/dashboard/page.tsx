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
import { currencyMapper } from "@/utils/currencyMapper";

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
          <Card
            title="Expenses Summary"
            description="Overview of your expenses"
            className=""
          >
            <p className="text-gray-600">
              Total Money Spent:{" "}
              {`${currencyMapper(
                user?.currency || "USD"
              )} ${overview.totalAmount.toFixed(2)}`}
            </p>
            <p className="text-gray-600">
              Total Transactions: {overview.totalCount}
            </p>
          </Card>
        ) : (
          <Card
            title="Expenses Summary"
            description="Loading your expenses overview..."
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
      </div>
    </>
  );
}
