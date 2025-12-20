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
      <div className="justify-end flex items-center space-x-2">
        <Label htmlFor="oldVersion" className="text-muted-foreground text-xs">
          Use Old Version
        </Label>
        <Switch
          checked={oldVersion}
          id="oldVersion"
          onCheckedChange={(checked) => setOldVersion(checked)}
        />
      </div>
      {oldVersion ? <Expense /> : <ExpenseTableComponent />}
    </div>
  );
}
