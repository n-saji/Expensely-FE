"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import MonthlyAnalyticsView from "../MonthlyAnalyticsView";

export default function MonthlyDashboardStandalonePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const month = params.month as string;
  const type = searchParams.get("type") === "income" ? "income" : "expense";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-0 py-6">
      <MonthlyAnalyticsView monthParam={month} typeParam={type} isModal={false} />
    </div>
  );
}
