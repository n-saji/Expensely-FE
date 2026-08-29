"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EndpointBreakdownRow, RangeOption, formatDateForApi, rangeToDates } from "../types";

const SORT_OPTIONS = [
  { value: "volume", label: "Highest Volume" },
  { value: "avgDuration", label: "Slowest (Avg)" },
  { value: "p95Duration", label: "Slowest (P95)" },
  { value: "errorCount", label: "Most Errors" },
];

export default function EndpointBreakdownTable({ range }: { range: RangeOption }) {
  const [sortBy, setSortBy] = useState("volume");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rows, setRows] = useState<EndpointBreakdownRow[]>([]);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        const { startDate } = rangeToDates(range);
        const response = await api.get("/admins/telemetry/endpoints", {
          params: {
            start_date: formatDateForApi(startDate),
            end_date: formatDateForApi(new Date()),
            sort_by: sortBy,
            limit: 20,
          },
        });
        if (!cancelled) {
          setRows(response.data);
        }
      } catch (err) {
        console.error("Error fetching endpoint breakdown:", err);
        if (!cancelled) {
          setError(true);
          toast.error("Failed to load endpoint breakdown");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [range, sortBy, retryKey]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-background/50 border-border/40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-center border border-border/40 bg-card/15 rounded-xl">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load endpoint breakdown. Try again.</p>
          <Button variant="outline" size="sm" onClick={() => setRetryKey((k) => k + 1)}>
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Avg</TableHead>
                <TableHead className="text-right">P95</TableHead>
                <TableHead className="text-right">Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row, idx) => (
                  <TableRow key={`${row.method}-${row.path}-${idx}`}>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {row.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.path}</TableCell>
                    <TableCell className="text-right">{row.requestCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {row.avgDurationMs != null ? `${row.avgDurationMs.toFixed(0)} ms` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.p95DurationMs != null ? `${row.p95DurationMs.toFixed(0)} ms` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.errorCount > 0 ? (
                        <span className="text-rose-500 font-medium">{row.errorCount}</span>
                      ) : (
                        row.errorCount
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No requests in this time range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
