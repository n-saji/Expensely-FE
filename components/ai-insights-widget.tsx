"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "@/lib/api";
import type {
  Budget,
  ExpenseOverview,
  IncomeOverview,
  UpcomingRecurringExpense,
} from "@/global/dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyMapper } from "@/utils/currencyMapper";

type InsightStatus =
  | "NOT_AVAILABLE"
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "FAILED";

type AiInsight = {
  id: string;
  type: string;
  severity: "INFO" | "POSITIVE" | "WARNING";
  title: string;
  description: string;
  recommendation?: string | null;
  category?: string | null;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  generatedAt: string;
};

type AiInsightsResponse = {
  refresh: {
    status: InsightStatus;
    stale: boolean;
    period: string;
    lastGeneratedAt?: string | null;
    lastErrorCategory?: string | null;
  };
  insights: AiInsight[];
};

type AiInsightsWidgetProps = {
  userId: string;
  currency?: string;
  overview: ExpenseOverview | null;
  incomeOverview: IncomeOverview | null;
};

type ProjectionPoint = {
  day: number;
  current: number | null;
  previous: number | null;
  projected: number | null;
};

const MAX_PENDING_POLLS = 3;
const POLL_INTERVAL_MS = 15_000;

export default function AiInsightsWidget({
  userId,
  currency = "USD",
  overview,
  incomeOverview,
}: AiInsightsWidgetProps) {
  const [data, setData] = useState<AiInsightsResponse | null>(null);
  const [previousOverview, setPreviousOverview] =
    useState<ExpenseOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestFailed, setRequestFailed] = useState(false);

  const loadInsights = useCallback(async () => {
    try {
      const response = await api.get<AiInsightsResponse>("/ai/insights");
      setData(response.data);
      setRequestFailed(false);
    } catch {
      setRequestFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPreviousMonth = useCallback(async () => {
    if (!userId) return;
    const previous = new Date();
    previous.setDate(1);
    previous.setMonth(previous.getMonth() - 1);
    try {
      const response = await api.get<ExpenseOverview>(
        `/expenses/user/${userId}/overview?req_month=${previous.getMonth() + 1}&req_month_year=${previous.getFullYear()}`,
      );
      setPreviousOverview(response.data);
    } catch {
      // The summary and projection still work without this optional comparison.
    }
  }, [userId]);

  useEffect(() => {
    void loadInsights();
    void loadPreviousMonth();
  }, [loadInsights, loadPreviousMonth]);

  const refreshStatus = data?.refresh.status;

  useEffect(() => {
    if (!refreshStatus || !["PENDING", "PROCESSING"].includes(refreshStatus)) {
      return;
    }
    let polls = 0;
    const timer = window.setInterval(() => {
      polls += 1;
      void loadInsights();
      if (polls >= MAX_PENDING_POLLS) window.clearInterval(timer);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [refreshStatus, loadInsights]);

  const model = useMemo(
    () =>
      buildInsightModel({
        overview,
        incomeOverview,
        previousOverview,
        insights: data?.insights ?? [],
        currency,
      }),
    [currency, data?.insights, incomeOverview, overview, previousOverview],
  );

  const money = (value: number) => formatMoney(value, currency);
  const currencySymbol = currencyMapper(currency);

  return (
    <Card className="w-full h-full overflow-hidden border-border/40 bg-card/30 shadow-none backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <span className="rounded-lg bg-violet-500/10 p-1.5">
                <Sparkles className="h-4 w-4 text-violet-500" />
              </span>
              AI Financial Insights
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              What is likely to happen next — and what deserves your attention.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {requestFailed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /> Using ledger analysis
              </span>
            )}
            {data?.refresh.stale && (data.insights?.length ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                <RefreshCw className="h-3 w-3" /> Refreshing AI
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!overview || loading ? (
          <InsightSkeleton />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Projected spend"
                value={money(model.projectedExpense)}
                detail={`${model.daysRemaining} days left`}
                trend={model.expenseDelta}
                tone="violet"
              />
              <MetricCard
                label="Projected income"
                value={model.hasIncome ? money(model.projectedIncome) : "No income yet"}
                detail={model.hasIncome ? "Pace + last month" : "Add income to forecast"}
                trend={model.hasIncome ? model.incomeDelta : null}
                tone="emerald"
              />
              <MetricCard
                label="Projected balance"
                value={model.hasIncome ? money(model.projectedBalance) : "—"}
                detail={model.projectedBalance >= 0 ? "Income after spending" : "Potential shortfall"}
                tone={model.projectedBalance >= 0 ? "sky" : "rose"}
              />
              <MetricCard
                label="Budget risk"
                value={String(model.budgetsAtRisk)}
                detail={model.budgetsAtRisk === 1 ? "category may cross" : "categories may cross"}
                tone={model.budgetsAtRisk > 0 ? "amber" : "emerald"}
              />
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.65fr_1fr]">
              <section className="rounded-2xl border border-border/50 bg-background/40 p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Daily spending trajectory
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Cumulative spend vs last month, with month-end projection
                    </p>
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <LegendDot color="bg-violet-500" label="This month" />
                    <LegendDot color="bg-muted-foreground/50" label="Last month" />
                    <LegendDot color="bg-violet-300" label="Forecast" dashed />
                  </div>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={model.projectionData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(value) => compactNumber(value, currencySymbol)} width={56} />
                      <Tooltip content={<MoneyTooltip currency={currency} />} />
                      <Line type="monotone" dataKey="previous" stroke="var(--muted-foreground)" strokeOpacity={0.45} strokeWidth={1.5} dot={false} connectNulls />
                      <Line type="monotone" dataKey="current" stroke="#8b5cf6" strokeWidth={2.5} dot={false} connectNulls />
                      <Line type="monotone" dataKey="projected" stroke="#c4b5fd" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-2xl border border-border/50 bg-background/40 p-4">
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-foreground">Month at a glance</h3>
                  <p className="text-[11px] text-muted-foreground">Actual, forecast, and last month</p>
                </div>
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={model.comparisonBars} barCategoryGap="24%" margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <YAxis hide />
                      <Tooltip content={<MoneyTooltip currency={currency} />} cursor={{ fill: "var(--muted)", opacity: 0.2 }} />
                      <Bar dataKey="value" radius={[6, 6, 2, 2]}>
                        {model.comparisonBars.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-1 text-center text-[11px] text-muted-foreground">
                  Forecast is <span className="font-semibold text-foreground">{money(Math.abs(model.projectedExpense - model.lastMonthExpense))}</span>{" "}
                  {model.projectedExpense >= model.lastMonthExpense ? "above" : "below"} last month.
                </p>
              </section>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <FocusCard
                icon={<Target className="h-4 w-4 text-rose-500" />}
                eyebrow="Unexpected expense"
                title={model.outlier.title}
                metric={model.outlier.metric}
                description={model.outlier.description}
              />
              <FocusCard
                icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
                eyebrow="Best next move"
                title={model.tip.title}
                metric={model.tip.metric}
                description={model.tip.description}
              />
              <FocusCard
                icon={<WalletCards className="h-4 w-4 text-sky-500" />}
                eyebrow="Recurring share"
                title={model.recurring.title}
                metric={model.recurring.metric}
                description={model.recurring.description}
              />
            </div>

            {model.budgetForecasts.length > 0 && (
              <section className="rounded-2xl border border-border/50 bg-background/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Budget crossing forecast</h3>
                    <p className="text-[11px] text-muted-foreground">Based on each budget&apos;s spend pace and active dates</p>
                  </div>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                  {model.budgetForecasts.slice(0, 6).map((budget) => (
                    <div key={budget.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate font-medium text-foreground">{budget.category}</span>
                        <span className={budget.atRisk ? "font-medium text-rose-500" : "text-emerald-500"}>{budget.status}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={budget.atRisk ? "h-full rounded-full bg-rose-500" : "h-full rounded-full bg-emerald-500"} style={{ width: `${Math.min(budget.projectedPercent, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Projected {budget.projectedPercent}% · {money(budget.projectedAmount)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  detail,
  trend,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  trend?: number | null;
  tone: "violet" | "emerald" | "sky" | "rose" | "amber";
}) {
  const tones = {
    violet: "from-violet-500/12 to-violet-500/[0.02] border-violet-500/20",
    emerald: "from-emerald-500/12 to-emerald-500/[0.02] border-emerald-500/20",
    sky: "from-sky-500/12 to-sky-500/[0.02] border-sky-500/20",
    rose: "from-rose-500/12 to-rose-500/[0.02] border-rose-500/20",
    amber: "from-amber-500/12 to-amber-500/[0.02] border-amber-500/20",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <p className="truncate text-xl font-semibold tracking-tight text-foreground" title={value}>{value}</p>
        {trend !== undefined && trend !== null && Number.isFinite(trend) && (
          <span className={`mb-0.5 flex shrink-0 items-center text-[10px] font-semibold ${trend <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {trend <= 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {Math.abs(Math.round(trend))}%
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function FocusCard({ icon, eyebrow, title, metric, description }: { icon: React.ReactNode; eyebrow: string; title: string; metric: string; description: string }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background/40 p-4">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-muted/70 p-1.5">{icon}</span>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{title}</h3>
        {metric && <span className="shrink-0 text-base font-semibold text-foreground">{metric}</span>}
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{description}</p>
    </article>
  );
}

function LegendDot({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return <span className="flex items-center gap-1"><span className={`h-0.5 w-3 ${color} ${dashed ? "border-t border-dashed border-violet-300 bg-transparent" : ""}`} />{label}</span>;
}

function MoneyTooltip({ active, payload, label, currency }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string | number; currency: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-[10px] text-muted-foreground">{typeof label === "number" ? `Day ${label}` : label}</p>
      {payload.filter((item) => item.value !== null).map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="capitalize text-muted-foreground">{item.name}</span>
          <span className="font-semibold text-foreground">{formatMoney(item.value, currency)}</span>
        </div>
      ))}
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.65fr_1fr]">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}

function buildInsightModel({ overview, incomeOverview, previousOverview, insights, currency }: { overview: ExpenseOverview | null; incomeOverview: IncomeOverview | null; previousOverview: ExpenseOverview | null; insights: AiInsight[]; currency: string }) {
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(daysInMonth - currentDay, 0);
  const currentExpense = overview?.thisMonthTotalExpense ?? 0;
  const lastMonthExpense = overview?.lastMonthTotalExpense ?? previousOverview?.thisMonthTotalExpense ?? 0;
  const projectedExpense = Math.max(currentExpense, currentDay > 0 ? (currentExpense / currentDay) * daysInMonth : currentExpense);

  const currentIncome = incomeOverview?.thisMonthTotalIncome ?? 0;
  const lastMonthIncome = incomeOverview?.lastMonthTotalIncome ?? 0;
  const paceIncome = currentDay > 0 ? (currentIncome / currentDay) * daysInMonth : currentIncome;
  const projectedIncome = Math.max(currentIncome, lastMonthIncome > 0 ? paceIncome * 0.55 + lastMonthIncome * 0.45 : paceIncome);
  const hasIncome = currentIncome > 0 || lastMonthIncome > 0;

  const projectionData = buildProjectionData(
    overview?.overTheDaysThisMonth ?? {},
    previousOverview?.overTheDaysThisMonth ?? {},
    currentDay,
    daysInMonth,
    projectedExpense,
  );

  const budgets = overview ? Object.values(overview.budgetServiceMap ?? {}) : [];
  const budgetForecasts = budgets
    .map((budget) => forecastBudget(budget, now))
    .sort((a, b) => Number(b.atRisk) - Number(a.atRisk) || b.projectedPercent - a.projectedPercent);

  const recurringExpenses = overview?.upcomingRecurringExpenses ?? [];
  const monthlyRecurring = recurringExpenses.reduce((sum, expense) => sum + monthlyRecurringAmount(expense), 0);
  const largestRecurring = [...recurringExpenses].sort((a, b) => monthlyRecurringAmount(b) - monthlyRecurringAmount(a))[0];
  const recurringShare = projectedExpense > 0 ? (monthlyRecurring / projectedExpense) * 100 : 0;

  const anomalyInsight = insights.find((insight) => /ANOMAL|OUTLIER|UNUSUAL|NEW_EXPENSE/i.test(insight.type));
  const recommendationInsight = insights.find((insight) => insight.recommendation?.trim());
  const newTopExpense = findNewTopExpense(overview, previousOverview);
  const outlier = anomalyInsight
    ? { title: anomalyInsight.title, metric: anomalyInsight.category ?? "", description: anomalyInsight.description }
    : newTopExpense
      ? { title: newTopExpense[0], metric: formatCompactMoney(newTopExpense[1], currency), description: "New among your top expenses compared with last month; this amount directly raised this month’s total." }
      : { title: "No clear outlier yet", metric: "", description: "Spending is currently distributed without one newly dominant expense." };

  const tip = recommendationInsight
    ? { title: recommendationInsight.title, metric: recommendationInsight.category ?? "", description: recommendationInsight.recommendation ?? recommendationInsight.description }
    : largestRecurring
      ? { title: `Review ${largestRecurring.description}`, metric: `${Math.round((monthlyRecurringAmount(largestRecurring) / Math.max(monthlyRecurring, 1)) * 100)}%`, description: "It is the largest part of your recurring monthly commitments; reducing or skipping it has the clearest repeat impact." }
      : { title: "Focus on the largest named purchase", metric: "", description: "Add more transactions to receive expense-specific reduction ideas instead of generic percentage advice." };

  const recurring = largestRecurring
    ? { title: largestRecurring.description, metric: `${Math.round(recurringShare)}%`, description: `${formatCompactMoney(monthlyRecurring, largestRecurring.currency)} estimated monthly recurring cost. The percentage is its share of projected spending.` }
    : { title: "No recurring costs detected", metric: "0%", description: "Mark repeating bills as recurring to see their monthly share and cancellation opportunities." };

  return {
    projectedExpense,
    projectedIncome,
    projectedBalance: projectedIncome - projectedExpense,
    lastMonthExpense,
    hasIncome,
    daysRemaining,
    expenseDelta: percentChange(projectedExpense, lastMonthExpense),
    incomeDelta: percentChange(projectedIncome, lastMonthIncome),
    budgetsAtRisk: budgetForecasts.filter((budget) => budget.atRisk).length,
    budgetForecasts,
    projectionData,
    comparisonBars: [
      { label: "So far", value: currentExpense, color: "#8b5cf6" },
      { label: "Forecast", value: projectedExpense, color: "#c4b5fd" },
      { label: "Last month", value: lastMonthExpense, color: "#94a3b8" },
    ],
    outlier,
    tip,
    recurring,
  };
}

function buildProjectionData(current: Record<string, number>, previous: Record<string, number>, currentDay: number, daysInMonth: number, projectedTotal: number): ProjectionPoint[] {
  const currentByDay = normalizeDailyValues(current);
  const previousByDay = normalizeDailyValues(previous);
  const previousLastDay = Math.max(0, ...Object.keys(previousByDay).map(Number));
  let currentCumulative = 0;
  let previousCumulative = 0;
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    currentCumulative += currentByDay[day] ?? 0;
    previousCumulative += previousByDay[day] ?? 0;
    return {
      day,
      current: day <= currentDay ? currentCumulative : null,
      previous: day <= previousLastDay ? previousCumulative : null,
      projected: day === currentDay ? currentCumulative : day === daysInMonth ? projectedTotal : null,
    };
  });
}

function normalizeDailyValues(values: Record<string, number>) {
  return Object.entries(values).reduce<Record<number, number>>((result, [key, value]) => {
    let day = Number(key);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      const match = key.match(/(?:^|[-/])(\d{1,2})(?:T|$)/);
      day = match ? Number(match[1]) : new Date(key).getDate();
    }
    if (Number.isInteger(day) && day >= 1 && day <= 31) result[day] = (result[day] ?? 0) + Number(value || 0);
    return result;
  }, {});
}

function forecastBudget(budget: Budget, now: Date) {
  const start = new Date(budget.startDate);
  const end = new Date(budget.endDate);
  const elapsed = Math.max(1, Math.floor((Math.min(now.getTime(), end.getTime()) - start.getTime()) / 86_400_000) + 1);
  const duration = Math.max(elapsed, Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1);
  const dailyPace = budget.amountSpent / elapsed;
  const projectedAmount = Math.max(budget.amountSpent, dailyPace * duration);
  const projectedPercent = budget.amountLimit > 0 ? Math.round((projectedAmount / budget.amountLimit) * 100) : 0;
  const alreadyCrossed = budget.amountSpent >= budget.amountLimit;
  const crossingDay = dailyPace > 0 ? Math.ceil(budget.amountLimit / dailyPace) - 1 : Number.POSITIVE_INFINITY;
  const crossingDate = new Date(start.getTime() + crossingDay * 86_400_000);
  const willCross = alreadyCrossed || crossingDate <= end;
  const status = alreadyCrossed
    ? "Limit crossed"
    : willCross
      ? `Crosses ${crossingDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : "On track";
  return { id: budget.id, category: budget.category.name, projectedAmount, projectedPercent, atRisk: willCross, status };
}

function monthlyRecurringAmount(expense: UpcomingRecurringExpense) {
  if (expense.recurrence === "DAILY") return expense.amount * 30.44;
  if (expense.recurrence === "WEEKLY") return expense.amount * (52 / 12);
  if (expense.recurrence === "YEARLY") return expense.amount / 12;
  return expense.amount;
}

function findNewTopExpense(current: ExpenseOverview | null, previous: ExpenseOverview | null): [string, number] | null {
  const currentItems = Object.entries(current?.topFiveMostExpensiveItemThisMonth ?? {}).sort(([, a], [, b]) => b - a);
  const previousNames = new Set(Object.keys(previous?.topFiveMostExpensiveItemThisMonth ?? {}).map((name) => name.toLowerCase().trim()));
  return currentItems.find(([name]) => !previousNames.has(name.toLowerCase().trim())) ?? null;
}

function percentChange(value: number, baseline: number) {
  if (baseline <= 0) return null;
  return ((value - baseline) / baseline) * 100;
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currencyMapper(currency)}${Math.round(value).toLocaleString()}`;
  }
}

function formatCompactMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value);
  } catch {
    return `${currencyMapper(currency)}${Math.round(value).toLocaleString()}`;
  }
}

function compactNumber(value: number, symbol: string) {
  return `${symbol}${new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
}
