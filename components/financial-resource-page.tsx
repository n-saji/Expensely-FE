"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowUpRight,
  Landmark,
  Plus,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AccountForm from "@/components/account-form";
import {
  currencyCodes,
  currencyMap,
  currencyNames,
  formatCurrency,
} from "@/utils/currencyMapper";

type Kind = "accounts" | "debts" | "savings-goals" | "investment-accounts";
type Row = Record<string, string | number | boolean | null> & {
  id: string;
  name: string;
  active: boolean;
};
type Field = [string, string, ("number" | "date" | "text")?];
const configs: Record<
  Kind,
  {
    title: string;
    eyebrow: string;
    noun: string;
    description: string;
    total: string;
    fields: Field[];
  }
> = {
  accounts: {
    title: "Accounts",
    eyebrow: "Money hub",
    noun: "account",
    total: "balance",
    description:
      "See cash, cards, savings, and brokerage balances in one place.",
    fields: [],
  },
  debts: {
    title: "Debts",
    eyebrow: "Liabilities",
    noun: "debt",
    total: "currentBalance",
    description:
      "Track principal separately from interest and keep payment history intact.",
    fields: [
      ["name", "Name"],
      ["debtType", "Debt type"],
      ["currency", "Currency"],
      ["originalBalance", "Original balance", "number"],
      ["openingBalance", "Current opening balance", "number"],
      ["interestRate", "Interest rate (%)", "number"],
      ["minimumPayment", "Minimum payment", "number"],
      ["dueDate", "Due date", "date"],
      ["lender", "Lender"],
      ["linkedAccountId", "Credit card account (optional)"],
    ],
  },
  "savings-goals": {
    title: "Savings goals",
    eyebrow: "Plans",
    noun: "goal",
    total: "currentAmount",
    description: "Earmark money already held in your savings accounts.",
    fields: [
      ["name", "Goal name"],
      ["linkedAccountId", "Savings account"],
      ["targetAmount", "Target amount", "number"],
      ["openingAmount", "Already saved", "number"],
      ["targetDate", "Target date", "date"],
    ],
  },
  "investment-accounts": {
    title: "Investments",
    eyebrow: "Portfolio",
    noun: "investment account",
    total: "contributions",
    description: "Track contributions to brokerage and investment accounts.",
    fields: [
      ["name", "Name"],
      ["accountType", "Investment type"],
      ["linkedAccountId", "Brokerage account"],
      ["provider", "Provider"],
      ["openingContributions", "Previous contributions", "number"],
    ],
  },
};
const debtTypes = [
  ["STUDENT_LOAN", "Student loan"],
  ["CREDIT_CARD", "Credit card"],
  ["AUTO_LOAN", "Auto loan"],
  ["PERSONAL_LOAN", "Personal loan"],
  ["MORTGAGE", "Mortgage"],
  ["OTHER", "Other"],
] as const;
const investmentTypes = [
  ["BROKERAGE", "Brokerage"],
  ["RETIREMENT", "Retirement"],
  ["CRYPTO", "Crypto"],
  ["MUTUAL_FUND", "Mutual fund"],
  ["OTHER", "Other"],
] as const;

