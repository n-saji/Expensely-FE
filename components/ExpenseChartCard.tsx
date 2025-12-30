"use client";
import { currencyMapper } from "@/utils/currencyMapper";
import React, { useEffect, useState } from "react";
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
  Brush,
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
import { Label } from "./ui/label";
import DropDown from "./drop-down";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ExpenseOverview } from "@/global/dto";
import { Spinner } from "./ui/spinner";
import useMediaQuery from "@/utils/useMediaQuery";
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

const height = 280 as number;
const margin = { left: -15, right: 12 };

// ========== Props Interfaces ==========
export interface ExpensesChartCardProps {
  amountByCategory: Record<string, number>;
}

interface ExpensesTop5MonthlyProps {
  amountByItem: Record<string, number>;
}

type ChartRow = {
  name: string;
  [category: string]: number | string;
  amount: number | 0;
};

const SpinnerUI = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner className="text-muted-foreground h-6 w-6" />
    </div>
  );
};

const NoDataUI = () => {
  return (
    <div className={`flex items-center justify-center h-full w-full`}>
      <Label className="text-muted-foreground">No data available</Label>
    </div>
  );
};

// ========== Pie Chart: Category-wise Spending ==========
export default function PieChartComp({
  amountByCategory,
  darkMode = false,
  currency = "USD",
  title,
  setCurrentYearForYearly,
  currentYearForYearly,
  min_year,
  loading = false,
}: {
  amountByCategory?: ExpenseOverview["amountByCategory"];
  darkMode?: boolean;
  currency?: string;
  title?: string;
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
  loading?: boolean;
}) {
  const chartData = Object.entries(amountByCategory || {}).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  const isDesktop = useMediaQuery("(min-width: 530px)");

  return (
    <Card className="w-full">
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
              <SelectTrigger>
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
        {chartData.length === 0 ? (
          loading ? (
            <SpinnerUI />
          ) : (
            <NoDataUI />
          )
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {loading ? (
              <SpinnerUI />
            ) : (
              <PieChart
                margin={{
                  right: isDesktop ? 0 : 200,
                  top: isDesktop ? 0 : 10,
                }}
              >
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={isDesktop ? 100 : 90}
                  innerRadius={isDesktop ? 70 : 0}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  startAngle={isDesktop ? 0 : 90}
                  endAngle={isDesktop ? 360 : -90}
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
                  contentStyle={{
                    backgroundColor: "black",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                  formatter={(value: number) => [
                    `${currencyMapper(currency)}${value.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`,
                  ]}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
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
              contentStyle={{ backgroundColor: "black", borderRadius: "8px" }}
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
        <NoDataUI />
      )}
    </CardTemplate>
  );
}

// ========== Line Chart: Expenses Over Days This Month ==========
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
  loading = false,
}: {
  overTheDaysThisMonth?: ExpenseOverview["overTheDaysThisMonth"];
  darkMode: boolean;
  currency?: string;
  title?: string;
  setCurrentMonth: (month: number) => void;
  setCurrentMonthYear: (monthYear: number) => void;
  currentMonth: number;
  currentMonthYear: number;
  min_year: number;
  min_month: number;
  loading: boolean;
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
      <CardHeader className="flex flex-wrap justify-between items-center gap-3">
        <CardTitle>{title || "Spending Over Days"}</CardTitle>
        <CardAction>
          <div className="flex gap-2">
            {currentMonth && setCurrentMonth && min_month && (
              <Select
                value={currentMonth.toString()}
                onValueChange={(value) => setCurrentMonth(parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Month</SelectLabel>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem
                          key={month}
                          value={month.toString()}
                          disabled={
                            currentMonthYear === min_year && month < min_month
                          }
                        >
                          {new Date(0, month - 1).toLocaleString("default", {
                            month: "long",
                          })}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            {currentMonthYear && setCurrentMonthYear && min_year && (
              <Select
                value={currentMonthYear.toString()}
                onValueChange={(value) =>
                  setCurrentMonthYear(parseInt(value, 10))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Year</SelectLabel>
                    {Array.from(
                      {
                        length:
                          new Date().getFullYear() - (min_year || 2020) + 1,
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
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="h-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer height={height}>
            {loading ? (
              <SpinnerUI />
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid
                  stroke={darkMode ? "#5f6266" : "#ccc"}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  interval={"preserveStartEnd"}
                  minTickGap={10}
                  tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                  tickFormatter={(value: string) =>
                    `${value}${(() => {
                      if (value === "1") return "st";
                      if (value === "2") return "nd";
                      if (value === "3") return "rd";
                      return "th";
                    })()}`
                  }
                />
                <YAxis
                  tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                  tickFormatter={(value: number) =>
                    `${currencyMapper(currency)}${value.toFixed(0)}`
                  }
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "black",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                  cursor={{
                    stroke: darkMode ? "#0D0D0D" : "#DBDBDB",
                    strokeWidth: 1,
                    fill: "rgba(255, 255, 255, 0.1)",
                  }}
                  formatter={(spent: number) =>
                    `${currencyMapper(currency)}${spent.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`
                  }
                  labelFormatter={(key) => {
                    return `${key}${(() => {
                      if (key === "1") return "st";
                      if (key === "2") return "nd";
                      if (key === "3") return "rd";
                      return "th";
                    })()}`;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#4ade80"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Brush
                  dataKey="day"
                  height={20}
                  stroke={darkMode ? "#4ade80" : "#0088FE"}
                  fill={darkMode ? "#222222" : "#F2F2F2"}
                  tickFormatter={(tick) => {
                    return `${tick}${(() => {
                      if (tick === "1") return "st";
                      if (tick === "2") return "nd";
                      if (tick === "3") return "rd";
                      return "th";
                    })()}`;
                  }}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : loading ? (
          <SpinnerUI />
        ) : (
          <NoDataUI />
        )}
      </CardContent>
    </Card>
  );
}

// ========== Line Chart: Yearly Expense Category|Total Trend ==========
export function YearlyExpenseLineChart({
  amountByMonth,
  amountByMonthV2,
  darkMode,
  currency = "USD",
  setCurrentYearForYearly,
  currentYearForYearly,
  min_year,
  loading = false,
}: {
  amountByMonth?: ExpenseOverview["amountByMonth"];
  amountByMonthV2?: ExpenseOverview["monthlyCategoryExpense"];
  darkMode: boolean;
  currency?: string;
  setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
  currentYearForYearly?: number;
  min_year?: number;
  loading: boolean;
}) {
  const [toggle, setToggle] = useState(true); // true for monthly, false for category
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [category, setCategory] = useState<{ id: string; name: string } | null>(
    null
  );
  const categories = useSelector((state: RootState) => state.categoryExpense);

  useEffect(() => {
    if (category?.name) {
      amountByMonthV2 = Object.fromEntries(
        Object.entries(amountByMonthV2 || {}).map(([month, categories]) => [
          month,
          {
            [category.name]: categories[category.name] || 0,
          },
        ])
      );
    }
    setChartData(
      toggle
        ? Object.entries(amountByMonth || {}).map(([category, amount]) => ({
            name: category,
            amount: amount,
          }))
        : Object.entries(amountByMonthV2 || {}).map(([month, categories]) => ({
            name: month,
            ...categories,
            amount: 0,
          }))
    );
  }, [toggle, amountByMonth, amountByMonthV2]);

  useEffect(() => {
    if (!toggle) {
      if (category?.name) {
        amountByMonthV2 = Object.fromEntries(
          Object.entries(amountByMonthV2 || {}).map(([month, categories]) => [
            month,
            {
              [category.name]: categories[category.name] || 0,
            },
          ])
        );
      }
      setChartData(
        Object.entries(amountByMonthV2 || {}).map(([month, categories]) => ({
          name: month,
          ...categories,
          amount: 0,
        }))
      );
    }
  }, [category, amountByMonthV2]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-wrap justify-between items-center gap-3">
        <CardTitle className="flex items-center justify-between w-fit gap-2">
          Yearly Expense Trends
          <Tabs defaultValue="monthly">
            <TabsList>
              <TabsTrigger value="monthly" onClick={() => setToggle(true)}>
                Monthly
              </TabsTrigger>
              <TabsTrigger value="category" onClick={() => setToggle(false)}>
                Category
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
        {toggle ? (
          <CardAction>
            {setCurrentYearForYearly && currentYearForYearly && min_year && (
              <Select
                value={currentYearForYearly.toString()}
                onValueChange={(value) =>
                  setCurrentYearForYearly(parseInt(value, 10))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Year</SelectLabel>
                    {Array.from(
                      {
                        length:
                          new Date().getFullYear() - (min_year || 2020) + 1,
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
        ) : (
          <CardAction className="flex gap-2">
            <DropDown
              options={[
                { label: "All Categories", value: "all" },
                ...categories.categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
              selectedOption={category ? category.id : ""}
              onSelect={(option) => {
                const selectedCategory = categories.categories.find(
                  (category) => category.id === option
                );
                setCategory(selectedCategory || null);
              }}
            />
            {setCurrentYearForYearly && currentYearForYearly && min_year && (
              <Select
                value={currentYearForYearly.toString()}
                onValueChange={(value) =>
                  setCurrentYearForYearly(parseInt(value, 10))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Year</SelectLabel>
                    {Array.from(
                      {
                        length:
                          new Date().getFullYear() - (min_year || 2020) + 1,
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
        )}
      </CardHeader>
      {toggle ? (
        <CardContent>
          {chartData.length === 0 ? (
            loading ? (
              <SpinnerUI />
            ) : (
              <NoDataUI />
            )
          ) : (
            <ResponsiveContainer height={220}>
              {loading ? (
                <SpinnerUI />
              ) : (
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    stroke={darkMode ? "#242424" : "#DBDBDB"}
                    vertical={false}
                    strokeDasharray="1"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                    tickFormatter={(name: string) =>
                      name.length > 3 ? `${name.slice(0, 3)}` : name
                    }
                    interval={"preserveStartEnd"}
                    minTickGap={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "black",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                    cursor={{
                      stroke: darkMode ? "#525252" : "#DBDBDB",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "amount")
                        return [
                          `${currencyMapper(currency)}${value.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`,
                          "Amount",
                        ];
                      if (name === "trend") return [];
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot
                    activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      ) : (
        <CardContent>
          {chartData.length === 0 ? (
            loading ? (
              <SpinnerUI />
            ) : (
              <NoDataUI />
            )
          ) : (
            <ResponsiveContainer height={220}>
              {loading ? (
                <SpinnerUI />
              ) : (
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    stroke={darkMode ? "#242424" : "#DBDBDB"}
                    vertical={false}
                    strokeDasharray="1"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
                    tickFormatter={(name: string) =>
                      name.length > 3 ? `${name.slice(0, 3)}` : name
                    }
                    interval={"preserveStartEnd"}
                    minTickGap={10}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "black",
                      borderRadius: "8px",
                      fontSize: 14,
                    }}
                    labelStyle={{ color: "#fff" }}
                    cursor={{
                      stroke: darkMode ? "#525252" : "#DBDBDB",
                    }}
                    formatter={(value: number) =>
                      `${currencyMapper(currency)}${value.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}`
                    }
                  />
                  {Object.keys(chartData[0])
                    .filter((key) => key !== "name")
                    .map((category, index) => {
                      if (category === "amount") return null;
                      return (
                        <Line
                          key={category}
                          type="monotone"
                          dataKey={category}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          dot
                        />
                      );
                    })}
                  {/* <Legend /> */}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Depricated code

// // ========== Line Chart: Yearly Spending ==========
// export function ExpensesMonthlyLineChartCard({
//   amountByMonth,
//   darkMode,
//   currency = "USD",
//   title,
//   setCurrentYearForYearly,
//   currentYearForYearly,
//   min_year,
// }: ExpensesMonthlyChartProps & { darkMode: boolean } & { currency?: string } & {
//   title?: string;
//   setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
//   currentYearForYearly?: number;
//   min_year?: number;
// }) {
//   const chartData = Object.entries(amountByMonth || {}).map(
//     ([month, amount]) => ({
//       name: month,
//       amount: amount,
//       trend: amount,
//     })
//   );

//   return (
//     <Card
//       // description="Insights into your spending patterns"
//       className="w-full"
//     >
//       <CardHeader>
//         <CardTitle>{title || "Expense Summary"}</CardTitle>
//         <CardAction>
//           {setCurrentYearForYearly && currentYearForYearly && min_year && (
//             <Select
//               value={currentYearForYearly.toString()}
//               onValueChange={(value) =>
//                 setCurrentYearForYearly(parseInt(value, 10))
//               }
//             >
//               <SelectTrigger className="w-[100px]">
//                 <SelectValue placeholder="Year" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   <SelectLabel>Select Year</SelectLabel>
//                   {Array.from(
//                     {
//                       length: new Date().getFullYear() - (min_year || 2020) + 1,
//                     },
//                     (_, i) => (min_year || 2020) + i
//                   ).map((year) => (
//                     <SelectItem key={year} value={year.toString()}>
//                       {year}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//           )}
//         </CardAction>
//       </CardHeader>
//       <CardContent>
//         {chartData.length === 0 ? (
//           <div
//             className={`flex items-center justify-center h-[${height.toString()}px] w-full`}
//           >
//             <Label className="text-muted-foreground">No data available</Label>
//           </div>
//         ) : (
//           <ResponsiveContainer height={220}>
//             <ComposedChart data={chartData}>
//               <CartesianGrid
//                 stroke={darkMode ? "#242424" : "#DBDBDB"}
//                 vertical={false}
//               />
//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
//                 tickFormatter={(name: string) =>
//                   name.length > 3 ? `${name.slice(0, 3)}` : name
//                 }
//                 interval={"preserveStartEnd"}
//                 minTickGap={10}
//               />
//               {/* <YAxis
//                 tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
//                 tickFormatter={(value: number) =>
//                   `${currencyMapper(currency)}${value.toFixed(0)}`
//                 }
//               /> */}
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "black",
//                   borderRadius: "8px",
//                 }}
//                 labelStyle={{ color: "#fff" }}
//                 cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
//                 formatter={(value: number, name: string) => {
//                   if (name === "amount")
//                     return [
//                       `${currencyMapper(currency)}${value.toLocaleString(
//                         undefined,
//                         {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         }
//                       )}`,
//                       "Amount",
//                     ];
//                   if (name === "trend") return [];
//                 }}
//               />
//               {/* <Bar
//               dataKey="amount"
//               fill="#4ade80"
//               radius={[4, 4, 0, 0]}
//               barSize={50}
//             /> */}
//               <Line
//                 type="monotone"
//                 dataKey="amount"
//                 stroke="#4ade80"
//                 strokeWidth={2}
//                 dot
//                 activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
//               />
//             </ComposedChart>
//           </ResponsiveContainer>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // ========== Line Chart: Yearly Expense Category Trend ==========
// export function ExpensesMonthlyLineCategoryChartCard({
//   amountByMonthV2,
//   darkMode,
//   currency = "USD",
//   title,
//   setCurrentYearForYearly,
//   currentYearForYearly,
//   min_year,
// }: ExpensesMonthlyCategoryChartProps & { darkMode: boolean } & {
//   currency?: string;
// } & { title?: string } & {
//   setCurrentYearForYearly?: React.Dispatch<React.SetStateAction<number>>;
//   currentYearForYearly?: number;
//   min_year?: number;
// }) {
//   const [category, setCategory] = useState<{ id: string; name: string } | null>(
//     null
//   );
//   const categories = useSelector((state: RootState) => state.categoryExpense);
//   const [chartData, setChartData] = useState<ChartRow[]>([]);

//   useEffect(() => {
//     if (category?.name) {
//       amountByMonthV2 = Object.fromEntries(
//         Object.entries(amountByMonthV2).map(([month, categories]) => [
//           month,
//           {
//             [category.name]: categories[category.name] || 0,
//           },
//         ])
//       );
//     }
//     setChartData(
//       Object.entries(amountByMonthV2).map(([month, categories]) => ({
//         name: month,
//         ...categories,
//         amount: 0,
//       }))
//     );
//   }, [category, amountByMonthV2]);

//   return (
//     <Card
//       // description="Visual breakdown of expenses by category over the year"
//       className="w-full"
//     >
//       <CardHeader className="flex flex-wrap justify-between items-center gap-3">
//         <CardTitle>{title || "Monthly Spending Trends"}</CardTitle>
//         <CardAction className="flex gap-2">
//           {setCurrentYearForYearly && currentYearForYearly && min_year && (
//             <Select
//               value={currentYearForYearly.toString()}
//               onValueChange={(value) =>
//                 setCurrentYearForYearly(parseInt(value, 10))
//               }
//             >
//               <SelectTrigger className="w-[100px]">
//                 <SelectValue placeholder="Year" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   <SelectLabel>Select Year</SelectLabel>
//                   {Array.from(
//                     {
//                       length: new Date().getFullYear() - (min_year || 2020) + 1,
//                     },
//                     (_, i) => (min_year || 2020) + i
//                   ).map((year) => (
//                     <SelectItem key={year} value={year.toString()}>
//                       {year}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//           )}
//           <DropDown
//             options={[
//               { label: "All Categories", value: "all" },
//               ...categories.categories.map((category) => ({
//                 label: category.name,
//                 value: category.id,
//               })),
//             ]}
//             selectedOption={category ? category.id : ""}
//             onSelect={(option) => {
//               const selectedCategory = categories.categories.find(
//                 (category) => category.id === option
//               );
//               setCategory(selectedCategory || null);
//             }}
//           />
//         </CardAction>
//       </CardHeader>
//       <CardContent>
//         {chartData.length === 0 ? (
//           <div
//             className={`flex items-center content-center justify-center h-[${height.toString()}px] w-full`}
//           >
//             <Label className="text-muted-foreground">No data available</Label>
//           </div>
//         ) : (
//           <ResponsiveContainer width="100%" height={height}>
//             <ComposedChart data={chartData} margin={margin}>
//               <CartesianGrid
//                 strokeDasharray="1"
//                 stroke={darkMode ? "#5f6266" : "#ccc"}
//                 // strokeLinejoin="round"
//                 // horizontal={false}
//                 vertical={false}
//                 height={1}
//               />

//               <XAxis
//                 dataKey="name"
//                 tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
//                 tickFormatter={(name: string) => name.slice(0, 1)}
//               />
//               <YAxis
//                 tick={{ fontSize: 12, fill: darkMode ? "#fff" : "#000" }}
//                 tickFormatter={(value: number) =>
//                   `${currencyMapper(currency)}${value.toFixed(0)}`
//                 }
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "black",
//                   borderRadius: "8px",
//                   fontSize: 14,
//                 }}
//                 labelStyle={{ color: "#fff" }}
//                 cursor={{ fill: "bg-background" }}
//                 formatter={(value: number) =>
//                   `${currencyMapper(currency)}${value.toLocaleString(
//                     undefined,
//                     {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     }
//                   )}`
//                 }
//               />
//               {Object.keys(chartData[0])
//                 .filter((key) => key !== "name")
//                 .map((category, index) => (
//                   <Line
//                     key={category}
//                     type="monotone"
//                     dataKey={category}
//                     stroke={COLORS[index % COLORS.length]}
//                     strokeWidth={2}
//                     dot
//                   />
//                 ))}
//               {/* <Legend /> */}
//             </ComposedChart>
//           </ResponsiveContainer>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
