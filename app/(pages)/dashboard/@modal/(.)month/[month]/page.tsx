"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import MonthlyAnalyticsView from "@/app/(pages)/dashboard/month/MonthlyAnalyticsView";

export default function MonthlyDashboardModalPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const month = params.month as string;
  const type = searchParams.get("type") === "income" ? "income" : "expense";

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-[90vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-6xl h-[90dvh] max-h-[90dvh] min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-8 bg-background border border-border shadow-2xl rounded-2xl scrollbar-thin">
        <div className="mt-2 min-w-0 max-w-full">
          <MonthlyAnalyticsView monthParam={month} typeParam={type} isModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
