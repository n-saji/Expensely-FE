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

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Paperclip,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import DropDown from "@/components/drop-down";
import CategoryBadge, { toRgba } from "@/components/category-badge";
import { getCategoryIcon } from "@/components/category-icon-registry";
import { formatAmountCompact } from "@/utils/amount_formatter";

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
  categories?: any[];
  userCurrency?: string;
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
  categories = [],
  userCurrency = "USD",
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

  const handleSort = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (column && column.getCanSort()) {
      column.toggleSorting(column.getIsSorted() === "asc");
    }
  };

  const getSortIcon = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return null;
    const isSorted = column.getIsSorted();
    if (isSorted === false) {
      return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />;
    }
    return isSorted === "asc" ? (
      <ArrowUp className="ml-2 h-3.5 w-3.5 text-foreground shrink-0" />
    ) : (
      <ArrowDown className="ml-2 h-3.5 w-3.5 text-foreground shrink-0" />
    );
  };

  // Group rows by Date
  interface DateGroup {
    dateStr: string;
    rows: any[];
    total: number; // Summing base amounts or display amounts
    currency: string;
  }

  const dateGroups: DateGroup[] = [];
  table.getRowModel().rows.forEach((row) => {
    const transaction = row.original as any;
    const dateValue = transaction.transactionDate;
    const dateStr = dateValue
      ? new Date(dateValue).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Unknown Date";

    const currency = transaction.displayCurrency || transaction.currency || userCurrency || "USD";

    let group = dateGroups.find((g) => g.dateStr === dateStr);
    if (!group) {
      group = { dateStr, rows: [], total: 0, currency };
      dateGroups.push(group);
    }
    group.rows.push(row);
    // Add amount if income, subtract if expense
    const amt = Number(transaction.displayAmount ?? transaction.amount ?? 0);
    if (transaction.type === "EXPENSE") {
      group.total -= amt;
    } else {
      group.total += amt;
    }
  });

  return (
    <div className="space-y-4">
      {/* Main Container */}
      <div className="overflow-hidden rounded-xl border border-border/40 bg-card/25 shadow-sm backdrop-blur-sm">
        {/* Desktop Header */}
        <div className="hidden sm:grid grid-cols-[40px_50px_1fr_120px_50px] gap-4 px-6 py-3 text-[11px] font-semibold text-muted-foreground/80 tracking-wider uppercase border-b border-border/20">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
          <div /> {/* Category Icon spacer */}
          <div
            className="cursor-pointer flex items-center select-none hover:text-foreground transition-colors"
            onClick={() => handleSort("transactionDate")}
          >
            Description
          </div>
          <div
            className="text-right cursor-pointer flex items-center justify-end select-none hover:text-foreground transition-colors"
            onClick={() => handleSort("amount")}
          >
            Amount
            {getSortIcon("amount")}
          </div>
          <div /> {/* Actions spacer */}
        </div>

        {/* Loading / Skeleton State */}
        {loading ? (
          <div className="divide-y divide-border/10">
            {[...Array(3)].map((_, groupIdx) => (
              <div key={groupIdx} className="bg-card/5">
                <div className="flex items-center justify-between px-6 py-2.5 bg-muted/5 border-y border-border/10">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {[...Array(groupIdx === 0 ? 1 : 2)].map((_, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center gap-4 px-6 py-3.5 border-b border-border/10 last:border-0"
                  >
                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-16 rounded-full shrink-0" />
                    </div>
                    <Skeleton className="h-4 w-16 shrink-0" />
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {dateGroups.length ? (
              dateGroups.map((group) => (
                <div key={group.dateStr} className="bg-card/5">
                  {/* Date Group Header */}
                  <div className="flex items-center justify-between px-6 py-2 bg-muted/5 border-y border-border/10">
                    <span className="text-[11px] font-semibold text-muted-foreground/60 tracking-wider uppercase">
                      {group.dateStr}
                    </span>
                    <span className={`text-[11px] font-bold ${group.total < 0 ? "text-rose-500/80" : "text-emerald-500/80"}`}>
                      {group.total < 0 ? "-" : "+"}
                      {formatAmountCompact(Math.abs(group.total), group.currency)}
                    </span>
                  </div>

                  {/* Group Items */}
                  <div className="divide-y divide-border/10">
                    {group.rows.map((row) => {
                      const transaction = row.original as any;
                      const categoryMeta = categories.find((c) => c.id === transaction.categoryId);
                      const resolvedColor = categoryMeta?.color || "#808080";
                      const CategoryIcon = getCategoryIcon(categoryMeta?.icon);

                      const currency = transaction.displayCurrency || transaction.currency || userCurrency || "USD";
                      const amountStr = formatAmountCompact(Number(transaction.displayAmount ?? transaction.amount ?? 0), currency);

                      const actionsCell = row
                        .getVisibleCells()
                        .find((c: any) => c.column.id === "actions");

                      return (
                        <div key={row.id}>
                          {/* Desktop Row */}
                          <div
                            className={`hidden sm:grid grid-cols-[40px_50px_1fr_120px_50px] gap-4 px-6 py-3 items-center hover:bg-muted/5 transition-colors ${
                              row.getIsSelected() ? "bg-muted/10" : ""
                            }`}
                          >
                            {/* Checkbox */}
                            <div className="flex items-center justify-center">
                              <Checkbox
                                  checked={row.getIsSelected()}
                                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                                  aria-label="Select row"
                              />
                            </div>

                            {/* Category Icon */}
                            <div className="flex items-center justify-center">
                              <span
                                className="inline-flex items-center justify-center rounded-full h-8 w-8 shrink-0 border border-border/5 shadow-xs"
                                style={{
                                  color: resolvedColor,
                                  backgroundColor: toRgba(resolvedColor, 0.1),
                                }}
                              >
                                <CategoryIcon className="h-4 w-4" />
                              </span>
                            </div>

                            {/* Description */}
                            <div className="min-w-0 pr-4 flex flex-col gap-0.5">
                              <div className="font-medium text-sm text-foreground flex items-center gap-1.5 truncate">
                                <span className="truncate" title={transaction.description}>
                                  {transaction.description}
                                </span>
                                {transaction.type === "EXPENSE" && transaction.receiptUrl && (
                                  <Paperclip className="h-3 w-3 text-muted-foreground/60 shrink-0" aria-label="Has receipt" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground font-normal">
                                  {transaction.categoryName}
                                </span>
                                <span className="h-1 w-1 bg-muted-foreground/30 rounded-full shrink-0" />
                                <span
                                  className={`inline-flex items-center text-[9px] font-semibold uppercase tracking-wider ${
                                    transaction.type === "EXPENSE"
                                      ? "text-rose-500/80"
                                      : "text-emerald-500/80"
                                  }`}
                                >
                                  {transaction.type === "EXPENSE" ? "Expense" : "Income"}
                                </span>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className={`text-right font-medium text-sm ${transaction.type === "EXPENSE" ? "text-rose-500/90" : "text-emerald-500/90"}`}>
                              {amountStr}
                            </div>

                            {/* Actions Dropdown */}
                            <div className="flex justify-end">
                              {actionsCell &&
                                flexRender(
                                  actionsCell.column.columnDef.cell,
                                  actionsCell.getContext()
                                )}
                            </div>
                          </div>

                          {/* Mobile Row */}
                          <div
                            className={`flex sm:hidden items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors ${
                              row.getIsSelected() ? "bg-muted/10" : ""
                            }`}
                          >
                            {/* Checkbox */}
                            <div className="flex items-center justify-center shrink-0">
                              <Checkbox
                                checked={row.getIsSelected()}
                                onCheckedChange={(value) => row.toggleSelected(!!value)}
                                aria-label="Select row"
                              />
                            </div>

                            {/* Icon & Details */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span
                                className="inline-flex items-center justify-center rounded-full h-8 w-8 shrink-0 border border-border/5 shadow-xs"
                                style={{
                                  color: resolvedColor,
                                  backgroundColor: toRgba(resolvedColor, 0.1),
                                }}
                              >
                                <CategoryIcon className="h-4 w-4" />
                              </span>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2">
                                  <div className="font-medium text-sm text-foreground flex items-center gap-1.5 truncate">
                                    <span className="truncate">{transaction.description}</span>
                                    {transaction.type === "EXPENSE" && transaction.receiptUrl && (
                                      <Paperclip className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                                    )}
                                  </div>
                                  <div className={`font-medium text-sm shrink-0 ${transaction.type === "EXPENSE" ? "text-rose-500/90" : "text-emerald-500/90"}`}>
                                    {amountStr}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-muted-foreground font-normal">
                                    {transaction.categoryName}
                                  </span>
                                  <span className="h-1 w-1 bg-muted-foreground/30 rounded-full shrink-0" />
                                  <span
                                    className={`inline-flex items-center text-[9px] font-semibold uppercase tracking-wider ${
                                      transaction.type === "EXPENSE"
                                        ? "text-rose-500/80"
                                        : "text-emerald-500/80"
                                    }`}
                                  >
                                    {transaction.type === "EXPENSE" ? "Expense" : "Income"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="shrink-0">
                              {actionsCell &&
                                flexRender(
                                  actionsCell.column.columnDef.cell,
                                  actionsCell.getContext()
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-center p-6">
                <span className="text-sm text-muted-foreground">No transactions found.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-4 py-2 px-1">
        <div
          className={`text-muted-foreground text-sm transition-opacity duration-200 ${
            table.getFilteredSelectedRowModel().rows.length === 0 && "opacity-0"
          }`}
        >
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col-reverse md:flex-row gap-4 items-center w-full md:w-auto">
          <div className="flex gap-2 items-center justify-between w-full md:w-fit text-nowrap">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rows per page:</Label>
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
          <div className="flex items-center justify-between md:justify-end space-x-2 w-full md:w-auto">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
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
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-xs font-medium text-muted-foreground min-w-[80px] text-center">
              Page {pageIndex + 1} of {totalPages || 1}
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
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
    </div>
  );
}
