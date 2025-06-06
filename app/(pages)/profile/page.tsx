"use client";

import Image from "next/image";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // Adjust the import path as necessary
import "./styles.css";

export default function ProfilePage() {
  const [edit, setEdit] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  return (
    <>
      <h1 className="text-gray-700 text-4xl">Welcome to your Profile!</h1>
      <div className="min-w-1/2 max-md:w-2/3 max-sm:w-80 bg-white shadow-md rounded-lg p-8 max-sm:p-6  flex flex-col items-center">
        <Image
          alt="Profile Picture"
          src="/path/to/profile-picture.jpg"
          width={150}
          height={150}
          className="rounded-full mb-4 bg-gray-300"
        />
        <div className="flex flex-col items-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800 ">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="bg-gray-200 w-full mt-4 flex justify-center flex-col items-center space-y-2 p-4 rounded-lg">
          <div className="w-full flex items-start">
            <h1 className="text-2xl font-semibold text-gray-800 block text-left">
              Profile
            </h1>
          </div>
          <div
            className="flex flex-col max-sm:gap-3 min-md:gap-4 w-full
                "
          >
            <div className="grid_input">
              <p className="font-semibold">Full Name</p>
              <p>
                {edit ? (
                  <input
                    type="text"
                    className="edit_input"
                    defaultValue={user.name}
                  />
                ) : (
                  user.name
                )}
              </p>
            </div>
            <div className="grid_input">
              <p className="font-semibold">Email</p>
              <p>
                {edit ? (
                  <input
                    type="email"
                    className="edit_input"
                    defaultValue={user.email}
                  />
                ) : (
                  user.email
                )}
              </p>
            </div>
            <div className="grid_input">
              <p className="font-semibold">Country Code</p>
              <p>
                {edit ? (
                  <input
                    type="text"
                    className="edit_input"
                    defaultValue={user.country_code}
                  />
                ) : (
                  user.country_code
                )}
              </p>
            </div>
            <div className="grid_input">
              <p className="font-semibold">Phone</p>
              <p>
                {edit ? (
                  <input
                    type="text"
                    className="edit_input"
                    defaultValue={user.phone}
                  />
                ) : (
                  user.phone
                )}
              </p>
            </div>
            <div className="grid_input">
              <p className="font-semibold">Currency</p>
              <p>
                {edit ? (
                  <input
                    type="text"
                    className="edit_input"
                    defaultValue={user.currency}
                  />
                ) : (
                  user.currency
                )}
              </p>
            </div>
          </div>
          <div className="w-full flex justify-end mt-4">
            <button
              className={`${edit ? "button-green" : "button-green-outline"}`}
              onClick={() => setEdit(!edit)}
            >
              {edit ? "Save" : "Edit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
