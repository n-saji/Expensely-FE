"use client";

import { currencyMapper } from "@/utils/currencyMapper";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  CalendarIcon,
  CalendarRange,
  MoreHorizontal,
} from "lucide-react";

export type Expense = {
  id: string;
  amount: number;
  description: string;
  expenseDate: string;
  categoryId: string;
  categoryName: string;
  currency: string;
};

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import DropDown from "@/components/drop-down";
import { RootState } from "@/redux/store";

export const columns = (
  userCurrency: string | undefined,
  dateRange: DateRange | undefined,
  setDateRange: (range: DateRange | undefined) => void,
  open: boolean,
  setOpen: (open: boolean) => void,
  categories: RootState["categoryExpense"],
  categoryFilter: string,
  setCategoryFilter: (category: string) => void
): ColumnDef<Expense>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = amount.toFixed(2);

      return (
        <div className="font-medium">
          {userCurrency ? currencyMapper(userCurrency) : "$"}
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "expenseDate",
    header: () => (
      <div className="flex items-center gap-2">
        Expense Date
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {dateRange?.from && dateRange?.to ? (
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            ) : (
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </PopoverTrigger>
          <PopoverContent className="w-full overflow-hidden p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              className="rounded-lg border shadow-sm"
            />
          </PopoverContent>
        </Popover>
      </div>
    ),
  },
  {
    accessorKey: "categoryName",
    header: () => (
      <DropDown
        options={categories.categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        selectedOption={categoryFilter}
        onSelect={(option) => {
          const selectedCategory = categories.categories.find(
            (category) => category.id === option
          );
          setCategoryFilter(selectedCategory ? selectedCategory.id : "");
        }}
      />
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
