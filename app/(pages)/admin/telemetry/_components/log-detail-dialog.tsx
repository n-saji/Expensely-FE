"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ApiRequestLogDetail, FunctionLogDetail } from "../types";

function tryPrettyPrint(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
      <pre className="text-xs font-mono bg-muted/30 rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap break-all">
        {value}
      </pre>
    </div>
  );
}

interface LogDetailDialogProps {
  kind: "api" | "function";
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LogDetailDialog({ kind, id, open, onOpenChange }: LogDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [apiLog, setApiLog] = useState<ApiRequestLogDetail | null>(null);
  const [functionLog, setFunctionLog] = useState<FunctionLogDetail | null>(null);

  useEffect(() => {
    if (!open || !id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setApiLog(null);
        setFunctionLog(null);
        const path = kind === "api" ? `/admins/telemetry/api-logs/${id}` : `/admins/telemetry/function-logs/${id}`;
        const response = await api.get(path);
        if (!cancelled) {
          if (kind === "api") {
            setApiLog(response.data);
          } else {
            setFunctionLog(response.data);
          }
        }
      } catch (err) {
        console.error("Error fetching log detail:", err);
        if (!cancelled) {
          toast.error("Failed to load log details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, id, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {kind === "api" ? "API Request Log" : "Function Log"}
            {kind === "api" && apiLog?.statusCode != null && (
              <Badge variant={apiLog.statusCode >= 400 ? "destructive" : "secondary"}>
                {apiLog.statusCode}
              </Badge>
            )}
            {kind === "function" && functionLog && (
              <Badge variant={functionLog.success ? "secondary" : "destructive"}>
                {functionLog.success ? "Success" : "Failure"}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : kind === "api" && apiLog ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <DetailField label="Method" value={apiLog.method} />
              <DetailField label="Path" value={apiLog.path} />
              <DetailField label="Duration" value={apiLog.durationMs != null ? `${apiLog.durationMs} ms` : "—"} />
              <DetailField label="IP Address" value={apiLog.ipAddress ?? "—"} />
              <DetailField label="Request ID" value={apiLog.requestId ?? "—"} />
              <DetailField label="Created At" value={new Date(apiLog.createdAt).toLocaleString()} />
            </div>
            <DetailField label="Query String" value={apiLog.queryString ?? "—"} />
            <DetailField label="Request Headers" value={tryPrettyPrint(apiLog.requestHeaders)} />
            <DetailField label="Response Headers" value={tryPrettyPrint(apiLog.responseHeaders)} />
            <DetailField label="Request Body" value={tryPrettyPrint(apiLog.requestBody)} />
            <DetailField label="Response Body" value={tryPrettyPrint(apiLog.responseBody)} />
          </div>
        ) : kind === "function" && functionLog ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <DetailField label="Class" value={functionLog.className} />
              <DetailField label="Method" value={functionLog.methodName} />
              <DetailField label="Layer" value={functionLog.layer ?? "—"} />
              <DetailField label="Duration" value={functionLog.durationMs != null ? `${functionLog.durationMs} ms` : "—"} />
              <DetailField label="Thread" value={functionLog.threadName ?? "—"} />
              <DetailField label="Created At" value={new Date(functionLog.createdAt).toLocaleString()} />
            </div>
            <DetailField label="Arguments" value={tryPrettyPrint(functionLog.arguments)} />
            <DetailField label="Result" value={tryPrettyPrint(functionLog.result)} />
            {!functionLog.success && (
              <>
                <DetailField label="Error Message" value={functionLog.errorMessage ?? "—"} />
                <DetailField label="Stack Trace" value={functionLog.stackTrace ?? "—"} />
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
