"use client";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import ExpensesChartCard, {
  ExpensesMonthlyBarChartCard,
  ExpensesMonthlyLineChartCard,
  ExpensesOverDays,
} from "@/components/ExpenseChartCard";
import { ExpenseOverview } from "@/global/dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { currencyMapper } from "@/utils/currencyMapper";
import { Skeleton } from "@/components/ui/skeleton";

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
  const token = FetchToken();
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
      console.log(loadingMonth, loadingYear, type);
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
    <div className="flex flex-col md:flex-row w-full gap-6 h-full">
      <div className="flex-1/3 grid grid-cols-1 gap-4 w-full h-full">
        {overview ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {new Date()
                  .toLocaleString("default", { month: "long" })
                  .toLocaleUpperCase()}{" "}
                SUMMARY
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <Label className="text-muted-foreground">
                    Total Expenses
                  </Label>
                  <p className="text-lg font-semibold font-mono">
                    {currencyMapper(user?.currency || "USD")}
                    {overview?.thisMonthTotalExpense.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Change from Last Month
                  </Label>
                  <p className="text-lg font-semibold font-mono">
                    <span
                      className={
                        overview!.lastMonthTotalExpense -
                          overview!.thisMonthTotalExpense >=
                        0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {currencyMapper(user?.currency || "USD")}

                      {Math.abs(
                        overview!.thisMonthTotalExpense -
                          overview!.lastMonthTotalExpense
                      ).toFixed(2)}
                    </span>{" "}
                    <span className="text-sm font-normal">
                      {overview!.lastMonthTotalExpense === 0
                        ? "(0%)"
                        : `(${(
                            ((overview!.thisMonthTotalExpense -
                              overview!.lastMonthTotalExpense) /
                              overview!.lastMonthTotalExpense) *
                            100
                          ).toFixed(2)}%) ${
                            overview!.thisMonthTotalExpense -
                              overview!.lastMonthTotalExpense >=
                            0
                              ? "↑"
                              : "↓"
                          }
`}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SkeletonLoader title="MONTHLY SUMMARY" className="h-[150px]" />
        )}

        {overview ? (
          <Card>
            <CardHeader>
              <CardTitle>YEARLY SUMMARY</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <Label className="text-muted-foreground">Total Spent</Label>
                  <p className="text-lg font-semibold font-mono">
                    {currencyMapper(user?.currency || "USD")}
                    {overview?.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Average Monthly Spend
                  </Label>
                  <p className="text-lg font-semibold font-mono">
                    {currencyMapper(user?.currency || "USD")}
                    {overview?.averageMonthlyExpense.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SkeletonLoader title="YEARLY SUMMARY" className="h-[150px]" />
        )}

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
      </div>
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

        {/* <Card className="h-[250px]">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Expense isDemo={true} />
          </CardContent>
        </Card> */}
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
    </div>
  );
}

// <div className="flex gap-4 w-full max-md:flex-col">
//   <div className="flex gap-3 items-start w-full flex-wrap">
//     <button
//       className={`dashboard-button ${
//         clickedButton === "overview" ? "dashboard-button-active" : ""
//       }`}
//       onClick={() => handleButtonClick("overview")}
//     >
//       Overview
//     </button>
//     <button
//       className={`dashboard-button ${
//         clickedButton === "yearly" ? "dashboard-button-active" : ""
//       }`}
//       onClick={() => handleButtonClick("yearly")}
//     >
//       Yearly
//     </button>
//     <button
//       className={`dashboard-button ${
//         clickedButton === "monthly" ? "dashboard-button-active" : ""
//       }`}
//       onClick={() => handleButtonClick("monthly")}
//     >
//       Monthly
//     </button>
//   </div>
//   {clickedButton === "yearly" && overview?.earliestStartYear !== null && (
//     <select
//       className="border border-gray-300 rounded-md px-1.5 focus:outline-none w-fit
//       cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200
//       text-sm"
//       defaultValue={currentYearForYearly}
//       onChange={(e) => {
//         setCurrentYearForYearly(parseInt(e.target.value));
//         fetchOverview({
//           hasConstraint: true,
//           yearly: parseInt(e.target.value),
//         });
//       }}
//     >
//       {Array.from({ length: currentYear - min_year + 1 }, (_, i) => {
//         const year = currentYear - i;
//         return (
//           <option key={year} value={year}>
//             {year}
//           </option>
//         );
//       })}
//     </select>
//   )}
//   {clickedButton === "monthly" &&
//     overview?.earliestStartMonth !== null && (
//       <input
//         type="month"
//         min={`${min_year}-${
//           min_month < 10 ? `0${min_month}` : min_month
//         }`}
//         max={new Date().toISOString().slice(0, 7)} /* YYYY-MM */
//         value={`${currentMonthYear}-${
//           currentMonth < 10 ? `0${currentMonth}` : currentMonth
//         }`} /* YYYY-MM */
//         className="border border-gray-300 rounded-md p-1.5 focus:outline-none w-fit
//       cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200
//       text-sm"
//         onChange={(e) => {
//           const [year, month] = e.target.value.split("-");
//           setCurrentMonthYear(parseInt(year));
//           setCurrentMonth(parseInt(month));
//           fetchOverview({
//             hasConstraint: true,
//             month: parseInt(month),
//             monthYear: parseInt(year),
//           });
//         }}
//       />
//     )}
// </div>

// <div className="w-full flex flex-wrap py-4 gap-6">
//   {clickedButton === "overview" && (
//     <Overview dashboardProps={dashboardProps} />
//   )}

//   {clickedButton === "monthly" && (
//     <>
//       {!loading && overview ? (
//         <div className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
//           <ExpensesTop5Monthly
//             amountByItem={overview.topFiveMostExpensiveItemThisMonth}
//             darkMode={user.theme === "dark"}
//             currency={user.currency}
//             title="Top Contributors"
//           />
//         </div>
//       ) : (
//         <CardTemplate
//           title="Top Contributors"
//           // description="Loading your top 5 most expensive items..."
//           className=""
//           loading={true}
//         />
//       )}
//       {!loading && overview ? (
//         <div className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
//           <ExpensesOverDays
//             overTheDaysThisMonth={overview.overTheDaysThisMonth}
//             darkMode={user.theme === "dark"}
//             currency={user.currency}
//             title="Spending Over Days"
//           />
//         </div>
//       ) : (
//         <CardTemplate
//           title="Spending Over Days"
//           // description="Loading your expenses by category..."
//           className=""
//           loading={true}
//         />
//       )}
//     </>
//   )}

//   {clickedButton === "yearly" && (
//     <>
//       {!loading && overview ? (
//         <div className="col-span-1 md:col-span-2 lg:col-span-2">
//           <ExpensesMonthlyBarChartCard
//             amountByMonth={overview.amountByMonth}
//             darkMode={user.theme === "dark"}
//             currency={user.currency}
//             title="Expense Summary"
//           />
//         </div>
//       ) : (
//         <CardTemplate
//           title="Expense Summary"
//           // description="Loading your monthly expenses..."
//           className=""
//           loading={true}
//         />
//       )}

//       {/* Expenses by Category */}
//       {!loading && overview ? (
//         <div className="col-span-1 md:col-span-1 lg:col-span-1">
//           <ExpensesChartCard
//             amountByCategory={overview.amountByCategory}
//             darkMode={user.theme === "dark"}
//             currency={user.currency}
//             title="Spending by Category"
//           />
//         </div>
//       ) : (
//         <CardTemplate
//           title="Spending by Category"
//           // description="Loading your expenses by category..."
//           className=""
//           loading={true}
//         />
//       )}

//       {!loading && overview ? (
//         <div className="col-span-1 md:col-span-1 lg:col-span-1">
//           <ExpensesMonthlyLineChartCard
//             amountByMonth={overview.monthlyCategoryExpense}
//             darkMode={user.theme === "dark"}
//             currency={user.currency}
//             title="Monthly Spending Trends"
//           />
//         </div>
//       ) : (
//         <CardTemplate
//           title="Monthly Spending Trends"
//           // description="Loading your monthly expenses..."
//           className=""
//           loading={true}
//         />
//       )}
//     </>
//   )}
// </div>
