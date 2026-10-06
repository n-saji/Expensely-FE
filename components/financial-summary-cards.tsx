"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currencyMapper";

type Summary = {
  income: number;
  expense: number;
  netCashFlow: number;
  debtRepayment: number;
  savingsContributions: number;
  investmentContributions: number;
};
const empty: Summary = {
  income: 0,
  expense: 0,
  netCashFlow: 0,
  debtRepayment: 0,
  savingsContributions: 0,
  investmentContributions: 0,
};

export default function FinancialSummaryCards() {
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => {
    const load = () => {
      api
        .get<Summary>("/finances/summary")
        .then((res) => setSummary(res.data))
        .catch(() => setSummary(empty));
    };
    load();
    window.addEventListener("transaction-added", load);
    window.addEventListener("expense-added", load);
    window.addEventListener("income-added", load);
    return () => {
      window.removeEventListener("transaction-added", load);
      window.removeEventListener("expense-added", load);
      window.removeEventListener("income-added", load);
    };
  }, []);
  const data = summary || empty;
  const cashOut =
    data.expense +
    data.debtRepayment +
    data.savingsContributions +
    data.investmentContributions;
  const max = Math.max(data.income, cashOut, 1);
  const cashAllocationPct =
    data.income > 0 ? (cashOut / data.income) * 100 : null;
  const allocationTotal = Math.max(
    data.expense +
      data.debtRepayment +
      data.savingsContributions +
      data.investmentContributions,
    1,
  );
  const expensePct = (data.expense / allocationTotal) * 100,
    debtPct = (data.debtRepayment / allocationTotal) * 100,
    savingsPct = (data.savingsContributions / allocationTotal) * 100;
  const ring = useMemo(
    () =>
      `conic-gradient(hsl(var(--primary)) 0 ${expensePct}%, #f59e0b ${expensePct}% ${expensePct + debtPct}%, #10b981 ${expensePct + debtPct}% ${expensePct + debtPct + savingsPct}%, #8b5cf6 ${expensePct + debtPct + savingsPct}% 100%)`,
    [expensePct, debtPct, savingsPct],
  );
  if (!summary)
    return (
      <div className="h-72 animate-pulse rounded-2xl border border-border/40 bg-muted/20" />
    );
  return (
    <section aria-label="This month financial summary" className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            This month
          </p>
          <h2 className="text-lg font-medium">Cash flow overview</h2>
        </div>
        <span className="rounded-full border border-border/50 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          USD base currency
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="overflow-hidden border-border/40 bg-card/30 shadow-none lg:col-span-7">
          <CardHeader className="pb-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Net Cash Flow</p>
                <CardTitle
                  className={`mt-1 font-mono text-3xl font-light ${data.netCashFlow < 0 ? "text-rose-500" : ""}`}
                >
                  {formatCurrency(data.netCashFlow, "USD")}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Income minus real expenses and debt interest
                </p>
              </div>
              <span
                className={`rounded-full p-2 ${data.netCashFlow >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
              >
                {data.netCashFlow >= 0 ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div
              className="space-y-5 rounded-xl border border-border/40 bg-muted/10 p-4"
              aria-label={`Income ${formatCurrency(data.income, "USD")}; cash allocated ${formatCurrency(cashOut, "USD")}`}
            >
              {[
                {
                  label: "Income",
                  value: data.income,
                  color: "bg-emerald-500",
                },
                {
                  label: "Cash allocated",
                  value: cashOut,
                  color: "bg-rose-400",
                },
              ].map((item) => {
                const percentage = (item.value / max) * 100;
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-end justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="font-mono text-foreground">
                        {formatCurrency(item.value, "USD")}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted/70">
                      <div
                        className={`h-full rounded-full transition-[width] ${item.color}`}
                        style={{ width: `${percentage}%` }}
                        title={`${item.label}: ${formatCurrency(item.value, "USD")} (${Math.round(percentage)}% of the chart maximum)`}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between border-t border-border/40 pt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>$0</span>
                <span>Shared scale · max {formatCurrency(max, "USD")}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {cashAllocationPct === null
                ? "No monthly income is available for a percentage comparison."
                : `Cash allocated is ${Math.round(cashAllocationPct)}% of monthly income.`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/30 shadow-none lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Where the money went
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div
              className="relative size-32 shrink-0 rounded-full"
              style={{ background: ring }}
            >
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-card">
                <span className="font-mono text-lg">
                  {Math.round((data.expense / allocationTotal) * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  expenses
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3 text-xs">
              {[
                ["Real expenses", data.expense, "bg-primary"],
                ["Debt principal", data.debtRepayment, "bg-amber-500"],
                ["Savings", data.savingsContributions, "bg-emerald-500"],
                ["Investments", data.investmentContributions, "bg-violet-500"],
              ].map(([label, value, color]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                    <span className={`size-2 shrink-0 rounded-full ${color}`} />
                    <span className="truncate">{label}</span>
                  </span>
                  <span className="font-mono text-foreground">
                    {formatCurrency(Number(value), "USD")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {[
          {
            label: "Debt principal",
            value: data.debtRepayment,
            icon: Landmark,
            color: "text-amber-500 bg-amber-500/10",
          },
          {
            label: "Saved",
            value: data.savingsContributions,
            icon: PiggyBank,
            color: "text-emerald-500 bg-emerald-500/10",
          },
          {
            label: "Invested",
            value: data.investmentContributions,
            icon: TrendingUp,
            color: "text-violet-500 bg-violet-500/10",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="border-border/40 bg-card/30 shadow-none lg:col-span-4"
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-mono text-xl font-light">
                  {formatCurrency(item.value, "USD")}
                </p>
              </div>
              <div className={`rounded-xl p-2.5 ${item.color}`}>
                <item.icon className="size-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
