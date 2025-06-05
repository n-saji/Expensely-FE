"use client";
import Image from "next/image";
import logo from "@/app/assets/icon/logo.png";
import Link from "next/link";
export default function Logo({
  className,
  dimension,
  disableIcon,
  redirect = true,
}: {
  className?: string;
  dimension?: { width: number; height: number };
  disableIcon?: boolean;
  redirect?: boolean;
}) {
  return (
    <Link
      href={redirect ? "/dashboard" : ""}
      className={`flex justify-evenly items-center cursor-pointer text-gray-500 ${className}`}
    >
      <div
        className="flex justify-evenly items-center cursor-pointer"
        onClick={() => {}}
      >
        {!disableIcon && (
          <Image
            src={logo}
            alt="Logo"
            width={dimension?.width || 50}
            height={dimension?.height || 50}
            className="rounded-lg"
          />
        )}
        <h1 className=" font-bold  mx-4">Expensely</h1>
      </div>
    </Link>
  );
}
