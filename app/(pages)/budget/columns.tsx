"use client";

import { categorySkeleton, Period } from "@/global/dto";
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
import { MoreHorizontal } from "lucide-react";

export type Budget = {
  id: string;
  period: Period;
  amountLimit: number;
  spent: number;
  startDate: string;
  endDate: string;
  category: categorySkeleton;
};

export const columns = (
  userCurrency: string | undefined
): ColumnDef<Budget>[] => [
  {
    accessorFn: (row) => row.category.name,
    header: "Category",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("Category")}</span>;
    },
  },
  {
    accessorKey: "period",
    header: "Period",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("period")}</span>;
    },
  },
  {
    accessorKey: "amountLimit",
    header: "Amount Limit",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {userCurrency ? currencyMapper(userCurrency) : "$"}
          {row.getValue("amountLimit")}
        </span>
      );
    },
  },
  {
    accessorKey: "spent",
    header: "Spent",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {userCurrency ? currencyMapper(userCurrency) : "$"}
          {row.getValue("spent")}
        </span>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("startDate")}</span>;
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("endDate")}</span>;
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