export default function FinancialResourcePage({ kind }: { kind: Kind }) {
  const config = configs[kind];
  const [rows, setRows] = useState<Row[]>([]),
    [accounts, setAccounts] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null),
    [form, setForm] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [history, setHistory] = useState<Row[]>([]),
    [historyId, setHistoryId] = useState("");
  const load = useCallback(async () => {
    try {
      const [resource, accountList] = await Promise.all([
        api.get<Row[]>(`/${kind}`),
        api.get<Row[]>("/accounts"),
      ]);
      setRows(resource.data);
      setAccounts(accountList.data);
    } catch {
      toast.error(`Could not load ${config.title.toLowerCase()}`);
    }
  }, [kind, config.title]);
  useEffect(() => {
    void load();
  }, [load]);
  const rowCurrency = (row: Row) =>
    String(
      row.currency ||
        accounts.find((a) => a.id === row.linkedAccountId)?.currency ||
        "USD",
    );
  const totalsByCurrency = useMemo(() => {
    return rows
      .filter((row) => row.active)
      .reduce<Record<string, number>>((totals, row) => {
        const currency = String(
          row.currency ||
            accounts.find((account) => account.id === row.linkedAccountId)
              ?.currency ||
            "USD",
        );
        totals[currency] =
          (totals[currency] || 0) + Number(row[config.total] || 0);
        return totals;
      }, {});
  }, [accounts, config.total, rows]);
  function start(row?: Row) {
    setEditing(row ?? null);
    setForm(
      row
        ? Object.fromEntries(
            config.fields.map(([key]) => [key, String(row[key] ?? "")]),
          )
        : {
            currency: "USD",
            debtType: "STUDENT_LOAN",
            accountType: "BROKERAGE",
            openingBalance: "0",
            originalBalance: "0",
            openingAmount: "0",
            openingContributions: "0",
            targetAmount: "0",
          },
    );
    setOpen(true);
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const payload: Record<string, unknown> = {
      ...form,
      active: editing?.active ?? true,
    };
    config.fields.forEach(([key, , type]) => {
      if (type === "number")
        payload[key] = form[key] ? Number(form[key]) : null;
    });
    if (form.linkedAccountId)
      payload.linkedAccount = { id: form.linkedAccountId };
    delete payload.linkedAccountId;
    try {
      if (editing) await api.put(`/${kind}/${editing.id}`, payload);
      else await api.post(`/${kind}`, payload);
      setOpen(false);
      await load();
      toast.success(`${config.noun} saved`);
    } catch (error) {
      const data = (
        error as {
          response?: { data?: { message?: string; error?: string } | string };
        }
      ).response?.data;
      toast.error(`Could not save ${config.noun}`, {
        description:
          typeof data === "string" ? data : data?.error || data?.message,
      });
    } finally {
      setBusy(false);
    }
  }
  async function archive(row: Row) {
    if (
      !window.confirm(`Archive ${row.name}? Its history will remain available.`)
    )
      return;
    try {
      await api.delete(`/${kind}/${row.id}`);
      await load();
    } catch {
      toast.error("Could not archive");
    }
  }
  async function showHistory(row: Row) {
    try {
      const res = await api.get<Row[]>(`/debts/${row.id}/payments`);
      setHistory(res.data);
      setHistoryId(row.id);
    } catch {
      toast.error("Could not load payment history");
    }
  }
  const Icon =
    kind === "accounts"
      ? WalletCards
      : kind === "debts"
        ? Landmark
        : kind === "savings-goals"
          ? Target
          : TrendingUp;
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {config.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            {config.title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {config.description}
          </p>
        </div>
        <Button onClick={() => start()}>
          <Plus className="size-4" />
          Add {config.noun}
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/40 bg-card/30 shadow-none">
          <CardContent className="flex min-h-36 items-end justify-between p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Active total
              </p>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                {Object.entries(totalsByCurrency).length ? (
                  Object.entries(totalsByCurrency).map(([currency, value]) => (
                    <p
                      key={currency}
                      className="font-mono text-3xl font-light tracking-tight"
                    >
                      {formatCurrency(value, currency)}
                    </p>
                  ))
                ) : (
                  <p className="font-mono text-3xl font-light tracking-tight">
                    {formatCurrency(0, "USD")}
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Calculated from opening amounts and transaction history
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
              <Icon className="size-7 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/30 shadow-none">
          <CardContent className="flex h-full min-h-36 items-center justify-between p-6">
            <div>
              <p className="font-mono text-3xl font-light">
                {rows.filter((r) => r.active).length}
              </p>
              <p className="text-sm text-muted-foreground">
                Active {config.title.toLowerCase()}
              </p>
            </div>
            <div className="h-12 w-24 rounded-full bg-[repeating-linear-gradient(90deg,hsl(var(--primary))_0_4px,transparent_4px_8px)] opacity-50" />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <Card
            key={row.id}
            className={`border-border/40 bg-card/30 shadow-none transition-colors hover:border-border ${!row.active ? "opacity-60" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {String(
                      row.type ||
                        row.debtType ||
                        row.accountType ||
                        config.noun,
                    ).replaceAll("_", " ")}
                  </p>
                  <CardTitle className="mt-1 text-base font-medium">
                    {row.name}
                  </CardTitle>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] ${row.active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
                >
                  {row.active ? "Active" : "Archived"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-mono text-2xl font-light">
                {formatCurrency(
                  Number(row[config.total] || 0),
                  rowCurrency(row),
                )}
              </p>
              {kind === "savings-goals" && (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      {Math.min(
                        100,
                        Math.round(
                          (Number(row.currentAmount || 0) /
                            Math.max(Number(row.targetAmount || 1), 1)) *
                            100,
                        ),
                      )}
                      % funded
                    </span>
                    <span>
                      {formatCurrency(
                        Number(row.targetAmount || 0),
                        rowCurrency(row),
                      )}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(100, (Number(row.currentAmount || 0) / Math.max(Number(row.targetAmount || 1), 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {kind === "debts" && (
                <p className="text-xs text-muted-foreground">
                  Original{" "}
                  {formatCurrency(
                    Number(row.originalBalance || 0),
                    rowCurrency(row),
                  )}{" "}
                  · {row.interestRate || 0}% APR
                </p>
              )}
              <div className="flex gap-2 border-t border-border/30 pt-3">
                <Button size="sm" variant="ghost" onClick={() => start(row)}>
                  Edit
                </Button>
                {kind === "debts" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => showHistory(row)}
                  >
                    Payments
                  </Button>
                )}
                {row.active && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => archive(row)}
                  >
                    <Archive className="size-3.5" />
                    Archive
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!rows.length && (
        <div className="rounded-2xl border border-dashed border-border/70 py-14 text-center">
          <Icon className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">
            No {config.title.toLowerCase()} yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first {config.noun} to get started.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => start()}>
            Add {config.noun}
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Add"} {config.noun}
            </DialogTitle>
            <DialogDescription>
              {kind === "accounts"
                ? "Choose the account currency first; every transaction in this account will use it."
                : config.description}
            </DialogDescription>
          </DialogHeader>
          {kind === "accounts" ? (
            <AccountForm
              initial={
                editing
                  ? {
                      id: editing.id,
                      name: editing.name,
                      type: String(editing.type || "CHECKING"),
                      currency: String(editing.currency || "USD"),
                      openingBalance: Number(editing.openingBalance || 0),
                      active: editing.active,
                    }
                  : undefined
              }
              onSaved={async () => {
                setOpen(false);
                await load();
              }}
            />
          ) : (
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              {config.fields
                .filter(
                  ([key]) =>
                    !editing ||
                    ![
                      "debtType",
                      "accountType",
                      "currency",
                      "originalBalance",
                      "openingBalance",
                      "openingAmount",
                      "openingContributions",
                      "linkedAccountId",
                    ].includes(key),
                )
                .map(([key, label, fieldType]) => {
                  const isSelect = [
                    "debtType",
                    "accountType",
                    "currency",
                    "linkedAccountId",
                  ].includes(key);
                  const currency =
                    form.currency ||
                    String(
                      accounts.find((a) => a.id === form.linkedAccountId)
                        ?.currency || "USD",
                    );
                  return (
                    <div
                      key={key}
                      className={`space-y-2 ${["name", "linkedAccountId"].includes(key) ? "sm:col-span-2" : ""}`}
                    >
                      <Label htmlFor={key}>{label}</Label>
                      {isSelect ? (
                        <Select
                          value={form[key] || ""}
                          onValueChange={(value) =>
                            setForm({ ...form, [key]: value })
                          }
                        >
                          <SelectTrigger id={key} className="w-full">
                            <SelectValue placeholder="Choose…" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {key === "currency"
                              ? currencyCodes.map((code) => (
                                  <SelectItem key={code} value={code}>
                                    {currencyMap[code]} {code} ·{" "}
                                    {currencyNames[code]}
                                  </SelectItem>
                                ))
                              : key === "debtType"
                                ? debtTypes.map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                      {l}
                                    </SelectItem>
                                  ))
                                : key === "accountType"
                                  ? investmentTypes.map(([v, l]) => (
                                      <SelectItem key={v} value={v}>
                                        {l}
                                      </SelectItem>
                                    ))
                                  : accounts
                                      .filter(
                                        (a) =>
                                          a.active &&
                                          (kind === "debts"
                                            ? a.type === "CREDIT_CARD"
                                            : kind === "savings-goals"
                                              ? a.type === "SAVINGS"
                                              : a.type === "BROKERAGE"),
                                      )
                                      .map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                          {a.name} · {a.currency}
                                        </SelectItem>
                                      ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="relative">
                          {fieldType === "number" && key !== "interestRate" && (
                            <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                              {currencyMap[currency]}
                            </span>
                          )}
                          <Input
                            id={key}
                            required={[
                              "name",
                              "targetAmount",
                              "originalBalance",
                              "openingBalance",
                            ].includes(key)}
                            className={
                              fieldType === "number" && key !== "interestRate"
                                ? "pl-10 font-mono"
                                : ""
                            }
                            type={fieldType || "text"}
                            step={fieldType === "number" ? "0.01" : undefined}
                            value={form[key] || ""}
                            onChange={(e) =>
                              setForm({ ...form, [key]: e.target.value })
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              <Button type="submit" disabled={busy} className="sm:col-span-2">
                {busy ? "Saving…" : "Save"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!historyId}
        onOpenChange={(value) => !value && setHistoryId("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment history</DialogTitle>
          </DialogHeader>
          <div className="divide-y divide-border/40">
            {history.map((item) => (
              <Link
                key={item.id}
                href="/transaction"
                className="flex justify-between py-3 text-sm"
              >
                <span>{String(item.transactionDate).slice(0, 10)}</span>
                <span className="font-mono">
                  {formatCurrency(
                    Number(item.amount || 0),
                    String(item.currency || "USD"),
                  )}
                </span>
              </Link>
            ))}
            {!history.length && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No payments yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
