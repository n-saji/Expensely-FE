"use client";
import Image from "next/image";
import DropDownIcon from "@/assets/icon/drop-down.png";
import DropDownWhiteIcon from "@/assets/icon/drop-down-white.png";
import { useEffect, useState } from "react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export default function DropDown({
  options,
  selectedOption = "Select an option",
  onSelect,
  defaultValue,
  classname = "",
  customButton,
}: {
  options: Array<{ label: string; value: string }>;
  selectedOption: string;
  onSelect: (option: string) => void;
  defaultValue: string;
  classname?: string;
  customButton?: React.ReactNode;
}) {
  useEffect(() => {
    if (!options.some((option) => option.value === "")) {
      options.unshift({
        label: defaultValue,
        value: "",
      });
    }
  }, [options]);
  const [clicked, setClicked] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  return (
    <div
      className={`w-40 border border-gray-300 rounded-sm shadow-md flex items-center relative justify-between
    cursor-pointer ${classname}`}
      onClick={() => setClicked(!clicked)}
    >
      <p className="text-l text-gray-500 dark:text-gray-300">
        {selectedOption === ""
          ? defaultValue
          : options.find((option) => option.value === selectedOption)?.label ||
            selectedOption}
      </p>
      <div className="flex space-x-4 items-center">
        {customButton ? customButton : null}
        <Image
          src={user.theme === "dark" ? DropDownWhiteIcon : DropDownIcon}
          alt="Dropdown Icon"
          width={8}
          height={8}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={() => setClicked(!clicked)}
        />
      </div>
      <div
        className={`absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 border-gray-300 
          rounded-sm shadow-lg z-10 ${clicked ? "block" : "hidden"}
          max-h-80 overflow-y-auto`}
      >
        <ul className="max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <li
              key={index}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer
                 dark:hover:bg-gray-700 dark:text-gray-300
                 ${
                   option.value === selectedOption
                     ? "bg-gray-200 dark:bg-gray-600"
                     : ""
                 }`}
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
