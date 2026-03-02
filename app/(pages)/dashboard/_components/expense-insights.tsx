"use client";

import CardComponent from "@/components/CardComponent";
import PieChartComp, {
  ExpensesOverDays,
  ExpensesTop5Monthly,
  YearlyExpenseLineChartV2,
} from "@/components/ExpenseChartCard";
import { OverviewEnum, ExpenseOverview, ExpenseOverviewV2 } from "@/global/dto";
import { currencyMapper } from "@/utils/currencyMapper";
import { TabsContent } from "@/components/ui/tabs";

interface ExpenseInsightsProps {
  userCurrency?: string;
  userTheme?: string;
  overview: ExpenseOverview | null;
  overviewV2: ExpenseOverviewV2 | null;
  overviewV2Loading: boolean;
  itemName: string | null;
  itemValue: number | null;
  minYear: number;
  minMonth: number;
  loadingYear: boolean;
  loadingMonth: boolean;
  currentYearForYearly: number;
  setCurrentYearForYearly: React.Dispatch<React.SetStateAction<number>>;
  currentMonth: number;
  currentMonthYear: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  setCurrentMonthYear: React.Dispatch<React.SetStateAction<number>>;
  overviewParams: { count?: number; type?: OverviewEnum };
  setOverviewParams: React.Dispatch<
    React.SetStateAction<{ count?: number; type?: OverviewEnum }>
  >;
}

export default function ExpenseInsightsSection({
  userCurrency,
  userTheme,
  overview,
  overviewV2,
  overviewV2Loading,
  itemName,
  itemValue,
  minYear,
  minMonth,
  loadingYear,
  loadingMonth,
  currentYearForYearly,
  setCurrentYearForYearly,
  currentMonth,
  currentMonthYear,
  setCurrentMonth,
  setCurrentMonthYear,
  overviewParams,
  setOverviewParams,
}: ExpenseInsightsProps) {
  return (
    <TabsContent value="expense" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <CardComponent
          title="This Year's Expense"
          numberData={`${currencyMapper(userCurrency || "USD")}${overview?.totalAmount.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          )}`}
          description={`On an average you have spent ${currencyMapper(
            userCurrency || "USD",
          )}${overview?.averageMonthlyExpense.toFixed(2)} every month.`}
          loading={overview === null}
        />

        <CardComponent
          title="This month most expensive item"
          numberData={itemName && itemValue ? `${itemName}` : "N/A"}
          description={
            itemName
              ? `You have spent ${currencyMapper(userCurrency || "USD")}${(
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

      <YearlyExpenseLineChartV2
        amountByMonth={overviewV2?.amountByMonthV2}
        amountByMonthV2={overviewV2?.monthlyCategoryExpenseV2}
        darkMode={userTheme === "dark"}
        title="Expense Trends"
        currency={userCurrency}
        setOverviewParams={setOverviewParams}
        overviewParams={overviewParams}
        loading={overviewV2Loading || overviewV2 === null}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <PieChartComp
          amountByCategory={overview?.amountByCategory}
          currency={userCurrency}
          title="Spending by Category"
          setCurrentYearForYearly={setCurrentYearForYearly}
          currentYearForYearly={currentYearForYearly}
          min_year={minYear}
          loading={loadingYear || overview === null}
        />

        <ExpensesOverDays
          overTheDaysThisMonth={overview?.overTheDaysThisMonth}
          darkMode={userTheme === "dark"}
          currency={userCurrency}
          title="Spending Over Days"
          setCurrentMonth={setCurrentMonth}
          setCurrentMonthYear={setCurrentMonthYear}
          currentMonth={currentMonth}
          currentMonthYear={currentMonthYear}
          min_year={minYear}
          min_month={minMonth}
          loading={loadingMonth || overview === null}
        />
      </div>

      <ExpensesTop5Monthly
        amountByItem={overview?.topFiveMostExpensiveItemThisMonth || {}}
        darkMode={userTheme === "dark"}
        currency={userCurrency}
        title="Top Expense Contributors"
      />
    </TabsContent>
  );
}
