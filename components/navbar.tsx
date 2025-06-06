"use client";

import { useRouter } from "next/navigation";
import menubar from "@/app/assets/icon/menu.png";
import Image from "next/image";
import Logout from "@/app/(auth)/logout/logout";
import { useState } from "react";

import { toggleSidebar } from "@/redux/slices/sidebarSlice";
import { useDispatch, useSelector } from "react-redux";

export default function Navbar({ title }: { title?: string }) {
  const router = useRouter();
  const [profileDropDown, setProfileDropdown] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  console.log("User from Navbar:", user);

  const handleLogout = async () => {
    try {
      await Logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="w-full px-6 py-5 bg-white shadow-md flex justify-between items-center sticky top-0">
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
          <p>{title || "Dashboard"}</p>

          <div className="relative">
            <p
              className="hover:underline active:underline cursor-pointer text-gray-700"
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
