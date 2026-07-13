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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";
import CategoryBadge from "@/components/category-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatAmountCompact } from "@/utils/amount_formatter";

export type TransactionRow = {
  id: string;
  amount: number;
  displayAmount: number;
  description: string;
  transactionDate: string;
  categoryId: string;
  categoryName: string;
  currency: string;
  displayCurrency: string;
  receiptUrl?: string | null;
  type: "EXPENSE" | "INCOME";
};

type CategoryMeta = {
  id: string;
  name?: string;
  icon?: string;
  color?: string;
};

export const columns = (
  userCurrency: string | undefined,
  categories: CategoryMeta[] = [],
): ColumnDef<TransactionRow>[] => {
  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );

  return [
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
      accessorKey: "transactionDate",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex cursor-pointer items-center"
        >
          Date
          {column.getIsSorted() == false ? (
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
      cell: ({ row }) => {
        const dateStr = row.original.transactionDate;
        if (!dateStr) return "-";
        return <div>{dateStr.slice(0, 10)}</div>;
      }
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div
            className="truncate tracking-tight font-semibold"
            title={description}
          >
            {description}
            {row.original.type === "EXPENSE" && row.original.receiptUrl && (
              <Paperclip
                className="inline-block ml-2 h-4 w-4 text-muted-foreground"
                aria-label="Receipt"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              type === "EXPENSE"
                ? "bg-red-500/10 text-red-500"
                : "bg-green-500/10 text-green-500"
            }`}
          >
            {type === "EXPENSE" ? "Expense" : "Income"}
          </span>
        );
      },
    },
    {
      id: "amount",
      accessorKey: "displayAmount",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex cursor-pointer items-center"
        >
          Amount
          {column.getIsSorted() == false ? (
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
      cell: ({ row }) => {
        const amount = Number(
          row.original.displayAmount ?? row.original.amount,
        );
        const formatted = formatAmountCompact(amount);
        const currency =
          row.original.displayCurrency ||
          row.original.currency ||
          userCurrency ||
          "USD";

        return (
          <div className={`font-medium ${row.original.type === "EXPENSE" ? "text-red-500/90" : "text-green-500/90"}`}>
            {currencyMapper(currency)}
            {formatted}
          </div>
        );
      },
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => {
        const category = categoryMap.get(row.original.categoryId);
        return (
          <CategoryBadge
            name={row.original.categoryName}
            icon={category?.icon}
            color={category?.color}
          />
        );
      },
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
};
