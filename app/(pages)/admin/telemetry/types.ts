export interface TimeBucketCount {
  bucketTime: string;
  requestCount: number;
}

export interface TimeBucketLatency {
  bucketTime: string;
  avgDurationMs: number | null;
  p95DurationMs: number | null;
}

export interface TimeBucketErrorRate {
  bucketTime: string;
  totalCount: number;
  errorCount: number;
}

export interface TelemetryOverviewResponse {
  startDate: string;
  endDate: string;
  bucket: string;
  totalRequests: number;
  avgDurationMs: number;
  p95DurationMs: number;
  errorRatePercent: number;
  volume: TimeBucketCount[];
  latency: TimeBucketLatency[];
  errorRate: TimeBucketErrorRate[];
}

export interface EndpointBreakdownRow {
  method: string;
  path: string;
  requestCount: number;
  avgDurationMs: number | null;
  p95DurationMs: number | null;
  errorCount: number;
}

export interface FunctionFailureRow {
  className: string;
  methodName: string;
  failureCount: number;
}

export interface ApiLogRow {
  id: string;
  userId: string | null;
  requestId: string | null;
  method: string;
  path: string;
  queryString: string | null;
  statusCode: number | null;
  durationMs: number | null;
  createdAt: string;
}

export interface ApiRequestLogDetail extends ApiLogRow {
  ipAddress: string | null;
  userAgent: string | null;
  requestHeaders: string | null;
  responseHeaders: string | null;
  requestBody: string | null;
  responseBody: string | null;
}

export interface FunctionLogRow {
  id: string;
  userId: string | null;
  requestId: string | null;
  layer: string | null;
  className: string;
  methodName: string;
  success: boolean;
  durationMs: number | null;
  createdAt: string;
}

export interface FunctionLogDetail extends FunctionLogRow {
  threadName: string | null;
  arguments: string | null;
  result: string | null;
  errorMessage: string | null;
  stackTrace: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type RangeOption = "1h" | "24h" | "7d" | "30d";

export const RANGE_OPTIONS: { value: RangeOption; label: string; bucket: "hour" | "day" }[] = [
  { value: "1h", label: "1H", bucket: "hour" },
  { value: "24h", label: "24H", bucket: "hour" },
  { value: "7d", label: "7D", bucket: "day" },
  { value: "30d", label: "30D", bucket: "day" },
];

export function rangeToDates(range: RangeOption): { startDate: Date; bucket: "hour" | "day" } {
  const now = new Date();
  const option = RANGE_OPTIONS.find((o) => o.value === range) ?? RANGE_OPTIONS[1];
  const hoursMap: Record<RangeOption, number> = {
    "1h": 1,
    "24h": 24,
    "7d": 24 * 7,
    "30d": 24 * 30,
  };
  const startDate = new Date(now.getTime() - hoursMap[range] * 60 * 60 * 1000);
  return { startDate, bucket: option.bucket };
}

export function formatDateForApi(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
