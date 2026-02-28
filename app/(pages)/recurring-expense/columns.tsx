"use client";

import { currencyMapper } from "@/utils/currencyMapper";
import { Recurrence, RecurringExpense } from "@/global/dto";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type RecurringExpenseRow = RecurringExpense & {
  categoryName: string;
};

export const columns = ({
  userCurrency,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  userCurrency?: string;
  onEdit: (row: RecurringExpenseRow) => void;
  onDelete: (row: RecurringExpenseRow) => void;
  onToggleActive: (row: RecurringExpenseRow) => void;
}): ColumnDef<RecurringExpenseRow>[] => [
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
    accessorKey: "recurrence",
    header: "Occurrence",
    cell: ({ row }) => {
      const recurrence = row.getValue("recurrence") as Recurrence;
      return (
        <Badge variant="outline" className="font-normal">
          {recurrence}
        </Badge>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Start Date",
  },
  {
    accessorKey: "nextOccurrence",
    header: "Next Occurrence",
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "default" : "secondary"}>
        {row.original.active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const recurringExpense = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(recurringExpense)}>
              Update
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(recurringExpense)}>
              {recurringExpense.active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(recurringExpense)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
