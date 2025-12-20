"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import DropDown from "@/components/drop-down";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalPages: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  totalPages,
  pageIndex,
  onPageChange,
  loading,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  pageSize,
  setPageSize,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualSorting: true,
    getRowId: (row: TData) => row.id,

    state: {
      pagination: {
        pageIndex,
        pageSize: pageSize,
      },
      sorting,
      rowSelection,
    },

    pageCount: totalPages,

    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize: pageSize })
          : updater;

      onPageChange(next.pageIndex);
    },
    onSortingChange,

    getCoreRowModel: getCoreRowModel(),

    onRowSelectionChange,
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {loading ? (
            <TableBody>
              {[...Array(table.getState().pagination.pageSize)].map(
                (_, index) => (
                  <TableRow key={index}>
                    {[...Array(columns.length)].map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )}
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id == "expenseDate") {
                        const date = new Date(
                          cell.getValue() as string
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        return <TableCell key={cell.id}>{date}</TableCell>;
                      }
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
      <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-4 py-4">
        <div
          className={`text-muted-foreground text-sm transition-opacity duration-200
          ${
            table.getFilteredSelectedRowModel().rows.length === 0 && "invisible"
          }
          `}
        >
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col-reverse md:flex-row gap-4 items-center">
          <div className="flex gap-2 items-center justify-between w-fit text-nowrap">
            <Label className="text-sm">Rows per page:</Label>
            <DropDown
              options={[
                { label: "10", value: "10" },
                { label: "20", value: "20" },
                { label: "30", value: "30" },
                { label: "40", value: "40" },
                { label: "50", value: "50" },
                { label: "100", value: "100" },
              ]}
              selectedOption={table.getState().pagination.pageSize.toString()}
              onSelect={(option) => {
                setPageSize(Number(option));
              }}
            />
          </div>
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.setPageIndex(0);
              }}
              disabled={pageIndex === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pageIndex + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.setPageIndex(totalPages - 1);
              }}
              disabled={pageIndex === totalPages - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
