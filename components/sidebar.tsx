"use client";
import Logo from "@/components/logo";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSidebar } from "@/redux/slices/sidebarSlice";
import Link from "next/link";
import home_white_icon from "@/assets/icon/home-white.png";
import home_icon from "@/assets/icon/home.png";
import expense_icon from "@/assets/icon/expense.png";
import expense_white_icon from "@/assets/icon/expense-white.png";
import category from "@/assets/icon/category.png";
import category_white from "@/assets/icon/category-white.png";
import budget from "@/assets/icon/budget.png";
import budget_white from "@/assets/icon/budget-white.png";
import Image from "next/image";
import { useSwipeable } from "react-swipeable";
import { useState } from "react";

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: home_icon,
    iconWhite: home_white_icon,
  },
  {
    href: "/expense",
    label: "Expense",
    icon: expense_icon,
    iconWhite: expense_white_icon,
  },
  {
    href: "/category",
    label: "Category",
    icon: category,
    iconWhite: category_white,
  },
  { href: "/budget", label: "Budget", icon: budget, iconWhite: budget_white },
];

export default function Sidebar() {
  const param = usePathname();
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);
  const [hovered, setHovered] = useState<string | null>(null);

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
      <div className="w-55 lg:w-full h-screen bg-secondary-color relative flex flex-col">
        <div
          className="absolute top-1/2 -right-5 min-lg:hidden 
        w-5 h-20 bg-primary-color flex text-center
        justify-center items-center border-l
         border-white bg-secondary-color"
          onClick={() => dispatch(setSidebar(false))}
        >{`<`}</div>
        <div className="h-16 border-b border-gray-200 flex items-center justify-start px-5 sm:px-6">
          <Logo
            disableIcon={false}
            className="text-2xl py-4 w-full justify-start text-white"
            dimension={{ width: 30, height: 30 }}
            redirect={true}
          />
        </div>
        <div className="flex-grow justify-between">
          <ul className="space-y-4 w-full px-5 sm:px-6 py-4 text-lg text-gray-700 font-semibold">
            {navLinks.map((link) => {
              const isActive = param.includes(link.href);
              const isHovered = hovered === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center transition-all duration-150 ${
                    isActive ? "bg-gray-800" : ""
                  }  px-3 py-2 rounded-md hover:bg-gray-800 hover:text-gray-100`}
                  onMouseEnter={() => setHovered(link.href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Image
                    src={isActive || isHovered ? link.iconWhite : link.icon}
                    alt={link.label}
                    className="w-5 mr-3"
                  />

                  <span className={`${isActive ? "text-gray-100" : ""}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="text-gray-300 text-sm">Version 1.4.37</p>
        </div>
      </div>
    </aside>
  );
}
