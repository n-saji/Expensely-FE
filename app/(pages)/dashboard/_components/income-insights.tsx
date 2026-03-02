"use client";

import CardComponent from "@/components/CardComponent";
import PieChartComp, {
  ExpensesOverDays,
  ExpensesTop5Monthly,
  YearlyExpenseLineChartV2,
} from "@/components/ExpenseChartCard";
import { OverviewEnum, IncomeOverview, ExpenseOverviewV2 } from "@/global/dto";
import { currencyMapper } from "@/utils/currencyMapper";
import { TabsContent } from "@/components/ui/tabs";

interface IncomeInsightsProps {
  userCurrency?: string;
  userTheme?: string;
  incomeOverview: IncomeOverview | null;
  incomeOverviewV2: ExpenseOverviewV2 | null;
  incomeOverviewV2Loading: boolean;
  incomeItemName: string | null;
  incomeItemValue: number | null;
  minIncomeYear: number;
  minIncomeMonth: number;
  loadingIncomeYear: boolean;
  loadingIncomeMonth: boolean;
  incomeCurrentYearForYearly: number;
  setIncomeCurrentYearForYearly: React.Dispatch<React.SetStateAction<number>>;
  incomeCurrentMonth: number;
  incomeCurrentMonthYear: number;
  setIncomeCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  setIncomeCurrentMonthYear: React.Dispatch<React.SetStateAction<number>>;
  incomeOverviewParams: { count?: number; type?: OverviewEnum };
  setIncomeOverviewParams: React.Dispatch<
    React.SetStateAction<{ count?: number; type?: OverviewEnum }>
  >;
}

export default function IncomeInsightsSection({
  userCurrency,
  userTheme,
  incomeOverview,
  incomeOverviewV2,
  incomeOverviewV2Loading,
  incomeItemName,
  incomeItemValue,
  minIncomeYear,
  minIncomeMonth,
  loadingIncomeYear,
  loadingIncomeMonth,
  incomeCurrentYearForYearly,
  setIncomeCurrentYearForYearly,
  incomeCurrentMonth,
  incomeCurrentMonthYear,
  setIncomeCurrentMonth,
  setIncomeCurrentMonthYear,
  incomeOverviewParams,
  setIncomeOverviewParams,
}: IncomeInsightsProps) {
  return (
    <TabsContent value="income" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <CardComponent
          title="This Year's Income"
          numberData={`${currencyMapper(userCurrency || "USD")}${incomeOverview?.totalAmount.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          )}`}
          description={`On an average you earned ${currencyMapper(
            userCurrency || "USD",
          )}${incomeOverview?.averageMonthlyIncome.toFixed(2)} per month.`}
          loading={incomeOverview === null}
        />

        <CardComponent
          title="This month top income item"
          numberData={
            incomeItemName && incomeItemValue ? `${incomeItemName}` : "N/A"
          }
          description={
            incomeItemName
              ? `Highest amount ${currencyMapper(userCurrency || "USD")}${(
                  incomeItemValue as number
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : ""
          }
          loading={incomeOverview === null}
        />
      </div>

      <YearlyExpenseLineChartV2
        amountByMonth={incomeOverviewV2?.amountByMonthV2}
        amountByMonthV2={incomeOverviewV2?.monthlyCategoryExpenseV2}
        darkMode={userTheme === "dark"}
        title="Income Trends"
        currency={userCurrency}
        setOverviewParams={setIncomeOverviewParams}
        overviewParams={incomeOverviewParams}
        loading={incomeOverviewV2Loading || incomeOverviewV2 === null}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <PieChartComp
          amountByCategory={incomeOverview?.amountByCategory}
          currency={userCurrency}
          title="Income by Category"
          setCurrentYearForYearly={setIncomeCurrentYearForYearly}
          currentYearForYearly={incomeCurrentYearForYearly}
          min_year={minIncomeYear}
          loading={loadingIncomeYear || incomeOverview === null}
        />

        <ExpensesOverDays
          overTheDaysThisMonth={incomeOverview?.overTheDaysThisMonth}
          darkMode={userTheme === "dark"}
          currency={userCurrency}
          title="Income Over Days"
          setCurrentMonth={setIncomeCurrentMonth}
          setCurrentMonthYear={setIncomeCurrentMonthYear}
          currentMonth={incomeCurrentMonth}
          currentMonthYear={incomeCurrentMonthYear}
          min_year={minIncomeYear}
          min_month={minIncomeMonth}
          loading={loadingIncomeMonth || incomeOverview === null}
        />
      </div>

      <ExpensesTop5Monthly
        amountByItem={incomeOverview?.topFiveMostIncomeItemThisMonth || {}}
        darkMode={userTheme === "dark"}
        currency={userCurrency}
        title="Top Income Contributors"
      />
    </TabsContent>
  );
}
