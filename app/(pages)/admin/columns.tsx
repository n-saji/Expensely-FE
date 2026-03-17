"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  country_code: string;
  phone: string;
  createdAt: string;
  currency: string;
  theme: string;
  language: string;
  isActive: boolean;
  profilePicFilePath: string | null;
  profileComplete: boolean;
  notificationsEnabled: boolean;
  oauth2User: boolean;
}

interface AdminColumnsProps {
  onEdit: (row: AdminUserRow) => void;
}

export const columns = ({
  onEdit,
}: AdminColumnsProps): ColumnDef<AdminUserRow>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => <span>{row.original.isActive ? "Yes" : "No"}</span>,
  },
  {
    accessorKey: "profileComplete",
    header: "Profile Completed",
    cell: ({ row }) => (
      <span>{row.original.profileComplete ? "Yes" : "No"}</span>
    ),
  },
  {
    accessorKey: "isAdmin",
    header: "Admin",
    cell: ({ row }) => <span>{row.original.isAdmin ? "Yes" : "No"}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const currentUser = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(currentUser)}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
