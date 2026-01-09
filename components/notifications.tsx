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
        <Button variant={"ghost"}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Bell className="w-6 h-6" />
                {messageLength > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-4 h-4">
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
      <PopoverContent className="p-0 w-80 md:w-md overflow-hidden">
        <ScrollArea
          className="h-96 w-full"
          onMouseEnter={() => {
            document.body.style.overflow = "hidden";
          }}
          onMouseLeave={() => {
            document.body.style.overflow = "auto";
          }}
        >
          {notifications.notifications.length === 0 ? (
            <div className="flex justify-center items-center p-4">
              <Label className="text-muted-foreground">No notifications</Label>
            </div>
          ) : (
            notifications.notifications.map((notification) => {
              return (
                <div key={notification.id} className="">
                  <Item>
                    <ItemMedia className="p-0">
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
                    </ItemMedia>
                    <ItemContent className="p-0">
                      <ItemTitle className="p-0 text-sm">
                        {notification.message.charAt(0).toUpperCase() +
                          notification.message.slice(1)}
                        {!notification.isRead ? (
                          <Badge className="">New</Badge>
                        ) : null}
                      </ItemTitle>
                      <ItemFooter>
                        <Label className="text-xs text-muted-foreground">
                          {/* From: {notification.sender} -{" "} */}

                          {formatNotificationTime(
                            new Date(notification.time + "Z")
                          )}
                        </Label>
                      </ItemFooter>
                    </ItemContent>
                    <ItemActions>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="">
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
                  <Separator />
                  {/* {index !== notifications.notifications.length - 1 && (
                    <Separator />
                  )} */}
                </div>
              );
            })
          )}
        </ScrollArea>
        <Separator />
        {notifications.notifications.length === 0 ? null : (
          <Button
            variant="link"
            className="w-full flex justify-start"
            disabled={messageLength === 0}
            onClick={() => {
              markAllAsRead();
            }}
          >
            Mark all as read
          </Button>
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
