"use client";

import { currencyMapper } from "@/utils/currencyMapper";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type IncomeRow = {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  description: string;
  incomeDate: string;
  currency: string;
};

export const columns = ({
  userCurrency,
  onEdit,
  onDelete,
}: {
  userCurrency?: string;
  onEdit: (row: IncomeRow) => void;
  onDelete: (row: IncomeRow) => void;
}): ColumnDef<IncomeRow>[] => [
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
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex cursor-pointer items-center"
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <div className="font-medium">
          {userCurrency ? currencyMapper(userCurrency) : "$"}
          {amount.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: "Category",
  },
  {
    accessorKey: "incomeDate",
    header: ({ column }) => (
      <div
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex cursor-pointer items-center"
      >
        Income Date
        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const income = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-extralight">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(income)}>
              Update
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(income)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
