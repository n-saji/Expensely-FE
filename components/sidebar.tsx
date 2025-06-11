"use client";
import Logo from "@/components/logo";
import { usePathname } from "next/navigation";
import Image from "next/image";
import closeIcone from "@/app/assets/icon/close.png";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSidebar } from "@/redux/slices/sidebarSlice";
import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expense", label: "Expense" },
  { href: "/category", label: "Category" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const param = usePathname();

  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);

  return (
    <aside
      className={`w-64 bg-primary-color shadow-md max-sm:z-60 fixed z-40
        transform transition-transform duration-300 ease-in-out top-0 left-0 h-screen 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <Image
        src={closeIcone}
        alt="Close Sidebar"
        width={30}
        height={30}
        className="absolute top-4 right-3 min-sm:hidden"
        onClick={() => dispatch(setSidebar(false))}
      />
      <Logo
        disableIcon={true}
        className="text-2xl border-b border-gray-200 py-4 px-4 w-full justify-start text-white"
        dimension={{ width: 30, height: 30 }}
        redirect={true}
      />
      <ul className="space-y-4 w-full px-8 py-4 text-lg text-gray-600 font-semibold">
        {navLinks.map((link) => {
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${
                  param.includes(link.href) ? "text-gray-200" : ""
                }  hover:underline`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
