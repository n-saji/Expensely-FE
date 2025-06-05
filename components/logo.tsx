"use client";
import Image from "next/image";
import logo from "@/app/assets/icon/logo.png";
import Link from "next/link";
export default function Logo() {
  return (
    <Link href="/" className="flex justify-evenly items-center cursor-pointer">
    <div
      className="flex justify-evenly items-center cursor-pointer"
      onClick={() => {
        
      }}
    >
      <Image
        src={logo}
        alt="Logo"
        width={50}
        height={50}
        className="rounded-lg"
      />
      <h1 className="text-4xl font-bold text-gray-500 mx-4">Expensely</h1>
      </div>
    </Link>
  );
}
