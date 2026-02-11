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
import {
  BadgeAlert,
  BadgeCheck,
  BadgeInfo,
  BadgeX,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
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
  const [messageLength, setMessageLength] = useState(0);

  useEffect(() => {
    let count = 0;
    notifications.notifications.forEach((n) => {
      if (!n.isRead) {
        count += 1;
      }
    });
    setMessageLength(count);
  }, [notifications.notifications]);

  useNow();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Bell className="w-6 h-6" />
                {messageLength > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-white">
                    {messageLength > 9 ? "9+" : messageLength}
                  </Badge>
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
                          {formatNotificationTime(
                            new Date(notification.time + "Z"),
                          )}
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
