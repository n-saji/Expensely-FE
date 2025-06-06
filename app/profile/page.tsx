"use client";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { useState } from "react";

export default function ProfilePage() {
  const isOpen = useSelector((state: RootState) => state.sidebar.enabled);
  const [edit, setEdit] = useState(false);

  return (
    <div className="w-full min-h-screen flex  justify-center bg-gray-200 min-sm:relative">
      <Sidebar />

      <div
        className={`w-full ${
          isOpen ? "min-sm:ml-64" : "min-sm:ml-0"
        } transition-all duration-300`}
      >
        <Navbar title="Profile" />
        <div className="p-8 flex flex-col space-y-4 w-full items-center">
          <h1 className="text-gray-700 text-4xl">Welcome to your Profile!</h1>
          <div className="min-w-1/2 max-md:w-2/3 max-sm:w-3/4 bg-white shadow-md rounded-lg p-6 flex flex-col items-center space-y-4">
            <Image
              alt="Profile Picture"
              src="/path/to/profile-picture.jpg"
              width={150}
              height={150}
              className="rounded-full mb-4 bg-gray-300"
            />
            <div className="flex flex-col items-center space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800 ">
                John Doe
              </h2>
              <p className="text-gray-600">test@example.com</p>
            </div>
            <div className="bg-gray-200 w-full mt-4 flex justify-center flex-col items-center space-y-2 p-4 rounded-lg">
              <div className="w-full flex items-start">
                <h1 className="text-2xl font-semibold text-gray-800 block text-left">
                  Profile
                </h1>
              </div>
              <div
                className="flex flex-col max-sm:gap-3 min-md:gap-4 w-full
                max-sm:justify-center max-sm:items-center max-sm:text-center"
              >
                <div className="grid max-sm:grid-cols-1 min-md:grid-cols-2 max-sm:gap-2 w-full max-sm:text-center max-sm:items-center">
                  <p className="font-semibold">Full Name</p>
                  <p>John Doe</p>
                </div>
                <div className="grid max-sm:grid-cols-1 min-md:grid-cols-2 max-sm:gap-2 w-full">
                  <p className="font-semibold">Email</p>
                  <p>test@example.com</p>
                </div>
                <div className="grid max-sm:grid-cols-1 min-md:grid-cols-2 max-sm:gap-2 w-full">
                  <p className="font-semibold">Phone</p>
                  <p>+1234567890</p>
                </div>
                <div className="grid max-sm:grid-cols-1 min-md:grid-cols-2 max-sm:gap-2 w-full">
                  <p className="font-semibold">Currency</p>
                  <p>USD</p>
                </div>
              </div>
              <div className="w-full flex justify-end mt-4">
                <button className={`${edit ? "button-green" : "button-green-outline"}`} onClick={() => setEdit(!edit)}>
                  {edit ? "Save" : "Edit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
