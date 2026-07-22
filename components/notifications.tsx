import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import api from "@/lib/api";
import {
  BadgeAlert,
  BadgeCheck,
  BadgeInfo,
  BadgeX,
  Bell,
  MoreHorizontal,
  Check,
  Clock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { RootState } from "@/redux/store";
import { formatNotificationTime } from "@/utils/time";

export default function Notifications({
  notifications,
  markAllAsRead,
  markIndividualAsRead,
  deleteNotificationFunc,
}: {
  notifications: RootState["notification"];
  markAllAsRead: () => void;
  markIndividualAsRead: (id: string) => void;
  deleteNotificationFunc: (id: string) => void;
}) {
  const handleCompleteReminder = async (reminderId: string, notificationId: string) => {
    try {
      await api.patch(`/v1/reminders/${reminderId}/complete`);
      markIndividualAsRead(notificationId);
    } catch (e) {
      console.error("Failed to complete reminder:", e);
    }
  };

  const handleSnoozeReminder = async (reminderId: string, notificationId: string, duration: string) => {
    try {
      await api.patch(`/v1/reminders/${reminderId}/snooze`, { duration });
      markIndividualAsRead(notificationId);
    } catch (e) {
      console.error("Failed to snooze reminder:", e);
    }
  };

  const messageLength = useMemo(
    () => notifications.notifications.filter((n) => !n.isRead).length,
    [notifications.notifications],
  );

  useNow();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Bell className="w-6 h-6 " />
                {messageLength > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                    aria-label="Unread notifications"
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-center">Notifications</p>
            </TooltipContent>
          </Tooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80 md:w-md overflow-hidden border-border/70 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Inbox
            </p>
            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              {messageLength} new
            </Badge>
          </div>
        </div>
        <ScrollArea className="h-96 w-full">
          {notifications.notifications.length === 0 ? (
            <div className="flex flex-col justify-center items-center p-6 text-center">
              <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <Label className="text-muted-foreground mt-2">
                No notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                You are all caught up.
              </p>
            </div>
          ) : (
            notifications.notifications.map((notification) => {
              if (notification.type === "LOGOUT") {
                return null; // Skip rendering logout notifications
              }
              if (notification.type === "REMINDER") {
                let reminder = null;
                try {
                  reminder = JSON.parse(notification.message);
                } catch (e) {
                  // Fallback
                }

                if (reminder) {
                  const isUnread = !notification.isRead;
                  const categoryColor = reminder.category?.color || "#10b981";
                  return (
                    <div key={notification.id} className="px-3">
                      <Item
                        className={`rounded-2xl border border-transparent px-3 py-3 transition-colors ${
                          isUnread
                            ? "bg-teal-500/10 border-teal-500/20"
                            : "bg-background/60 hover:bg-muted/40"
                        }`}
                      >
                        <ItemMedia className="p-0">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center bg-teal-500/15"
                            style={{ color: categoryColor }}
                          >
                            <Bell className="h-5 w-5" />
                          </div>
                        </ItemMedia>
                        <ItemContent className="p-0 flex-1">
                          <ItemTitle className="p-0 text-sm flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {reminder.title}
                              </span>
                              {isUnread && (
                                <Badge className="rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 text-[10px] px-1.5 py-0">
                                  Due
                                </Badge>
                              )}
                            </div>
                            {reminder.amount && (
                              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                                {reminder.currency || "USD"} {Number(reminder.amount).toFixed(2)}
                              </span>
                            )}
                          </ItemTitle>
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            {reminder.description && <p className="line-clamp-2">{reminder.description}</p>}
                            <p className="text-[10px] text-muted-foreground/80">
                              Due: {new Date(reminder.dueAt).toLocaleString()}
                            </p>
                          </div>
                          {isUnread && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5 py-1 flex items-center gap-1 border-teal-500/30 hover:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteReminder(reminder.reminderId, notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                                Done
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs px-2.5 py-1 flex items-center gap-1 border-border"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Clock className="h-3 w-3" />
                                    Snooze
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem onClick={() => handleSnoozeReminder(reminder.reminderId, notification.id, "10m")}>
                                    10 Minutes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSnoozeReminder(reminder.reminderId, notification.id, "30m")}>
                                    30 Minutes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSnoozeReminder(reminder.reminderId, notification.id, "1h")}>
                                    1 Hour
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSnoozeReminder(reminder.reminderId, notification.id, "tomorrow")}>
                                    Tomorrow
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                          <ItemFooter className="mt-1.5">
                            <Label className="text-[10px] text-muted-foreground">
                              {formatNotificationTime(notification.time)}
                            </Label>
                          </ItemFooter>
                        </ItemContent>
                        <ItemActions>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                disabled={notification.isRead}
                                onClick={() => markIndividualAsRead(notification.id)}
                              >
                                Mark as read
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteNotificationFunc(notification.id)}
                                variant="destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </ItemActions>
                      </Item>
                      <Separator className="my-2" />
                    </div>
                  );
                }
              }

              const isUnread = !notification.isRead;
              return (
                <div key={notification.id} className="px-3">
                  <Item
                    className={`rounded-2xl border border-transparent px-3 py-3 transition-colors ${
                      isUnread
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-background/60 hover:bg-muted/40"
                    }`}
                  >
                    <ItemMedia className="p-0">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          notification.type === "SUCCESS"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : notification.type === "ERROR"
                              ? "bg-rose-500/15 text-rose-500"
                              : notification.type === "ALERT"
                                ? "bg-amber-500/15 text-amber-500"
                                : "bg-sky-500/15 text-sky-500"
                        }`}
                      >
                        {notification.type === "INFO" && (
                          <BadgeInfo className="h-5 w-5" />
                        )}
                        {notification.type === "ALERT" && (
                          <BadgeAlert className="h-5 w-5" />
                        )}
                        {notification.type === "ERROR" && (
                          <BadgeX className="h-5 w-5" />
                        )}
                        {notification.type === "SUCCESS" && (
                          <BadgeCheck className="h-5 w-5" />
                        )}
                      </div>
                    </ItemMedia>
                    <ItemContent className="p-0">
                      <ItemTitle className="p-0 text-sm flex items-center gap-2">
                        <span className="text-foreground">
                          {notification.message.charAt(0).toUpperCase() +
                            notification.message.slice(1)}
                        </span>
                        {isUnread ? (
                          <Badge className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            New
                          </Badge>
                        ) : null}
                      </ItemTitle>
                      <ItemFooter>
                        <Label className="text-xs text-muted-foreground">
                          {formatNotificationTime(notification.time)}
                        </Label>
                      </ItemFooter>
                    </ItemContent>
                    <ItemActions>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            disabled={notification.isRead}
                            onClick={() => {
                              markIndividualAsRead(notification.id);
                            }}
                          >
                            Mark as read
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              deleteNotificationFunc(notification.id);
                            }}
                            variant="destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </ItemActions>
                  </Item>
                  <Separator className="my-2" />
                </div>
              );
            })
          )}
        </ScrollArea>
        {notifications.notifications.length === 0 ? null : (
          <div className="p-3">
            <Button
              variant="outline"
              className="w-full"
              disabled={messageLength === 0}
              onClick={() => {
                markAllAsRead();
              }}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function useNow(refreshMs = 60_000) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
}
