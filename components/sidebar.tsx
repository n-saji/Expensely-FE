"use client";
import {
  ChevronUp,
  LogOut,
  Settings,
  User,
  Wallet,
  Shield,
  ChevronDown,
  LayoutDashboard,
  DollarSign,
  Logs,
  Plus,
  Repeat,
  HandCoins,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import defaulProfilePic from "@/assets/icon/user.png";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import fetchProfileUrl from "@/utils/fetchProfileURl";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { clearUser, setUser } from "@/redux/slices/userSlice";
import { clearNotifications } from "@/redux/slices/notificationSlice";
import Image from "next/image";
import logo from "@/assets/icon/logo.png";
import { setLoading } from "@/redux/slices/sidebarSlice";
import { clearCategories } from "@/redux/slices/categorySlice";
import Logout from "@/app/(auth)/logout/logout";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar() {
  const router = useRouter();
  const pathName = usePathname();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user?.profilePicFilePath && !user.profilePictureUrl) {
        try {
          const url = await fetchProfileUrl(user.profilePicFilePath);
          dispatch(
            setUser({
              ...user,
              profilePictureUrl: url,
            }),
          );
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      }
    };

    fetchProfilePicture();
  }, [user?.profilePicFilePath]);

  const handleLogout = async () => {
    dispatch(setLoading(true));

    try {
      await Logout();
      router.push("/");
      dispatch(clearUser());
      dispatch(clearCategories());
      dispatch(clearNotifications());
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="z-12 border-r border-border/70 bg-background/80 backdrop-blur"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-fit">
              <Link href="/">
                <Image
                  src={logo}
                  alt="Logo"
                  width={22}
                  height={22}
                  className="rounded"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathName === "/dashboard"}
                  className="rounded-xl transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                >
                  <Link href={"/dashboard"}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathName === "/expense"}
                  className="rounded-xl transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                >
                  <Link href={"/expense"}>
                    <DollarSign />
                    <span>Expenses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathName === "/income"}
                  className="rounded-xl transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                >
                  <Link href={"/income"}>
                    <HandCoins />
                    <span>Income</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathName === "/budget"}
                  className="rounded-xl transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                >
                  <Link href={"/budget"}>
                    <Wallet />
                    Budget
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarMenu>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="rounded-xl transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary">
                      <Repeat />
                      Recurring Expense
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem key={"Recurring-show"}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathName === "/recurring-expense"}
                          className="rounded-lg transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                        >
                          <Link href={"/recurring-expense"}>
                            <span>Recurring Expenses</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key={"Recurring-add"}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathName === "/recurring-expense/add"}
                          className="rounded-lg transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                        >
                          <Link href={"/recurring-expense/add"}>
                            <span>Add Recurring Expense</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
            <SidebarMenu>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="rounded-xl transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary">
                      <Logs />
                      Category
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem key={"Expense-show"}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathName === "/category"}
                          className="rounded-lg transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                        >
                          <Link href={"/category"}>
                            <span>Categories</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key={"Expense-add"}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathName === "/category/add"}
                          className="rounded-lg transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                        >
                          <Link href={"/category/add"}>
                            <span>Add Category</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            General
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathName === "/settings"}
                className="rounded-xl transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
              >
                <Link href={"/settings"}>
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {user.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Admin
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathName === "/admin"}
                  className="rounded-xl transition-colors hover:bg-primary-500/10 data-[active=true]:bg-primary-500/15 data-[active=true]:text-primary"
                >
                  <Link href={"/admin"}>
                    <Shield />
                    <span>Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-border/70">
        <SidebarMenu>
          <SidebarMenuItem className="mt-auto w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full bg-background/70 hover:bg-muted/60 transition-colors">
                  <Image
                    src={user.profilePictureUrl || defaulProfilePic}
                    alt="Avatar"
                    width={28}
                    height={28}
                    className="object-cover rounded-full"
                  />

                  {user.name || "Guest"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[240px]">
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/profile");
                  }}
                >
                  <span className="flex items-center gap-2">
                    <User /> Profile
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    // Clear local storage and redirect to login page
                    await handleLogout();
                  }}
                >
                  <span className="flex items-center gap-2">
                    <LogOut /> Sign out
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
