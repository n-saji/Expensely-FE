"use client";

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
  LineChart,
  Line,
  ComposedChart,
  Legend,
} from "recharts";
import Card from "@/components/card";

const COLORS = [
  "#00C49F",
  "#FF8042",
  "#FFBB28",
  "#0088FE",
  "#FF4444",
  "#AA66CC",
];

// ========== Props Interfaces ==========
interface ExpensesChartCardProps {
  amountByCategory: Record<string, number>;
}

interface ExpensesMonthlyChartProps {
  amountByMonth: Record<string, number>;
}

interface ExpensesTop5MonthlyProps {
  amountByItem: Record<string, number>;
}

// ========== Pie Chart: Category-wise Spending ==========
export default function ExpensesChartCard({
  amountByCategory,
}: ExpensesChartCardProps) {
  const chartData = Object.entries(amountByCategory || {}).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  return (
    <Card
      title="Spending by Category"
      description="Your expense distribution across categories"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            label ={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
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
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }}
            // labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            formatter={(value: number , name: string) => [`$${value.toFixed(2)}`, null]}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ========== Bar Chart: Monthly Spending ==========
export function ExpensesMonthlyBarChartCard({
  amountByMonth,
}: ExpensesMonthlyChartProps) {
  const chartData = Object.entries(amountByMonth || {}).map(
    ([month, amount]) => ({
      name: month,
      amount: amount,
      trend: amount,
    })
  );

  return (
    <Card
      title="Monthly Expenses (Bar)"
      description="Visualized monthly spending with bar chart"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }}
            labelStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            formatter={(value: number, name: string) => {
              if (name === "amount") return [`$${value.toFixed(2)}`, "Amount"];
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
}: ExpensesMonthlyChartProps) {
  const chartData = Object.entries(amountByMonth || {}).map(
    ([month, amount]) => ({
      name: month,
      value: amount,
    })
  );

  return (
    <Card
      title="Monthly Expenses (Line)"
      description="Track your expenses over time"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }}
            labelStyle={{ color: "#fff" }}
            // itemStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4ade80"
            strokeWidth={2}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ========== Bar Chart: Top 5 Items This Month ==========
export function ExpensesTop5Monthly({
  amountByItem,
}: ExpensesTop5MonthlyProps) {
  const chartData = Object.entries(amountByItem || {}).map(
    ([item, amount]) => ({
      name: item,
      value: amount,
    })
  );

  return (
    <Card
      title="Top 5 Most Expensive Items This Month"
      description="Your highest spending items this month"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            fontSize={12}
            tickFormatter={(value: string) =>
              value.length > 10 ? `${value.slice(0, 10)}...` : value
            }
            interval={0}
          />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }}
            labelStyle={{ color: "#fff" }}
            // itemStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
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
