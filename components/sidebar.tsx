"use client";
import Logo from "@/components/logo";
import { usePathname } from "next/navigation";
import Image from "next/image";
import closeIcone from "@/app/assets/icon/close.png";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSidebar } from "@/redux/slices/sidebarSlice";
import Link from "next/link";

export default function Sidebar() {
  const param = usePathname();

  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);

  return (
    <aside
      className={`w-64 bg-primary-color shadow-md max-sm:z-60 fixed 
        transform transition-transform duration-300 ease-in-out top-0 left-0 h-screen 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <Image
        src={closeIcone}
        alt="Close Sidebar"
        width={35}
        height={35}
        className="absolute top-4 right-1 min-sm:hidden"
        onClick={() => dispatch(setSidebar(false))}
      />
      <Logo
        disableIcon={true}
        className="text-2xl border-b border-gray-200 py-4 px-4 w-full justify-start text-white"
        dimension={{ width: 30, height: 30 }}
        redirect={false}
      />
      <ul className="space-y-4 w-full px-8 py-4 text-lg text-gray-600 font-semibold">
        <li>
          <Link
            href="/dashboard"
            className={`${
              param === "/dashboard" ? "text-gray-200" : ""
            }  hover:underline`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className={`${
              param === "/profile" ? "text-gray-200" : ""
            }  hover:underline`}
          >
            Profile
          </Link>
        </li>
        <li>
          <Link
            href="/settings"
            className={`${
              param === "/settings" ? "text-gray-200" : ""
            }  hover:underline`}
          >
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
}
