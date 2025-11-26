"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Logout from "@/app/(auth)/logout/logout";
import { useEffect, useRef, useState } from "react";

import { setLoading, toggleSidebar } from "@/redux/slices/sidebarSlice";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import fetchProfileUrl from "@/utils/fetchProfileURl";
import defaulProdilePic from "@/assets/icon/user.png";
import { clearCategories } from "@/redux/slices/category";
import { LogOut, Settings, ShieldUser, User } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";

export default function Navbar({
  title,
  addButton,
  isLink = false,
  ReactLink,
}: {
  title?: string;
  addButton?: React.ReactNode;
  isLink?: boolean;
  ReactLink?: React.ReactNode;
}) {
  const router = useRouter();
  const [profileDropDown, setProfileDropdown] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const profileDropDownRef = useRef<HTMLDivElement>(null);
  const profileToggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropDown &&
        profileDropDownRef.current &&
        profileToggleRef.current &&
        !profileDropDownRef.current.contains(event.target as Node) &&
        !profileToggleRef.current?.contains(event.target as Node)
      ) {
        setProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropDown]);

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
    <nav
      className={`h-16 px-6 py-4 bg-background flex justify-between items-center 
        duration-300 ease-in-out z-50 sticky top-0
        border-b  dark:text-gray-200
    `}
    >
      <div className="space-x-4 flex items-center w-full">
        <SidebarTrigger onClick={() => dispatch(toggleSidebar())} />
        <div className="flex justify-between w-full text-lg items-center">
          {isLink ? ReactLink : title || "Dashboard"}
          <div className="relative flex items-center space-x-4">
            {addButton && <div className="flex items-center">{addButton}</div>}
            <hr className="h-10 border-l border-gray-400 dark:border-gray-600 " />
            <div
              className="flex items-center md:space-x-2 cursor-pointer"
              ref={profileToggleRef}
            >
              <Image
                src={user.profilePictureUrl || defaulProdilePic}
                alt="Profile"
                height={32}
                width={32}
                className="h-10 w-10 rounded-full cursor-pointer object-cover"
                onClick={() => {
                  setProfileDropdown((prev) => !prev);
                }}
              />
              <p
                className="max-sm:hidden hover:underline active:underline cursor-pointer text-gray-700 dark:text-gray-300"
                onClick={() => {
                  setProfileDropdown((prev) => !prev);
                }}
              >
                {user.name || "User"}
              </p>
            </div>
          </div>
          <div
            ref={profileDropDownRef}
            className={`absolute right-0.5 top-full w-50 bg-tertiary-color text-gray-700 dark:text-gray-200
              shadow-lg rounded-sm transition-all duration-300 z-50
              p-1
  ${
    profileDropDown
      ? "translate-y-0 opacity-100"
      : "-translate-y-4 opacity-0 pointer-events-none"
  }`}
          >
            <button
              className="navbar-icons"
              onClick={() => {
                setProfileDropdown(false);
                router.push("/profile");
              }}
            >
              <User className="w-4 h-4" /> Profile
            </button>
            <button
              className="navbar-icons"
              onClick={() => {
                setProfileDropdown(false);
                router.push("/settings");
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <hr className="my-1 border-gray-400 dark:border-gray-600" />
            {user.isAdmin && (
              <>
                <button
                  className="navbar-icons"
                  onClick={() => {
                    setProfileDropdown(false);
                    router.push("/admin");
                  }}
                >
                  <ShieldUser className="w-4 h-4" />
                  Admin
                </button>
                <hr className="my-1 border-gray-400 dark:border-gray-600" />
              </>
            )}
            <button className="navbar-icons" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
