"use client";

import { useState } from "react";
import { ArrowLeftRight, Coins, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/api";
import CurrencyDrawer from "@/components/currency-drawer";
import { currencyMapper } from "@/utils/currencyMapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ConversionResult {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  amount: number;
  convertedAmount: number;
}

export default function ConvertClient() {
  const user = useSelector((state: RootState) => state.user);

  const [baseCurrency, setBaseCurrency] = useState(user.currency || "USD");
  const [targetCurrency, setTargetCurrency] = useState(user.currency || "INR");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);

  const handleSwap = () => {
    if (!targetCurrency) {
      toast.warning("Please select a target currency first to swap.");
      return;
    }
    const temp = baseCurrency;
    setBaseCurrency(targetCurrency);
    setTargetCurrency(temp);
    setResult(null);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCurrency) {
      setShowValidationError(true);
      toast.error("Target currency is required");
      return;
    }
    setShowValidationError(false);

    try {
      setLoading(true);

      let url = `/exchange-rates/convert?baseCurrency=${encodeURIComponent(baseCurrency)}&targetCurrency=${encodeURIComponent(targetCurrency)}`;
      if (amount.trim() !== "") {
        url += `&amount=${encodeURIComponent(amount)}`;
      }

      const response = await api.get(url);

      if (response.status === 200) {
        setResult(response.data);
      } else {
        toast.error("Conversion failed. Please try again.");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Error performing currency conversion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full h-full">
      {/* Header Section */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
          General
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Currency Converter
        </h1>
        <p className="text-sm text-muted-foreground">
          Convert currencies in real time using latest exchange rates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
        {/* Converter Form Card */}
        <Card className="lg:col-span-7 border border-border/70 bg-background/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span>Exchange Calculator</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConvert} className="space-y-5">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="1.00 (default if empty)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-background/50 border-border/70 rounded-xl focus-visible:ring-primary focus-visible:ring-offset-0 text-foreground py-5 font-mono text-base"
                />
              </div>

              {/* Currency Selector Grid with Swap */}
              <div className="grid grid-cols-1 md:grid-cols-9 gap-4 items-center">
                {/* Base Currency Selector */}
                <div className="md:col-span-4 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    From (Base Currency)
                  </Label>
                  <CurrencyDrawer
                    value={baseCurrency}
                    onChange={(val) => {
                      setBaseCurrency(val);
                      setResult(null);
                    }}
                    userCurrency={user.currency}
                    className="w-full bg-background/50 border-border/70 rounded-xl py-5"
                  />
                </div>

                {/* Swap Button */}
                <div className="md:col-span-1 flex justify-center pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSwap}
                    className="h-10 w-10 rounded-full border-border/70 hover:bg-primary-500/10 hover:text-primary transition-all duration-300 hover:rotate-180"
                    title="Swap Currencies"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Target Currency Selector */}
                <div className="md:col-span-4 space-y-2">
                  <Label className={`text-xs font-bold uppercase tracking-[0.1em] ${showValidationError && !targetCurrency ? "text-destructive" : "text-muted-foreground"}`}>
                    To (Target Currency) *
                  </Label>
                  <CurrencyDrawer
                    value={targetCurrency}
                    onChange={(val) => {
                      setTargetCurrency(val);
                      setShowValidationError(false);
                      setResult(null);
                    }}
                    userCurrency={user.currency}
                    className={`w-full bg-background/50 rounded-xl py-5 ${showValidationError && !targetCurrency ? "border-destructive ring-1 ring-destructive" : "border-border/70"}`}
                  />
                  {showValidationError && !targetCurrency && (
                    <p className="text-[11px] text-destructive font-medium mt-1">
                      Target currency is required.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 rounded-xl transition-all shadow hover:shadow-md"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert Money"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm shadow-md animate-in fade-in slide-in-from-bottom-3 duration-300">
              <CardHeader className="border-b border-border/50 pb-3">
                <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Conversion Results
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    {result.amount.toFixed(2)} {result.baseCurrency} ({currencyMapper(result.baseCurrency)}) =
                  </p>
                  <p className="text-3xl font-extrabold text-foreground tracking-tight py-1 font-mono">
                    {result.convertedAmount.toFixed(4)}{" "}
                    <span className="text-primary text-2xl font-bold">
                      {result.targetCurrency}
                    </span>
                  </p>
                </div>

                <div className="h-px bg-border/60" />

                {/* Rate details */}
                <div className="space-y-2 text-xs md:text-sm font-medium text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Exchange Rate:</span>
                    <span className="text-foreground font-semibold font-mono">
                      1 {result.baseCurrency} = {result.rate.toFixed(4)} {result.targetCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inverse Rate:</span>
                    <span className="text-foreground font-semibold font-mono">
                      1 {result.targetCurrency} = {(1 / result.rate).toFixed(4)} {result.baseCurrency}
                    </span>
                  </div>
                </div>

                <div className="bg-background/40 border border-border/40 p-3 rounded-lg text-center text-xs text-muted-foreground">
                  Calculated using live USD-based mid-market rates.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-dashed border-border/80 bg-muted/10 h-[290px] flex flex-col items-center justify-center text-center p-6 rounded-xl">
              <div className="bg-muted/40 p-4 rounded-full mb-3 text-muted-foreground">
                <Coins className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No Conversion Active</h3>
              <p className="text-xs text-muted-foreground max-w-[240px] mt-1">
                Select your currencies and amount, then click "Convert Money" to see calculations here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
