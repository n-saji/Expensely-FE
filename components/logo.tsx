"use client";
import Image from "next/image";
import logo from "@/app/assets/icon/logo.png";
import Link from "next/link";
export default function Logo({ className , dimension }: { className?: string , dimension?: { width: number , height: number } }) {
  return (
    <Link href="/" className={`flex justify-evenly items-center cursor-pointer ${className}`}>
      <div
        className="flex justify-evenly items-center cursor-pointer"
        onClick={() => {

        }}
      >
        <Image
          src={logo}
        alt="Logo"
        width={dimension?.width || 50}
        height={dimension?.height || 50}
        className="rounded-lg"
      />
      <h1 className=" font-bold text-gray-500 mx-4">Expensely</h1>
      </div>
    </Link>
  );
}
