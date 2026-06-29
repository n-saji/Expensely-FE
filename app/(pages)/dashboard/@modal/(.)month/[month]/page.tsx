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
      <DialogContent className="w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-6xl h-[90vh] max-h-[90vh] overflow-y-auto p-4 md:p-8 bg-background border border-border shadow-2xl rounded-2xl scrollbar-thin">
        <div className="mt-2">
          <MonthlyAnalyticsView monthParam={month} typeParam={type} isModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
