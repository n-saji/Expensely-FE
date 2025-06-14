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

interface ExpensesTop10MonthlyProps {
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
            label
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#333" }} />
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
    })
  );

  return (
    <Card
      title="Monthly Expenses (Bar)"
      description="Visualized monthly spending with bar chart"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name"  />
          <YAxis  />
          <Tooltip contentStyle={{ backgroundColor: "#333" }} />
          <Bar
            dataKey="amount"
            fill="#4ade80"
            radius={[4, 4, 0, 0]}
            barSize={50}
          />
        </BarChart>
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
          <XAxis dataKey="name"  />
          <YAxis  />
          <Tooltip contentStyle={{ backgroundColor: "#333" }} />
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

// ========== Bar Chart: Top 10 Items This Month ==========
export function ExpensesTop10Monthly({
  amountByItem,
}: ExpensesTop10MonthlyProps) {
  const chartData = Object.entries(amountByItem || {}).map(
    ([item, amount]) => ({
      name: item,
      value: amount,
    })
  );

  return (
    <Card
      title="Top 10 Most Expensive Items This Month"
      description="Your highest spending items this month"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name"  />
          <YAxis  />
          <Tooltip contentStyle={{ backgroundColor: "#333" }} />
          <Bar
            dataKey="value"
            fill="#4ade80"
            radius={[4, 4, 0, 0]}
            barSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
