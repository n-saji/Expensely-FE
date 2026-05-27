"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { currencyCodes, currencyMap } from "@/utils/currencyMapper";

interface CurrencyDrawerProps {
  value: string;
  onChange: (value: string) => void;
  userCurrency?: string;
  className?: string;
  disabled?: boolean;
}

export default function CurrencyDrawer({
  value,
  onChange,
  userCurrency,
  className,
  disabled,
}: CurrencyDrawerProps) {
  const resolvedValue = value || userCurrency || "USD";

  const orderedCodes = useMemo(() => {
    const codes = [...currencyCodes];
    if (userCurrency && codes.includes(userCurrency)) {
      return [userCurrency, ...codes.filter((code) => code !== userCurrency)];
    }
    return codes;
  }, [userCurrency]);

  const formatCurrencyLabel = (code: string) => {
    const symbol = currencyMap[code];
    return symbol ? `${code} ${symbol}` : code;
  };

  return (
    <Select value={resolvedValue} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("justify-between", className)}>
        <SelectValue placeholder="Currency">
          {formatCurrencyLabel(resolvedValue)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {orderedCodes.map((code) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span className="font-medium">{code}</span>
              <span className="text-muted-foreground">
                {currencyMap[code] || code}
              </span>
              {userCurrency === code && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Preferred
                </span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
