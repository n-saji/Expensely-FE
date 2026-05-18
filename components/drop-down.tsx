"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CategoryBadge from "@/components/category-badge";

export default function DropDown({
  options,
  selectedOption = "Select an option",
  onSelect,
}: {
  options: Array<{
    label: string;
    value: string;
    icon?: string;
    color?: string;
  }>;
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
              {option.icon || option.color ? (
                <CategoryBadge
                  name={option.label}
                  icon={option.icon}
                  color={option.color}
                />
              ) : (
                option.label
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
