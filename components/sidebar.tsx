"use client";
import Logo from "@/components/logo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import closeIcone from "@/app/assets/icon/close.png";

export default function Sidebar({
  classname,
  setEnableSidebar,
}: {
  setEnableSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  classname?: string;
}) {
  const param = usePathname();
  const [active, setActive] = useState(param || "dashboard");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = e.currentTarget.getAttribute("href");
    if (target) {
      setActive(target);
      window.location.href = target;
    }
    // setEnableSidebar((prev) => false);
  };
  return (
    <aside
      className={`w-64 bg-primary-color shadow-md ${classname} max-sm:fixed max-sm:z-50 min-sm:absolute min-sm:transform transition-transform duration-300 ease-in-out  top-0 left-0 h-screen `}
    >
      <Image
        src={closeIcone}
        alt="Close Sidebar"
        width={35}
        height={35}
        className="absolute top-4 right-1 min-sm:hidden"
        onClick={() => setEnableSidebar((prev) => !prev)}
      />
      <Logo
        disableIcon={true}
        className="text-2xl border-b border-gray-200 py-4 px-4 w-full justify-start text-white"
        dimension={{ width: 30, height: 30 }}
        redirect={false}
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
