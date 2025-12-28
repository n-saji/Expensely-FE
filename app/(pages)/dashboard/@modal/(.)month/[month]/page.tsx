"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function MonthlyDashboardPage() {
  const param = useParams();
  const month = param.month;

  const router = useRouter();
  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Detailed Report for {month} </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          This is the detailed report for the month of {month} inside a modal.
        </div>
        <div className="text-3xl">
          Work in progress...
        </div>
        <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
