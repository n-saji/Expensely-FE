"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RANGE_OPTIONS, RangeOption } from "./types";
import OverviewCharts from "./_components/overview-charts";
import EndpointBreakdownTable from "./_components/endpoint-breakdown-table";
import ApiLogExplorer from "./_components/api-log-explorer";
import FunctionLogExplorer from "./_components/function-log-explorer";

export default function TelemetryDashboard() {
  const [range, setRange] = useState<RangeOption>("24h");

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Administration
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Telemetry
          </h1>
          <p className="text-sm text-muted-foreground">
            API health, latency, and error trends captured from live traffic.
          </p>
        </div>
        <Tabs value={range} onValueChange={(value) => setRange(value as RangeOption)}>
          <TabsList>
            {RANGE_OPTIONS.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="api-logs">API Logs</TabsTrigger>
          <TabsTrigger value="function-logs">Function Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewCharts range={range} />
        </TabsContent>
        <TabsContent value="endpoints" className="mt-4">
          <EndpointBreakdownTable range={range} />
        </TabsContent>
        <TabsContent value="api-logs" className="mt-4">
          <ApiLogExplorer />
        </TabsContent>
        <TabsContent value="function-logs" className="mt-4">
          <FunctionLogExplorer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
