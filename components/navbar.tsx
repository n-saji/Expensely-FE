"use client";

import { useRouter } from "next/navigation";
import menubar from "@/app/assets/icon/menu.png";
import Image from "next/image";
import Logout from "@/app/(auth)/logout/logout";
import { useState } from "react";

import { toggleSidebar } from "@/redux/slices/sidebarSlice";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";

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

  const handleLogout = async () => {
    try {
      await Logout();
      dispatch(clearUser());
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className={`px-6 py-5 bg-white shadow-md flex justify-between items-center 
        fixed top-0 right-0  duration-300 ease-in-out z-50
    ${isOpen ? "min-sm: w-[calc(100%-16rem)] max-sm:w-full" : "w-full"}
    dark:bg-gray-800 dark:text-gray-200
    `}
    >
      <div className="space-x-4 flex items-center w-full">
        <Image
          src={menubar}
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
            <p
              className="hover:underline active:underline cursor-pointer text-gray-700 dark:text-gray-300"
              onClick={() => {
                setProfileDropdown((prev) => !prev);
              }}
            >
              Hi, {user.name || "User"}
            </p>
          </div>
          <div
            className={`absolute right-0.5 top-full w-40 bg-primary-color shadow-lg rounded-md p-4 transition-all duration-300 z-50
            ${
              profileDropDown
                ? "translate-y-0 opacity-90"
                : "-translate-y-4 opacity-0 pointer-events-none"
            }`}
          >
            <button
              className="text-md hover:underline w-full text-left text-white cursor-pointer"
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
