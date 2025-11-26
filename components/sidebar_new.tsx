"use client";
import {
  ChevronUp,
  LogOut,
  Settings,
  User,
  CircleDollarSign,
  Wallet,
  ShieldUser,
  ChevronDown,
  Plus,
  LayoutDashboard,
  DollarSign,
  LayoutList,
  Logs,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
import Image from "next/image";
import logo from "@/assets/icon/logo.png";
import { setLoading } from "@/redux/slices/sidebarSlice";
import { clearCategories } from "@/redux/slices/category";
import Logout from "@/app/(auth)/logout/logout";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];

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
            })
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
    } catch (error) {
      console.error("Logout failed:", error);
    }
    dispatch(setLoading(false));
  };

  return (
    <Sidebar collapsible="icon" > 
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image
                  src={logo}
                  alt="Logo"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                <h1 className="font-bold">Expensely</h1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathName === item.url}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <DollarSign />
                    Expense
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem key={"Expense-show"}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathName === "/expense"}
                      >
                        <Link href={"/expense"}>
                          <LayoutList />
                          <span>Recent Transactions</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem key={"Expense-add"}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathName === "/expense/add"}
                      >
                        <Link href={"/expense/add"}>
                          <CircleDollarSign />
                          <span>Add Expense</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Wallet />
                    Budget
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem key={"Expense-show"}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathName === "/budget"}
                      >
                        <Link href={"/budget"}>
                          <LayoutList />
                          <span>Existing Budgets</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem key={"Expense-add"}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathName === "/budget/add"}
                      >
                        <Link href={"/budget/add"}>
                          <Plus />
                          <span>Add Budget</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
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
                      >
                        <Link href={"/category"}>
                          <LayoutList />
                          <span>Existing Categories</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem key={"Expense-add"}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathName === "/category/add"}
                      >
                        <Link href={"/category/add"}>
                          <Plus />
                          <span>Add Category</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="mt-auto w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
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
              <DropdownMenuContent side="top" className="w-64">
                <DropdownMenuItem 
                  onClick={() => {
                    router.push("/profile");
                  }}
                >
                  <span className="flex items-center gap-2">
                    <User /> Profile
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/settings");
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Settings /> Settings
                  </span>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        router.push("/admin");
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldUser className="w-4 h-4" />
                        Admin
                      </span>
                    </DropdownMenuItem>
                  </>
                )}
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
