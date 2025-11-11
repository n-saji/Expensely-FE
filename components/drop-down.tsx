"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DropDown({
  options,
  selectedOption = "Select an option",
  onSelect,
}: {
  options: Array<{ label: string; value: string }>;
  selectedOption: string;
  onSelect: (option: string) => void;
}) {
  return (
    <>
      <Select
        onValueChange={(v) => {
          onSelect(v);
        }}
        value={selectedOption}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
