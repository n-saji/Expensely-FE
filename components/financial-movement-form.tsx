"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { currencyMapper } from "@/utils/currencyMapper";

export type MovementType =
  "TRANSFER" | "DEBT_PAYMENT" | "SAVINGS_TRANSFER" | "INVESTMENT_TRANSFER";
type Entity = {
  id: string;
  name: string;
  currency?: string;
  active: boolean;
  linkedAccountId?: string;
};
export type MovementRecord = {
  id: string;
  type: MovementType;
  amount: number;
  description: string;
  notes?: string | null;
  transactionDate: string;
  accountId?: string | null;
  destinationAccountId?: string | null;
  debtId?: string | null;
  savingsGoalId?: string | null;
  investmentAccountId?: string | null;
  principalAmount?: number | null;
  interestAmount?: number | null;
  categoryId?: string | null;
};

export default function FinancialMovementForm({
  type,
  onCreated,
  initial,
}: {
  type: MovementType;
  onCreated: () => void;
  initial?: MovementRecord;
}) {
  const [accounts, setAccounts] = useState<Entity[]>([]);
  const [targets, setTargets] = useState<Entity[]>([]);
  const [categories, setCategories] = useState<Entity[]>([]);
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interest, setInterest] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const endpoint =
    type === "DEBT_PAYMENT"
      ? "/debts"
      : type === "SAVINGS_TRANSFER"
        ? "/savings-goals"
        : type === "INVESTMENT_TRANSFER"
          ? "/investment-accounts"
          : "/accounts";

  useEffect(() => {
    Promise.all([
      api.get<Entity[]>("/accounts"),
      api.get<Entity[]>(endpoint),
      api.get<Entity[]>("/categories/user?type=expense"),
    ])
      .then(([a, t, c]) => {
        setAccounts(a.data.filter((x) => x.active));
        setTargets(t.data.filter((x) => x.active));
        setCategories(c.data);
      })
      .catch(() => toast.error("Could not load accounts and destinations"));
  }, [endpoint]);
  useEffect(() => {
    if (!initial) return;
    setSource(initial.accountId || "");
    setTarget(
      initial.type === "TRANSFER"
        ? initial.destinationAccountId || ""
        : initial.type === "DEBT_PAYMENT"
          ? initial.debtId || ""
          : initial.type === "SAVINGS_TRANSFER"
            ? initial.savingsGoalId || ""
            : initial.investmentAccountId || "",
    );
    setCategory(initial.categoryId || "");
    setAmount(String(initial.amount));
    setPrincipal(
      initial.principalAmount == null ? "" : String(initial.principalAmount),
    );
    setInterest(
      initial.interestAmount == null ? "" : String(initial.interestAmount),
    );
    setDescription(initial.description || "");
    setNotes(initial.notes || "");
    setDate(initial.transactionDate.slice(0, 10));
  }, [initial]);

  const sourceCurrency = accounts.find((a) => a.id === source)?.currency;
  const destinationOptions = targets.filter((item) => {
    if (type === "TRANSFER")
      return item.id !== source && item.currency === sourceCurrency;
    const linked = accounts.find((a) => a.id === item.linkedAccountId);
    return (
      (item.currency ?? linked?.currency) === sourceCurrency &&
      item.linkedAccountId !== source
    );
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!source || !target || Number(amount) <= 0) {
      toast.error("Select an account, destination, and positive amount");
      return;
    }
    if (
      (principal || interest) &&
      (Number(principal) < 0 ||
        Number(interest) < 0 ||
        Number(principal) + Number(interest) !== Number(amount))
    ) {
      toast.error("Principal and interest must add up to the payment");
      return;
    }
    const payload: Record<string, unknown> = {
      type,
      amount: Number(amount),
      account: { id: source },
      description: description || undefined,
      notes: notes || undefined,
      transactionDate: `${date}T12:00:00`,
    };
    if (type === "TRANSFER") payload.destinationAccount = { id: target };
    if (type === "DEBT_PAYMENT") {
      payload.debt = { id: target };
      if (principal || interest) {
        payload.principalAmount = Number(principal);
        payload.interestAmount = Number(interest);
      }
      if (category) payload.category = { id: category };
    }
    if (type === "SAVINGS_TRANSFER") payload.savingsGoal = { id: target };
    if (type === "INVESTMENT_TRANSFER")
      payload.investmentAccount = { id: target };
    setSaving(true);
    try {
      if (initial) await api.put(`/transactions/update/${initial.id}`, payload);
      else await api.post("/transactions/create", payload);
      toast.success(initial ? "Transaction updated" : "Transaction added");
      window.dispatchEvent(new Event("transaction-added"));
      onCreated();
    } catch (error) {
      toast.error("Could not add transaction", { description: String(error) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1">
        <Label>From account</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger>
            <SelectValue placeholder="Choose account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Amount</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground">
            {sourceCurrency ? currencyMapper(sourceCurrency) : "—"}
          </span>
          <Input
            className="pl-10 font-mono"
            required
            disabled={!source}
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={source ? "0.00" : "Choose an account first"}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>
          {type === "TRANSFER"
            ? "To account"
            : type === "DEBT_PAYMENT"
              ? "Debt"
              : type === "SAVINGS_TRANSFER"
                ? "Savings goal"
                : "Investment account"}
        </Label>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger>
            <SelectValue placeholder="Choose destination" />
          </SelectTrigger>
          <SelectContent>
            {destinationOptions.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {type === "DEBT_PAYMENT" && (
        <div className="space-y-3 rounded-xl border p-3">
          <p className="text-sm font-medium">Optional interest split</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Principal</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>
            <div>
              <Label>Interest</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Interest expense category (optional)" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1">
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      <div className="space-y-1">
        <Label>Date</Label>
        <Input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label>Notes</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Saving…" : initial ? "Save changes" : "Add transaction"}
      </Button>
    </form>
  );
}
