"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import CategoryBadge from "@/components/category-badge";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  category: Category;
  amount: number | null;
  currency: string | null;
  priority: string;
  status: string;
}

export default function RemindersDashboardWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    upcoming: 0,
    snoozed: 0,
    missed: 0,
    completed: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/v1/reminders?size=100");
      if (res.status === 200) {
        const list: Reminder[] = res.data.content || [];

        // 1. Calculate stats across all types
        setStats({
          upcoming: list.filter(
            (r) => r.status === "UPCOMING" || r.status === "NOTIFIED",
          ).length,
          snoozed: list.filter((r) => r.status === "SNOOZED").length,
          missed: list.filter((r) => r.status === "MISSED").length,
          completed: list.filter((r) => r.status === "COMPLETED").length,
        });

        // 2. Filter only upcoming reminders and sort by due date ascending
        const upcoming = list
          .filter((r) => r.status === "UPCOMING" || r.status === "NOTIFIED")
          .sort(
            (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
          );

        setReminders(upcoming);
      }
    } catch (e) {
      console.error("Failed to load reminders for widget:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "HIGH":
        return "bg-rose-500/15 text-rose-500 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/15 text-amber-500 border-amber-500/20";
      default:
        return "bg-blue-500/15 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <Card className="w-full h-full border-border/40 shadow-none overflow-hidden bg-card/30 backdrop-blur-sm flex flex-col justify-between min-h-[380px]">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
              Reminders
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.upcoming} active reminder{stats.upcoming === 1 ? "" : "s"}
            </p>
          </div>

          <Link
            href="/reminder"
            className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-400 transition-colors font-medium"
          >
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col min-h-0 pt-0 pb-6 px-6">
        {/* Stats on all reminder types in first row */}
        <div className="grid grid-cols-4 gap-2 pb-4">
          <div className="flex flex-col items-center p-2 rounded-xl border border-border/40 bg-muted/20 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mb-1 text-teal-500" />
            <span className="text-[10px] font-bold text-foreground">
              {stats.upcoming}
            </span>
            <span className="text-[8px] uppercase tracking-wider mt-0.5 font-medium opacity-80">
              Due
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl border border-border/40 bg-muted/20 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mb-1 text-violet-500" />
            <span className="text-[10px] font-bold text-foreground">
              {stats.snoozed}
            </span>
            <span className="text-[8px] uppercase tracking-wider mt-0.5 font-medium opacity-80">
              Snooze
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl border border-border/40 bg-muted/20 text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 mb-1 text-rose-500" />
            <span className="text-[10px] font-bold text-foreground">
              {stats.missed}
            </span>
            <span className="text-[8px] uppercase tracking-wider mt-0.5 font-medium opacity-80">
              Missed
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl border border-border/40 bg-muted/20 text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 mb-1 text-emerald-500" />
            <span className="text-[10px] font-bold text-foreground">
              {stats.completed}
            </span>
            <span className="text-[8px] uppercase tracking-wider mt-0.5 font-medium opacity-80">
              Done
            </span>
          </div>
        </div>

        {/* Scrollable list showing upcoming reminders in ascending order */}
        <div className="flex-1 min-h-0 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-teal-500" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-muted-foreground">
                No upcoming reminders found
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-2">
              <div className="space-y-2">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="rounded-xl border border-border/40 bg-background/40 p-2.5 space-y-1.5 hover:border-teal-500/20 transition-all"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className="text-xs font-bold text-foreground truncate max-w-[140px]"
                        title={reminder.title}
                      >
                        {reminder.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`rounded-full px-1.5 py-0 text-[8px] ${getPriorityColor(reminder.priority)}`}
                      >
                        {reminder.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <CategoryBadge
                        name={reminder.category?.name}
                        icon={reminder.category?.icon}
                        color={reminder.category?.color}
                        size="sm"
                        showName={false}
                      />
                      <span className="text-[9px]">
                        {new Date(reminder.dueAt).toLocaleDateString()}
                      </span>
                      {reminder.amount && (
                        <span className="font-extrabold text-foreground">
                          {reminder.currency || "USD"}{" "}
                          {Number(reminder.amount).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
