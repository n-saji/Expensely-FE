"use client";

import { Label } from "@/components/ui/label";
import Expense from "./_components/expense_old/expense";
import ExpenseTableComponent from "./_components/expense_v2/expense";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
export default function SwitchComponent() {
  const [oldVersion, setOldVersion] = useState(false);
  return (
    <div className="space-y-6 w-full h-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Ledger
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and manage your recent transactions.
          </p>
        </div>
        <div className="flex items-center space-x-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
          <Label htmlFor="oldVersion" className="text-muted-foreground text-xs">
            Use Old Version
          </Label>
          <Switch
            checked={oldVersion}
            id="oldVersion"
            onCheckedChange={(checked) => setOldVersion(checked)}
          />
        </div>
      </div>
      {oldVersion ? <Expense /> : <ExpenseTableComponent />}
    </div>
  );
}
