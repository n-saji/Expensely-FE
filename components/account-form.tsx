"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currencyCodes,
  currencyMap,
  currencyNames,
} from "@/utils/currencyMapper";
import { toast } from "sonner";

const accountTypes = [
  ["CHECKING", "Checking"],
  ["SAVINGS", "Savings"],
  ["CASH", "Cash"],
  ["CREDIT_CARD", "Credit card"],
  ["BROKERAGE", "Brokerage"],
  ["OTHER", "Other"],
] as const;

type AccountInitial = {
  id: string;
  name: string;
  type?: string;
  currency?: string;
  openingBalance?: number | string;
  active?: boolean;
};
export default function AccountForm({
  onSaved,
  defaultCurrency = "USD",
  initial,
}: {
  onSaved: () => void | Promise<void>;
  defaultCurrency?: string;
  initial?: AccountInitial;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "CHECKING");
  const [currency, setCurrency] = useState(
    initial?.currency ||
      (currencyCodes.includes(defaultCurrency) ? defaultCurrency : "USD"),
  );
  const [openingBalance, setOpeningBalance] = useState(
    String(initial?.openingBalance ?? 0),
  );
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        currency,
        openingBalance: Number(openingBalance || 0),
        active: initial?.active ?? true,
      };
      if (initial) await api.put(`/accounts/${initial.id}`, payload);
      else await api.post("/accounts", payload);
      toast.success(initial ? "Account updated" : "Account created");
      window.dispatchEvent(new Event("account-added"));
      await onSaved();
    } catch (error) {
      const message = (
        error as {
          response?: { data?: { message?: string; error?: string } | string };
        }
      ).response?.data;
      toast.error("Could not create account", {
        description:
          typeof message === "string"
            ? message
            : message?.error || message?.message,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="account-name">Account name</Label>
        <Input
          id="account-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Everyday checking"
        />
      </div>
      <div className="space-y-2">
        <Label>Account type</Label>
        <Select
          value={type}
          onValueChange={setType}
          disabled={Boolean(initial)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {accountTypes.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={currency}
            onValueChange={setCurrency}
            disabled={Boolean(initial)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {currencyCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span className="w-6 font-semibold">
                      {currencyMap[code]}
                    </span>
                    <span>{code}</span>
                    <span className="hidden text-muted-foreground sm:inline">
                      · {currencyNames[code]}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="opening-balance">Opening balance</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground">
              {currencyMap[currency]}
            </span>
            <Input
              id="opening-balance"
              className="pl-10 text-right font-mono"
              required
              type="number"
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Choose the currency before entering the balance. Amounts use the
        selected currency’s regional grouping.
      </p>
      <Button
        className="w-full"
        type="submit"
        disabled={saving || !name.trim()}
      >
        {saving ? "Saving…" : initial ? "Save changes" : "Create account"}
      </Button>
    </form>
  );
}
