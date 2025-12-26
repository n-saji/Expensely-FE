"use client";
import { Separator } from "@/components/ui/separator";

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
} from "@/redux/slices/notificationSlice";
import api from "@/lib/api";

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

  return (
    <div className="flex justify-between items-center px-4 h-12 py-4 bg-background z-10 border-b sticky top-0">
      <div className="w-full flex items-center justify-start">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-2 my-3" />
        <Breadcrumb>
          <BreadcrumbList>
            {pathSegments.map((segment, index) => {
              const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
              const isLast = index === pathSegments.length - 1;
              return (
                <Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        {segment.charAt(0).toUpperCase() + segment.slice(1)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>
                        {segment.charAt(0).toUpperCase() + segment.slice(1)}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {(pathname === "/dashboard" || pathname === "/expense") && <Slidebar />}
      {user.notificationsEnabled && (
        <Notifications
          notifications={notifications}
          markAllAsRead={markAllAsRead}
          markIndividualAsRead={markNotificationAsRead}
          deleteNotificationFunc={deleteNotificationFunc}
        />
      )}
    </div>
  );
}
