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
  Legend,
  LineChart,
} from "recharts";
import Card from "@/components/card";

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

const height = 350;
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
}: ExpensesChartCardProps & { darkMode?: boolean } & { currency?: string }) {
  const chartData = Object.entries(amountByCategory || {}).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  return (
    <Card
      title="Spending by Category"
      // description="Your expense distribution across categories"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={margin}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={0}
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
          <Legend />
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
    </Card>
  );
}

// ========== Bar Chart: Monthly Spending ==========
export function ExpensesMonthlyBarChartCard({
  amountByMonth,
  darkMode,
  currency = "USD",
}: ExpensesMonthlyChartProps & { darkMode: boolean } & { currency?: string }) {
  const chartData = Object.entries(amountByMonth || {}).map(
    ([month, amount]) => ({
      name: month,
      amount: amount,
      trend: amount,
    })
  );
  console.log(darkMode, currency);
  return (
    <Card
      title="Expense Summary"
      // description="Insights into your spending patterns"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={margin}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={darkMode ? "#999999" : "#ccc"}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
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
          <Bar
            dataKey="amount"
            fill="#4ade80"
            radius={[4, 4, 0, 0]}
            barSize={50}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#4ade80"
            strokeWidth={2}
            dot
            activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ========== Line Chart: Monthly Expense Trend ==========
export function ExpensesMonthlyLineChartCard({
  amountByMonth,
  darkMode,
  currency = "USD",
}: ExpensesMonthlyCategoryChartProps & { darkMode: boolean } & {
  currency?: string;
}) {
  const chartData = Object.entries(amountByMonth).map(
    ([month, categories]) => ({
      name: month,
      ...categories,
    })
  );

  return (
    <Card
      title="Monthly Spending Trends"
      // description="Visual breakdown of expenses by category over the year"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <ComposedChart data={chartData} margin={margin}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? "#999999" : "#ccc"}
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
            <Legend />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}

// ========== Bar Chart: Top 5 Items This Month ==========
export function ExpensesTop5Monthly({
  amountByItem,
  darkMode,
  currency = "USD",
}: ExpensesTop5MonthlyProps & { darkMode: boolean } & { currency?: string }) {
  const chartData = Object.entries(amountByItem || {}).map(
    ([item, amount]) => ({
      name: item,
      value: amount,
    })
  );

  return (
    <Card
      title="Top 5 Costliest Items"
      // description="Highlights your biggest spending items for the current period"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout="horizontal" margin={margin}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={darkMode ? "#999999" : "#ccc"}
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
    </Card>
  );
}

export function ExpensesOverDays({
  overTheDaysThisMonth,
  darkMode,
  currency = "USD",
}: OverTheDaysProps & { darkMode: boolean } & { currency?: string }) {
  // Transform to recharts-friendly format
  const chartData = Object.entries(overTheDaysThisMonth || {}).map(
    ([day, amount]) => ({
      day,
      value: amount,
    })
  );

  return (
    <Card
      title="Spending Over Days"
      // description="Tracks your expenses day by day for the current month"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={margin}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={darkMode ? "#999999" : "#ccc"}
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
            contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }}
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
    </Card>
  );
}
