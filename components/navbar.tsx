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

export default function Navbar() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((seg) => seg.length > 0);
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
      {(pathname === "/dashboard" || pathname === "/expense" ) && <Slidebar />}
    </div>
  );
}
