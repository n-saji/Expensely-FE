"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

const MAX_PENDING_POLLS = 3;
const POLL_INTERVAL_MS = 15_000;

export default function AiInsightsWidget() {
  const [data, setData] = useState<AiInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestFailed, setRequestFailed] = useState(false);

  const load = useCallback(async () => {
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

  useEffect(() => {
    void load();
  }, [load]);

  const refreshStatus = data?.refresh.status;

  useEffect(() => {
    if (!refreshStatus || !["PENDING", "PROCESSING"].includes(refreshStatus)) {
      return;
    }
    let polls = 0;
    const timer = window.setInterval(() => {
      polls += 1;
      void load();
      if (polls >= MAX_PENDING_POLLS) {
        window.clearInterval(timer);
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [refreshStatus, load]);

  return (
    <Card className="w-full h-full border-border/40 shadow-none overflow-hidden bg-card/30 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Sparkles className="h-4.5 w-4.5 text-violet-500" />
              AI Financial Insights
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Background analysis of validated spending and budget metrics.
            </p>
          </div>
          {data?.refresh.stale && data.insights.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-3 w-3" /> Refreshing
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : requestFailed ? (
          <StateMessage
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
            title="Insights could not be loaded"
            description="Your dashboard is still available. Try again on your next visit."
          />
        ) : data && data.insights.length > 0 ? (
          <>
            {data.refresh.status === "FAILED" && (
              <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
                The latest refresh failed, so these are your previous insights.
              </p>
            )}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </>
        ) : data?.refresh.status === "FAILED" ? (
          <StateMessage
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
            title="Insight generation is temporarily unavailable"
            description="Expense tracking is unaffected. The background job will retry later."
          />
        ) : ["PENDING", "PROCESSING"].includes(data?.refresh.status ?? "") ? (
          <StateMessage
            icon={<RefreshCw className="h-5 w-5 animate-spin text-violet-500" />}
            title="Your insights are being prepared"
            description="You can keep using the dashboard while analysis runs in the background."
          />
        ) : (
          <StateMessage
            icon={<Lightbulb className="h-5 w-5 text-muted-foreground" />}
            title="No financial insights yet"
            description="Insights appear after there is enough activity for a meaningful comparison."
          />
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: AiInsight }) {
  const icon =
    insight.severity === "WARNING" ? (
      <AlertTriangle className="h-4 w-4 text-amber-500" />
    ) : insight.severity === "POSITIVE" || insight.type.includes("DECREASE") ? (
      <TrendingDown className="h-4 w-4 text-emerald-500" />
    ) : insight.type.includes("INCREASE") || insight.type.includes("ANOMALY") ? (
      <TrendingUp className="h-4 w-4 text-rose-500" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-violet-500" />
    );

  return (
    <article className="rounded-xl border border-border/50 bg-background/45 p-4">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 rounded-lg bg-muted/60 p-1.5">{icon}</div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5 text-foreground">
            {insight.title}
          </h3>
          {insight.category && (
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {insight.category}
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {insight.description}
      </p>
      {insight.recommendation && (
        <p className="mt-2 border-t border-border/30 pt-2 text-xs leading-5 text-foreground/80">
          {insight.recommendation}
        </p>
      )}
    </article>
  );
}

function StateMessage({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 px-5 py-6 text-center">
      <div>
        <div className="mx-auto mb-2 flex justify-center">{icon}</div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
