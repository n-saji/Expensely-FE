"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginatedLogTable } from "./paginated-log-table";
import LogDetailDialog from "./log-detail-dialog";
import {
  ApiLogRow,
  PageResponse,
  RANGE_OPTIONS,
  RangeOption,
  formatDateForApi,
  rangeToDates,
} from "../types";

const METHOD_OPTIONS = ["ALL", "GET", "POST", "PUT", "PATCH", "DELETE"];

const columns: ColumnDef<ApiLogRow>[] = [
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono text-[10px]">
        {row.original.method}
      </Badge>
    ),
  },
  {
    accessorKey: "path",
    header: "Path",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.path}</span>,
  },
  {
    accessorKey: "statusCode",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.statusCode;
      return (
        <span className={status != null && status >= 400 ? "text-rose-500 font-medium" : ""}>
          {status ?? "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "durationMs",
    header: "Duration",
    cell: ({ row }) => (row.original.durationMs != null ? `${row.original.durationMs} ms` : "—"),
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
];

export default function ApiLogExplorer() {
  const [pageIndex, setPageIndex] = useState(0);
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("ALL");
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [range, setRange] = useState<RangeOption>("30d");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PageResponse<ApiLogRow> | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  useEffect(() => {
    setPageIndex(0);
  }, [path, method, errorsOnly, range]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { startDate } = rangeToDates(range);
        const response = await api.get("/admins/telemetry/api-logs", {
          params: {
            page: pageIndex,
            size: 25,
            path: path || undefined,
            method: method === "ALL" ? undefined : method,
            min_status: errorsOnly ? 400 : undefined,
            start_date: formatDateForApi(startDate),
            end_date: formatDateForApi(new Date()),
          },
        });
        if (!cancelled) {
          setPage(response.data);
        }
      } catch (err) {
        console.error("Error fetching API logs:", err);
        if (!cancelled) {
          toast.error("Failed to load API logs");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pageIndex, path, method, errorsOnly, range]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Path</Label>
          <Input
            placeholder="Search path..."
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-[200px] h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METHOD_OPTIONS.map((option) => (
                <SelectItem key={option} value={option} className="text-xs">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Range</Label>
          <Select value={range} onValueChange={(value) => setRange(value as RangeOption)}>
            <SelectTrigger className="w-[110px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Switch checked={errorsOnly} onCheckedChange={setErrorsOnly} id="errors-only" />
          <Label htmlFor="errors-only" className="text-xs">
            Errors only
          </Label>
        </div>
      </div>

      <PaginatedLogTable
        columns={columns}
        data={page?.content ?? []}
        totalPages={page?.totalPages ?? 0}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
        loading={loading}
        onRowClick={(row) => setSelectedLogId(row.id)}
      />

      <LogDetailDialog
        kind="api"
        id={selectedLogId}
        open={selectedLogId !== null}
        onOpenChange={(open) => !open && setSelectedLogId(null)}
      />
    </div>
  );
}
