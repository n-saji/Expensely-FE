"use client";

import { useEffect, useState } from "react";
import { Search, X, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { currencyMapper } from "@/utils/currencyMapper";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ExchangeRateItem {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  updatedAt: string;
}

export default function RatesClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rates, setRates] = useState<ExchangeRateItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async (target?: string) => {
    try {
      setLoading(true);
      const url = target
        ? `/exchange-rates?targetCurrency=${encodeURIComponent(target)}`
        : "/exchange-rates";
      const response = await api.get(url);
      
      if (response.status === 200) {
        setRates(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error("Failed to load exchange rates");
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      toast.error("Error fetching exchange rates");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRates(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <div className="space-y-6 w-full h-full">
      {/* Header Section */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
            General
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Exchange Rates
          </h1>
          <p className="text-sm text-muted-foreground">
            Review live exchange rates relative to USD ($).
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRates(searchQuery)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="text-xs font-semibold">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter / Search Card */}
      <Card className="border border-border/70 bg-background/50 backdrop-blur-sm">
        <CardContent className="p-4 flex items-end">
          <div className="w-full">
            <Label className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Search Target Currency
            </Label>
            <div className="flex items-center relative rounded-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 pr-9 text-muted-foreground bg-background/50 border-border/70 rounded-xl focus-visible:ring-primary focus-visible:ring-offset-0"
                placeholder="Search by currency code (e.g. EUR, INR, GBP)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted rounded-full"
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-border/70 bg-background/50 backdrop-blur-sm shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold text-muted-foreground w-1/4">Base Currency</TableHead>
              <TableHead className="font-semibold text-muted-foreground w-1/4">Target Currency</TableHead>
              <TableHead className="font-semibold text-muted-foreground w-1/4">Exchange Rate</TableHead>
              <TableHead className="font-semibold text-muted-foreground w-1/4 text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading Skeleton
              [...Array(6)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(4)].map((_, i) => (
                    <TableCell key={i} className="py-4">
                      <Skeleton className="h-6 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rates.length > 0 ? (
              rates.map((item, idx) => (
                <TableRow key={`${item.targetCurrency}-${idx}`} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium py-3.5">
                    <span className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-semibold">
                        {item.baseCurrency}
                      </span>
                      <span className="text-muted-foreground text-sm font-normal">
                        ({currencyMapper(item.baseCurrency)})
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="font-medium py-3.5">
                    <span className="flex items-center gap-2">
                      <span className="bg-secondary/20 text-foreground px-2.5 py-1 rounded-md text-xs font-semibold">
                        {item.targetCurrency}
                      </span>
                      <span className="text-muted-foreground text-sm font-normal">
                        ({currencyMapper(item.targetCurrency)})
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-foreground py-3.5 text-base">
                    {item.rate.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm py-3.5 text-right font-medium">
                    {new Date(item.updatedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                  No exchange rates found matching "{searchQuery}".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
