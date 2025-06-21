"use client";
import Logo from "@/components/logo";
import { usePathname } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSidebar } from "@/redux/slices/sidebarSlice";
import Link from "next/link";

import { useSwipeable } from "react-swipeable";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expense", label: "Expense" },
  { href: "/category", label: "Category" },
  // { href: "/profile", label: "Profile" }, // handled in navbar
  // { href: "/settings", label: "Settings" }, handled in navbar
];

export default function Sidebar() {
  const param = usePathname();

  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);

  const handlers = useSwipeable({
    onSwipedLeft: () => dispatch(setSidebar(false)),
    onSwipedRight: () => dispatch(setSidebar(true)),
    preventScrollOnSwipe: true,
    trackTouch: true,
  });

  return (
    <aside
      className={`w-full lg:w-64 shadow-md max-lg:z-60 fixed z-40
        top-0 left-0 h-screen 
        transition-transform
        transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isOpen ? "bg-black/50" : "bg-transparent"}
        `}
      {...handlers}
    >
      <div className="w-55 lg:w-full h-screen bg-primary-color relative flex flex-col">
        <div
          className="absolute top-1/2 -right-5 min-lg:hidden 
        w-5 h-20 bg-primary-color flex text-center
        justify-center items-center border-l
         border-white"
          onClick={() => dispatch(setSidebar(false))}
        >{`<`}</div>
        <div className="h-16 border-b border-gray-200 flex items-center justify-start px-5 sm:px-6">
          <Logo
            disableIcon={false}
            className="text-2xl py-4 w-full justify-start text-white "
            dimension={{ width: 30, height: 30 }}
            redirect={true}
          />
        </div>
        <div className="flex-grow justify-between">
          <ul className="space-y-4 w-full px-5 sm:px-6 py-4 text-lg text-gray-700 font-semibold">
            {navLinks.map((link) => {
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${
                      param.includes(link.href) ? "text-gray-300" : ""
                    }  hover:underline`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="text-gray-300 text-sm">Version 1.1.7</p>
        </div>
      </div>
    </aside>
  );
}
