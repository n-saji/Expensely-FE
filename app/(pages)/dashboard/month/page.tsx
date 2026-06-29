"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

export default function MonthlyAnalyticsSelectorPage() {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0-indexed, e.g. 5 for June

  const months = useMemo(() => {
    const list = [];
    for (let m = 0; m <= currentMonthIdx; m++) {
      const date = new Date(currentYear, m, 1);
      const monthName = date.toLocaleString("default", { month: "long" });
      const monthShort = date.toLocaleString("default", { month: "short" }).toUpperCase();
      const monthVal = String(m + 1).padStart(2, "0");
      list.push({
        name: monthName,
        short: monthShort,
        value: `${currentYear}-${monthVal}`,
      });
    }
    return list.reverse(); // Show latest month first
  }, [currentYear, currentMonthIdx]);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto px-4 md:px-0 py-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Ledger Archives</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mt-1">Monthly Analytics Archive</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a month to inspect detailed cash breakdowns, category analytics, budgets, and visual insights.
        </p>
      </div>

      {/* Grid of Months */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {months.map((month) => {
          const isCurrentMonth = month.value === `${currentYear}-${String(currentMonthIdx + 1).padStart(2, "0")}`;

          return (
            <Card
              key={month.value}
              className="border-border/40 shadow-sm overflow-hidden bg-card/25 backdrop-blur-sm hover:border-border/80 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  {/* Calendar Icon Mockup */}
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-muted/20 border border-border/40 shrink-0">
                    <span className="text-[9px] font-bold text-rose-500 tracking-wider">{month.short}</span>
                    <span className="text-sm font-semibold text-foreground font-mono mt-0.5">{currentYear}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-1.5">
                      {month.name} {currentYear}
                      {isCurrentMonth && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Current Month" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isCurrentMonth ? "Active tracking month" : "Archived monthly reports"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4 space-y-2 border-t border-border/30 pt-4 bg-muted/5">
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full text-xs h-9 justify-center cursor-pointer">
                    <Link href={`/dashboard/month/${month.value}?type=expense`}>
                      <TrendingDown className="h-3.5 w-3.5 mr-1 text-rose-500" />
                      Expenses
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full text-xs h-9 justify-center cursor-pointer">
                    <Link href={`/dashboard/month/${month.value}?type=income`}>
                      <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      Income
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
