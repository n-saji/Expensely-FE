"use client";
import { currencyMapper } from "@/utils/currencyMapper";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
  LineChart,
  // Legend,
} from "recharts";
import CardTemplate from "@/components/card";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import useMediaQuery from "@/utils/useMediaQuery";

const COLORS = [
  "#00C49F",
  "#FF8042",
  "#FFBB28",
  "#0088FE",
  "#FF4444",
  "#AA66CC",
  "#FF6699",
  "#FFBB33",
  "#FF8042",
  "#00C49F",
  "#FFBB28",
  "#0088FE",
];

const height = 280;
const height_small = 220;
const margin = { left: -15, right: 12 };

// ========== Props Interfaces ==========
interface ExpensesChartCardProps {
  amountByCategory: Record<string, number>;
}

interface ExpensesMonthlyCategoryChartProps {
  amountByMonth: Record<string, Record<string, number>>;
}

interface ExpensesMonthlyChartProps {
  amountByMonth: Record<string, number>;
}

interface ExpensesTop5MonthlyProps {
  amountByItem: Record<string, number>;
}

interface OverTheDaysProps {
  overTheDaysThisMonth: Record<string, number>; // { "1": 50.25, "2": 75.00, ... }
}

// ========== Pie Chart: Category-wise Spending ==========
export default function ExpensesChartCard({
  amountByCategory,
  darkMode = false,
  currency = "USD",
  title,
  setCurrentYearForYearly,
  currentYearForYearly,
  min_year,
}: ExpensesChartCardProps & { darkMode?: boolean } & { currency?: string } & {
  title?: string;
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
}) {
  const chartData = Object.entries(amountByCategory || {}).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  // const isDesktop = useMediaQuery("(min-width: 530px)");

  return (
    // ========== Pie Chart: Yearly Spending ==========
    <Card
      // description="Your expense distribution across categories"
      className="w-full"
    >
      <CardHeader>
        <CardTitle>{title || "Spending by Category"}</CardTitle>
        <CardAction>
          {setCurrentYearForYearly && currentYearForYearly && min_year && (
            <Select
              value={currentYearForYearly.toString()}
              onValueChange={(value) =>
                setCurrentYearForYearly(parseInt(value, 10))
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Year</SelectLabel>
                  {Array.from(
                    {
                      length: new Date().getFullYear() - (min_year || 2020) + 1,
                    },
                    (_, i) => (min_year || 2020) + i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex justify-center items-center w-full h-full">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart >
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            {/* <Legend
              // verticalAlign={isDesktop ? "middle" : "bottom"}
              // layout={isDesktop ? "vertical" : "horizontal"}
              // align={isDesktop ? "right" : "center"}
              verticalAlign="bottom"
              layout="horizontal"
              align="center"
            /> */}
            <Tooltip
              itemStyle={{ color: darkMode ? "#fff" : "#fff" }}
              contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              formatter={(value: number, name: string) => [
                `${currencyMapper(currency)}${value.toFixed(2)}`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ========== Bar Chart: Yearly Spending ==========
export function ExpensesMonthlyBarChartCard({
  amountByMonth,
  darkMode,
  currency = "USD",
  title,
  setCurrentYearForYearly,
  currentYearForYearly,
  min_year,
}: ExpensesMonthlyChartProps & { darkMode: boolean } & { currency?: string } & {
  title?: string;
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
}) {
  const chartData = Object.entries(amountByMonth || {}).map(
    ([month, amount]) => ({
      name: month,
      amount: amount,
      trend: amount,
    })
  );

  return (
    <Card
      // description="Insights into your spending patterns"
      className="w-full"
    >
      <CardHeader>
        <CardTitle>{title || "Expense Summary"}</CardTitle>
        <CardAction>
          {setCurrentYearForYearly && currentYearForYearly && min_year && (
            <Select
              value={currentYearForYearly.toString()}
              onValueChange={(value) =>
                setCurrentYearForYearly(parseInt(value, 10))
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Year</SelectLabel>
                  {Array.from(
                    {
                      length: new Date().getFullYear() - (min_year || 2020) + 1,
                    },
                    (_, i) => (min_year || 2020) + i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height_small}>
          <ComposedChart data={chartData} margin={margin}>
            <CartesianGrid
              stroke={darkMode ? "#5f6266" : "#ccc"}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
              tickFormatter={(name: string) =>
                name.length > 3 ? `${name.slice(0, 3)}` : name
              }
            />
            <YAxis
              tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
              tickFormatter={(value: number) =>
                `${currencyMapper(currency)}${value.toFixed(0)}`
              }
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              formatter={(value: number, name: string) => {
                if (name === "amount")
                  return [
                    `${currencyMapper(currency)}${value.toFixed(2)}`,
                    "Amount",
                  ];
                if (name === "trend") return [];
              }}
            />
            {/* <Bar
              dataKey="amount"
              fill="#4ade80"
              radius={[4, 4, 0, 0]}
              barSize={50}
            /> */}
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#4ade80"
              strokeWidth={2}
              dot
              activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ========== Line Chart: Yearly Expense Trend ==========
export function ExpensesMonthlyLineChartCard({
  amountByMonth,
  darkMode,
  currency = "USD",
  title,
  setCurrentYearForYearly,
  currentYearForYearly,
  min_year,
}: ExpensesMonthlyCategoryChartProps & { darkMode: boolean } & {
  currency?: string;
} & { title?: string } & {
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
}) {
  const chartData = Object.entries(amountByMonth).map(
    ([month, categories]) => ({
      name: month,
      ...categories,
    })
  );

  return (
    <Card
      // description="Visual breakdown of expenses by category over the year"
      className="w-full"
    >
      <CardHeader>
        <CardTitle>{title || "Monthly Spending Trends"}</CardTitle>
        <CardAction>
          {setCurrentYearForYearly && currentYearForYearly && min_year && (
            <Select
              value={currentYearForYearly.toString()}
              onValueChange={(value) =>
                setCurrentYearForYearly(parseInt(value, 10))
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Year</SelectLabel>
                  {Array.from(
                    {
                      length: new Date().getFullYear() - (min_year || 2020) + 1,
                    },
                    (_, i) => (min_year || 2020) + i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height_small}>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <ComposedChart data={chartData} margin={margin}>
              <CartesianGrid
                strokeDasharray="1"
                stroke={darkMode ? "#5f6266" : "#ccc"}
                // strokeLinejoin="round"
                // horizontal={false}
                vertical={false}
                height={1}
              />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                tickFormatter={(name: string) => name.slice(0, 1)}
              />
              <YAxis
                tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                tickFormatter={(value: number) =>
                  `${currencyMapper(currency)}${value.toFixed(0)}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                formatter={(value: number) =>
                  `${currencyMapper(currency)}${value.toFixed(2)}`
                }
              />
              {Object.keys(chartData[0])
                .filter((key) => key !== "name")
                .map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot
                  />
                ))}
              {/* <Legend /> */}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ========== Bar Chart: Top 5 Items This Month ==========
export function ExpensesTop5Monthly({
  amountByItem,
  darkMode,
  currency = "USD",
  title,
}: ExpensesTop5MonthlyProps & { darkMode: boolean } & { currency?: string } & {
  title?: string;
}) {
  const chartData = Object.entries(amountByItem || {}).map(
    ([item, amount]) => ({
      name: item,
      value: amount,
    })
  );

  return (
    <CardTemplate
      title={title || "Top Contributors"}
      // description="Highlights your biggest spending items for the current period"
      className="w-full"
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} layout="horizontal" margin={margin}>
            <CartesianGrid
              // strokeDasharray="3 3"
              // stroke={darkMode ? "#999999" : "#ccc"}
              stroke={darkMode ? "#5f6266" : "#ccc"}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
              tickFormatter={(value: string) =>
                value.length > 10 ? `${value.slice(0, 10)}...` : value
              }
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
              tickFormatter={(value: number) =>
                `${currencyMapper(currency)}${value.toFixed(0)}`
              }
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              // itemStyle={{ color: "#fff" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              formatter={(value: number) =>
                `${currencyMapper(currency)}${value.toFixed(2)}`
              }
            />
            <Bar
              dataKey="value"
              fill="#4ade80"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </CardTemplate>
  );
}

export function ExpensesOverDays({
  overTheDaysThisMonth,
  darkMode,
  currency = "USD",
  title,
  setCurrentMonth,
  setCurrentMonthYear,
  currentMonth,
  currentMonthYear,
  min_year,
  min_month,
}: OverTheDaysProps & { darkMode: boolean } & { currency?: string } & {
  title?: string;
  setCurrentMonth: (month: number) => void;
  setCurrentMonthYear: (monthYear: number) => void;
  currentMonth: number;
  currentMonthYear: number;
  min_year: number;
  min_month: number;
}) {
  // Transform to recharts-friendly format
  const chartData = Object.entries(overTheDaysThisMonth || {}).map(
    ([day, amount]) => ({
      day,
      value: amount,
    })
  );

  return (
    <Card
      title={title || "Spending Over Days"}
      // description="Tracks your expenses day by day for the current month"
      className="w-full"
    >
      <CardHeader>
        <CardTitle>{title || "Spending Over Days"}</CardTitle>
        <CardAction>
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
            }}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={height_small}>
            <LineChart data={chartData} margin={margin}>
              <CartesianGrid
                stroke={darkMode ? "#5f6266" : "#ccc"}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                tickFormatter={(value: string) =>
                  `${value}${(() => {
                    if (value === "1") return "st";
                    if (value === "2") return "nd";
                    if (value === "3") return "rd";
                    return "th";
                  })()}`
                }
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                tickFormatter={(value: number) =>
                  `${currencyMapper(currency)}${value.toFixed(0)}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
                cursor={{ stroke: "#4ade80", strokeWidth: 2 }}
                formatter={(value: number) =>
                  `${currencyMapper(currency)}${value.toFixed(2)}`
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4ade80"
                strokeWidth={3}
                dot={{ r: 4, fill: "#4ade80" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] w-full">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
