"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  RangeOption,
  TelemetryOverviewResponse,
  formatDateForApi,
  rangeToDates,
} from "../types";

function formatBucketLabel(value: string, bucket: string) {
  const date = new Date(value);
  if (bucket === "hour") {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/40 bg-card/30 rounded-xl p-3 flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
      <span className="text-lg font-bold text-foreground font-mono mt-1">{value}</span>
    </div>
  );
}

export default function OverviewCharts({ range }: { range: RangeOption }) {
  const user = useSelector((state: RootState) => state.user);
  const isDark = user?.theme === "dark";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<TelemetryOverviewResponse | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        const { startDate, bucket } = rangeToDates(range);
        const response = await api.get("/admins/telemetry/overview", {
          params: {
            start_date: formatDateForApi(startDate),
            end_date: formatDateForApi(new Date()),
            bucket,
          },
        });
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Error fetching telemetry overview:", err);
        if (!cancelled) {
          setError(true);
          toast.error("Failed to load telemetry overview");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [range, retryKey]);

  const bucket = data?.bucket ?? "hour";
  const volumeData = (data?.volume ?? []).map((point) => ({
    label: formatBucketLabel(point.bucketTime, bucket),
    requestCount: point.requestCount,
  }));
  const latencyData = (data?.latency ?? []).map((point) => ({
    label: formatBucketLabel(point.bucketTime, bucket),
    avgDurationMs: point.avgDurationMs ?? 0,
    p95DurationMs: point.p95DurationMs ?? 0,
  }));
  const errorRateData = (data?.errorRate ?? []).map((point) => ({
    label: formatBucketLabel(point.bucketTime, bucket),
    errorRatePercent: point.totalCount > 0 ? (point.errorCount / point.totalCount) * 100 : 0,
  }));

  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipStyle = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    borderColor: isDark ? "#334155" : "#e2e8f0",
    borderRadius: "8px",
    color: isDark ? "#f8fafc" : "#0f172a",
  };

  if (error) {
    return (
      <div className="h-[260px] flex flex-col items-center justify-center gap-3 text-center border border-border/40 bg-card/15 rounded-xl">
        <p className="text-sm text-muted-foreground">Couldn&apos;t load telemetry. Try again.</p>
        <Button variant="outline" size="sm" onClick={() => setRetryKey((k) => k + 1)}>
          <RotateCcw className="h-3.5 w-3.5 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Total Requests" value={(data?.totalRequests ?? 0).toLocaleString()} />
          <StatTile label="Avg Latency" value={`${(data?.avgDurationMs ?? 0).toFixed(0)} ms`} />
          <StatTile label="P95 Latency" value={`${(data?.p95DurationMs ?? 0).toFixed(0)} ms`} />
          <StatTile label="Error Rate" value={`${(data?.errorRatePercent ?? 0).toFixed(2)}%`} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-border/40 bg-card/15 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Request Volume</h3>
          <div className="h-[220px]">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={volumeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={40} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="requestCount" name="Requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="border border-border/40 bg-card/15 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Latency</h3>
          <div className="h-[220px]">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={latencyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={11} tickLine={false} />
                  <YAxis
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(val: number) => `${Number(val.toFixed(3))}ms`}
                  />
                  <RechartsTooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any, name: any) => [`${Number(Number(val).toFixed(3))} ms`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="avgDurationMs"
                    name="Avg"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="p95DurationMs"
                    name="P95"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="border border-border/40 bg-card/15 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Error Rate</h3>
        <div className="h-[220px]">
          {loading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={errorRateData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorErrorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="label" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(val: number) => `${val}%`}
                />
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any) => [`${Number(val).toFixed(2)}%`, "Error Rate"]}
                />
                <Area
                  type="monotone"
                  dataKey="errorRatePercent"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorErrorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
