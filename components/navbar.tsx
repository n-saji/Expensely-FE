"use client";

import { useRouter } from "next/navigation";
import menubar from "@/assets/icon/menu.png";
import menubarwhite from "@/assets/icon/menu-white.png";
import Image from "next/image";
import Logout from "@/app/(auth)/logout/logout";
import { useEffect, useRef, useState } from "react";

import { setLoading, toggleSidebar } from "@/redux/slices/sidebarSlice";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";
import fetchProfileUrl from "@/utils/fetchProfileURl";

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
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);
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
    } catch (error) {
      console.error("Logout failed:", error);
    }
    dispatch(setLoading(false));
  };

  return (
    <nav
      className={`h-16 px-6 py-4 bg-primary-color shadow-md flex justify-between items-center 
        fixed top-0 right-0  duration-300 ease-in-out z-50 border-b border-gray-300 dark:border-gray-700
    ${isOpen ? "min-lg: w-[calc(100%-16rem)] max-lg:w-full" : "w-full"}
     dark:text-gray-200
    `}
    >
      <div className="space-x-4 flex items-center w-full">
        <Image
          src={user.theme === "light" ? menubar : menubarwhite}
          alt="hamburger menu"
          width={30}
          height={30}
          className="cursor-pointer"
          onClick={() => dispatch(toggleSidebar())}
        />
        <div className="flex justify-between w-full text-lg">
          {isLink ? ReactLink : title || "Dashboard"}

          <div className="relative flex items-center space-x-4">
            {addButton && <div className="flex items-center">{addButton}</div>}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              ref={profileToggleRef}
            >
              <Image
                src={user.profilePictureUrl || "/default-profile.png"}
                alt="Profile"
                width={30}
                height={30}
                className="w-[30px] h-[30px] object-cover rounded-full cursor-pointer"
                onClick={() => {
                  setProfileDropdown((prev) => !prev);
                }}
              />
              <p
                className="hover:underline active:underline cursor-pointer text-gray-700 dark:text-gray-300"
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
              className="text-sm hover:underline hover:bg-gray-400 rounded px-3 py-2 w-full text-left cursor-pointer
              dark:hover:bg-gray-700
              transition-colors duration-300 ease-in-out"
              onClick={() => {
                setProfileDropdown(false);
                router.push("/profile");
              }}
            >
              Profile
            </button>
            <button
              className="text-sm hover:underline hover:bg-gray-400 rounded px-3 py-2 w-full text-left cursor-pointer
              dark:hover:bg-gray-700
              transition-colors duration-300 ease-in-out"
              onClick={() => {
                setProfileDropdown(false);
                router.push("/settings");
              }}
            >
              Settings
            </button>
            <hr className="my-1 border-gray-400 dark:border-gray-600" />
            <button
              className="text-sm hover:underline hover:bg-gray-400 rounded px-3 py-2 w-full text-left cursor-pointer
              dark:hover:bg-gray-700
              transition-colors duration-300 ease-in-out"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
