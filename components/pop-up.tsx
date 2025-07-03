"use client";

import { useDispatch } from "react-redux";
import { togglePopUp } from "@/redux/slices/sidebarSlice";
import React from "react";

export default function PopUp({
  title,
  children,
  buttonName,
  showButton,
}: {
  title: string;
  children?: React.ReactNode;
  buttonName?: string | "Close";
  showButton?: boolean | true;
}) {
  const dispatch = useDispatch();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 w-full h-full bg-black/40 ">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full dark:bg-gray-800 dark:text-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            className="button-transparent px-3 py-1 text-black dark:text-white "
            onClick={() => dispatch(togglePopUp())}
          >
            X
          </button>
        </div>

        <div className="mb-4">
          {children ? (
            children
          ) : (
            <p className="text-gray-700">
              This is a pop-up component. You can add any content here.
            </p>
          )}
        </div>
        {showButton && (
          <button
            className="button-green w-full"
            onClick={() => dispatch(togglePopUp())}
          >
            {buttonName}
          </button>
        )}
      </div>
    </div>
  );
}
