"use client";

import { Label } from "@/components/ui/label";
import Expense from "./_components/expense_old/expense";
import ExpenseTableComponent from "./_components/expense_v2/expense";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SwitchComponent() {
  const router = useRouter();
  const [oldVersion, setOldVersion] = useState(false);
  const [downloadHandler, setDownloadHandler] = useState<(() => void) | null>(
    null,
  );

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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!oldVersion && (
            <>
              <Button
                variant="outline"
                onClick={() => downloadHandler?.()}
                disabled={!downloadHandler}
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button onClick={() => router.push("/expense/add")}>
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </>
          )}
        </div>
      </div>
      {oldVersion ? (
        <Expense />
      ) : (
        <ExpenseTableComponent
          onRegisterDownloadHandler={(handler) => {
            if (!handler) {
              setDownloadHandler(null);
              return;
            }
            setDownloadHandler(() => handler);
          }}
        />
      )}
    </div>
  );
}
