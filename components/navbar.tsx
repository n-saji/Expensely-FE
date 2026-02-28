"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import Slidebar from "./slidebar";
import Notifications from "./notifications";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  removeNotification,
  markAllRead,
  markOneRead,
  clearNotifications,
} from "@/redux/slices/notificationSlice";
import api from "@/lib/api";
import { Separator } from "./ui/separator";

export default function Navbar() {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user);
  const notifications = useSelector((state: RootState) => state.notification);
  const dispatch = useDispatch();
  const pathSegments = pathname.split("/").filter((seg) => seg.length > 0);

  const markAllAsRead = async () => {
    await api.put(`/web_sockets/alerts/mark_all_read/by_user_id/${user.id}`);
    dispatch(markAllRead());
  };
  const markNotificationAsRead = async (id: string) => {
    await api.put(`/web_sockets/alerts/mark_as_read/by_message_id/${id}`);
    dispatch(markOneRead(id));
  };

  const deleteNotificationFunc = async (id: string) => {
    await api.delete(`/web_sockets/alerts/delete_by_id/${id}`);
    dispatch(removeNotification({ id }));
  };

  if (!user.notificationsEnabled && notifications.notifications.length > 0) {
    dispatch(clearNotifications());
  }

  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background/80 
    px-4 py-2 backdrop-blur"
    >
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6 w-px bg-border/70" />
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 shadow-sm">
          <Breadcrumb>
            <BreadcrumbList className="gap-2">
              {pathSegments.map((segment, index) => {
                const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;
                return (
                  <Fragment key={href}>
                    <BreadcrumbItem className="text-xs text-muted-foreground">
                      {isLast ? (
                        <BreadcrumbPage className="text-xs font-medium text-foreground">
                          {segment.charAt(0).toUpperCase() + segment.slice(1)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={href}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {segment.charAt(0).toUpperCase() + segment.slice(1)}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator className="text-muted-foreground" />
                    )}
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(pathname.startsWith("/dashboard") ||
          pathname === "/expense" ||
          pathname.startsWith("/recurring-expense")) && <Slidebar />}
        {user.notificationsEnabled && (
          <Notifications
            notifications={notifications}
            markAllAsRead={markAllAsRead}
            markIndividualAsRead={markNotificationAsRead}
            deleteNotificationFunc={deleteNotificationFunc}
          />
        )}
      </div>
    </div>
  );
}
