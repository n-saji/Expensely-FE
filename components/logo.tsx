"use client";
import Image from "next/image";
import logo from "@/assets/icon/logo.png";
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
    <div className="flex justify-around items-center">
      {!disableIcon && (
        <Image
          src={logo}
          alt="Logo"
          width={dimension?.width || 50}
          height={dimension?.height || 50}
          className="rounded-lg mr-4"
        />
      )}
      <Link
        href={redirect ? "/" : ""}
        className={` cursor-pointer text-gray-500 ${className}`}
      >
        <h1 className="font-bold">Expensely</h1>
      </Link>
    </div>
  );
}
