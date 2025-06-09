"use client";
import Image from "next/image";
import DropDownIcon from "@/app/assets/icon/drop_down.png";
import { useEffect, useState } from "react";

export default function DropDown({
  options,
  selectedOption = "Select an option",
  onSelect,
  defaultValue,
}: {
  options: Array<{ label: string; value: string }>;
  selectedOption: string;
  onSelect: (option: string) => void;
  defaultValue: string;
}) {
  useEffect(() => {
    if (!options.some((option) => option.value === "")) {
      options.unshift({
        label: defaultValue,
        value: "",
      });
    }
    console.log("Options updated:", options);
  }, [options]);
  const [clicked, setClicked] = useState(false);
  if (!options || options.length === 0) {
    return (
      <div className="w-40 border border-gray-300 rounded-sm p-4 bg-white shadow-md">
        <p className="text-xl text-gray-500">No options available</p>
      </div>
    );
  }

  return (
    <div
      className="w-40 border border-gray-300 rounded-sm p-2 bg-white shadow-md flex items-center relative
    cursor-pointer"
      onClick={() => setClicked(!clicked)}
    >
      <p className="text-l text-gray-500">
        {selectedOption === ""
          ? defaultValue
          : options.find((option) => option.value === selectedOption)?.label ||
            selectedOption}
      </p>
      <Image
        src={DropDownIcon}
        alt="Dropdown Icon"
        width={8}
        height={8}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
        onClick={() => setClicked(!clicked)}
      />
      <div
        className={`absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10 ${
          clicked ? "block" : "hidden"
        }`}
      >
        <ul className="max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(option.value);
                setClicked(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
