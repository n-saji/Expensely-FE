"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { LineChart, Line } from "recharts";
import React from "react";
import Card from "@/components/card";

const COLORS = [
  "#00C49F",
  "#FF8042",
  "#FFBB28",
  "#0088FE",
  "#FF4444",
  "#AA66CC",
];

interface ExpensesChartCardProps {
  amountByCategory: Record<string, number>;
}

interface ExpensesMonthlyChartProps {
  amountByMonth: Record<string, number>;
}

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
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ExpensesMonthlyBarChartCard({
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
      title="Monthly Expenses (Bar)"
      description="Visualized monthly spending with bar chart"
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#4ade80" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

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
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
