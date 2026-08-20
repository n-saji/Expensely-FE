"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/api";
import { currencyMapper } from "@/utils/currencyMapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { toast } from "sonner";

type RangeOption = "7d" | "30d" | "90d" | "1y" | "all";

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

interface ExchangeRateHistoryPoint {
  rate: number;
  recordedAt: string;
}

interface ExchangeRateHistoryResponse {
  baseCurrency: string;
  targetCurrency: string;
  range: string;
  currentRate: number;
  periodChangeAbsolute: number | null;
  periodChangePercent: number | null;
  high: number | null;
  low: number | null;
  points: ExchangeRateHistoryPoint[];
}

interface CurrencyHistoryDialogProps {
  targetCurrency: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ratePrecision(rate: number) {
  return rate < 1 ? 6 : 4;
}

export default function CurrencyHistoryDialog({
  targetCurrency,
  open,
  onOpenChange,
}: CurrencyHistoryDialogProps) {
  const user = useSelector((state: RootState) => state.user);
  const isDark = user?.theme === "dark";

  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<RangeOption>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<ExchangeRateHistoryResponse | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setRange("30d");
    }
  }, [open]);

  useEffect(() => {
    setData(null);
  }, [targetCurrency]);

  useEffect(() => {
    if (!open || !targetCurrency) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await api.get(
          `/exchange-rates/history?targetCurrency=${encodeURIComponent(targetCurrency)}&range=${range}`
        );
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Error fetching exchange rate history:", err);
        if (!cancelled) {
          setError(true);
          toast.error("Failed to load exchange rate history");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, targetCurrency, range, retryKey]);

  const points = data?.points ?? [];
  const hasHistory = points.length > 0;
  const precision = data ? ratePrecision(data.currentRate) : 4;
  const changeIsPositive = (data?.periodChangePercent ?? 0) >= 0;

  const chartData = points.map((point) => ({
    recordedAt: point.recordedAt,
    label: new Date(point.recordedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    rate: point.rate,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-semibold">
              USD
            </span>
            <span className="text-muted-foreground">&rarr;</span>
            <span className="bg-secondary/20 text-foreground px-2.5 py-1 rounded-md text-sm font-semibold">
              {targetCurrency}
            </span>
            <span className="text-muted-foreground text-sm font-normal">
              {targetCurrency ? `(${currencyMapper(targetCurrency)})` : ""}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={range} onValueChange={(value) => setRange(value as RangeOption)}>
            <TabsList>
              {RANGE_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="border border-border/40 bg-card/30 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Current Rate
                </span>
                <span className="text-lg font-bold text-foreground font-mono mt-1">
                  {data ? data.currentRate.toFixed(precision) : "—"}
                </span>
              </div>
              <div className="border border-border/40 bg-card/30 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Change ({RANGE_OPTIONS.find((o) => o.value === range)?.label})
                </span>
                {data?.periodChangePercent != null ? (
                  <span
                    className={`text-lg font-bold font-mono mt-1 flex items-center gap-1 ${
                      changeIsPositive ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {changeIsPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {data.periodChangePercent.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-lg font-bold text-muted-foreground font-mono mt-1">—</span>
                )}
              </div>
              <div className="border border-border/40 bg-card/30 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  High
                </span>
                <span className="text-lg font-bold text-foreground font-mono mt-1">
                  {data?.high != null ? data.high.toFixed(precision) : "—"}
                </span>
              </div>
              <div className="border border-border/40 bg-card/30 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Low
                </span>
                <span className="text-lg font-bold text-foreground font-mono mt-1">
                  {data?.low != null ? data.low.toFixed(precision) : "—"}
                </span>
              </div>
            </div>
          )}

          <div className="h-[260px] border border-border/40 bg-card/15 rounded-xl p-2">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                <p className="text-sm text-muted-foreground">Couldn&apos;t load history. Try again.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            ) : mounted && hasHistory ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="label" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} tickLine={false} />
                  <YAxis
                    stroke={isDark ? "#94a3b8" : "#64748b"}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                    tickFormatter={(val: number) => val.toFixed(precision >= 6 ? 3 : 2)}
                    width={60}
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [Number(val).toFixed(precision), "Rate"]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const recordedAt = payload[0].payload.recordedAt;
                        return new Date(recordedAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        });
                      }
                      return label;
                    }}
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#e2e8f0",
                      borderRadius: "8px",
                      color: isDark ? "#f8fafc" : "#0f172a",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6">
                <LineChartIcon className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  History is still building — check back after the next scheduled rate update.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
