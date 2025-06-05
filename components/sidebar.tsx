"use client";
import Logo from "@/components/logo";
import { usePathname } from "next/navigation";
import { useState } from "react";
export default function Sidebar() {
  const param = usePathname();
  const [active, setActive] = useState(param || "dashboard");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = e.currentTarget.getAttribute("href");
    if (target) {
      setActive(target);
      window.location.href = target;
    }
  };
  return (
    <aside className="w-64 primary-bg-color shadow-md">
      <Logo
        disableIcon={true}
        className="text-2xl border-b border-gray-200 py-4 px-4 w-full justify-start text-white"
        dimension={{ width: 30, height: 30 }}
      />
      <ul className="space-y-4 w-full px-8 py-4 text-lg text-gray-600 font-semibold">
        <li>
          <a
            href="/dashboard"
            className={`${
              active === "/dashboard" ? "text-gray-200" : ""
            }  hover:underline`}
            onClick={handleClick}
          >
            Dashboard
          </a>
        </li>
        <li>
          <a
            href="/profile"
            className={`${
              active === "/profile" ? "text-gray-200" : ""
            }  hover:underline`}
            onClick={handleClick}
          >
            Profile
          </a>
        </li>
        <li>
          <a
            href="/settings"
            className={`${
              active === "/settings" ? "text-gray-200" : ""
            }  hover:underline`}
            onClick={handleClick}
          >
            Settings
          </a>
        </li>
      </ul>
    </aside>
  );
}
