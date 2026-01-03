import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { memo, useMemo, useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
  width?: number;
  render?: (row: T) => React.ReactNode;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[]; // Now includes width property
  actions?: (row: T) => React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  externalSearch?: string;
  onSearchChange?: (value: string) => void;
  // Virtualization settings
  rowHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

/**
 * Virtualized Table Component
 *
 * Optimized for large datasets (>1000 rows) using TanStack Virtual.
 * Renders only visible rows for smooth scrolling performance.
 *
 * Performance features:
 * - Virtual scrolling with configurable row height
 * - Memoized filtering and sorting
 * - Efficient re-renders with React.memo
 * - Optimized search with debouncing (when used with useDebounce)
 */
export const VirtualizedTable = memo(function VirtualizedTable<T>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = "Search...",
  isLoading = false,
  emptyMessage = "No data available",
  externalSearch,
  onSearchChange,
  rowHeight = 48, // Default row height
  containerHeight = 600, // Default container height
  overscan = 5, // Rows to render outside visible area
}: VirtualizedTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Virtualizer refs
  const parentRef = useRef<HTMLDivElement>(null);

  const search = externalSearch ?? internalSearch;

  const handleSearchChange = useCallback((value: string) => {
    if (onSearchChange) onSearchChange(value);
    else setInternalSearch(value);
  }, [onSearchChange]);

  const handleColumnFilterChange = useCallback((key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSort = useCallback((key: keyof T) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }, [sortKey, sortOrder]);

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    // Early return for empty data
    if (!data.length) return [];

    let rows = data;

    // Global search - optimized with early exit and cached lowercase conversion
    if (search) {
      const searchLower = search.toLowerCase();
      rows = rows.filter((row) => {
        // Use a for...in loop for better performance than Object.values().some()
        for (const key in row) {
          const value = (row as Record<string, unknown>)[key];
          if (value != null && String(value).toLowerCase().includes(searchLower)) {
            return true;
          }
        }
        return false;
      });
    }

    // Column filters - optimized with cached lowercase values
    if (Object.keys(columnFilters).length > 0) {
      const activeFilters = Object.entries(columnFilters).filter(([, value]) => value);
      if (activeFilters.length > 0) {
        rows = rows.filter((row) => {
          return activeFilters.every(([key, filterValue]) => {
            const rowValue = (row as Record<string, unknown>)[key];
            return rowValue != null && String(rowValue).toLowerCase().includes(filterValue.toLowerCase());
          });
        });
      }
    }

    // Sorting - only sort if we have data and a sort key
    if (sortKey && rows.length > 1) {
      rows = [...rows].sort((a, b) => {
        const aVal = String((a as Record<string, unknown>)[sortKey as string] ?? "");
        const bVal = String((b as Record<string, unknown>)[sortKey as string] ?? "");
        const comparison = aVal.localeCompare(bVal, undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return rows;
  }, [data, search, columnFilters, sortKey, sortOrder]);

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: processedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const getSortIcon = useCallback((columnKey: keyof T) => {
    if (sortKey !== columnKey)
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  }, [sortKey, sortOrder]);

  // Calculate total width for proper sizing
  const totalWidth = useMemo(() =>
    columns.reduce((sum, col) => sum + (col.width || 150), 0) + (actions ? 120 : 0),
    [columns, actions]
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Virtualized Table Container */}
      <div
        ref={parentRef}
        className="overflow-auto border rounded-md"
        style={{ height: containerHeight }}
      >
        <Table style={{ width: totalWidth }}>
          <TableHeader className="sticky top-0 bg-background z-10">
            {/* Header Row */}
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={`px-2 text-left ${col.headerClassName || col.className}`}
                  style={{ width: col.width || 150, minWidth: col.width || 150 }}
                >
                  {col.sortable !== false ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center justify-start gap-1 font-medium hover:text-foreground transition-colors w-full text-left px-2"
                    >
                      <span className="truncate">{col.label}</span>
                      {getSortIcon(col.key)}
                    </button>
                  ) : (
                    <span className="font-medium px-2 truncate">{col.label}</span>
                  )}
                </TableHead>
              ))}
              {actions && <TableHead className="px-2 text-left" style={{ width: 120, minWidth: 120 }}>Actions</TableHead>}
            </TableRow>

            {/* Filter Row */}
            <TableRow className="bg-muted/10">
              {columns.map((col) => (
                <TableHead key={`filter-${String(col.key)}`} className="px-2 text-left" style={{ width: col.width || 150 }}>
                  {col.filterable !== false && (
                    <div className="relative w-full">
                      <Input
                        placeholder="Filter..."
                        value={columnFilters[String(col.key)] || ""}
                        onChange={(e) =>
                          handleColumnFilterChange(String(col.key), e.target.value)
                        }
                        className="h-8 text-xs font-bold w-full bg-background pr-7 text-left"
                      />
                      {columnFilters[String(col.key)] && (
                        <button
                          onClick={() => handleColumnFilterChange(String(col.key), "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
              {actions && <TableHead className="px-2 text-left" style={{ width: 120 }} />}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : processedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p className="text-sm">{emptyMessage}</p>
                    {(search || Object.keys(columnFilters).length > 0) && (
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = processedData[virtualRow.index];
                  return (
                    <TableRow
                      key={String((row as Record<string, unknown>).id || virtualRow.index)}
                      className="hover:bg-muted/30 absolute w-full"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {columns.map((col) => (
                        <TableCell key={String(col.key)} className={`${col.className} px-2 text-left`} style={{ width: col.width || 150 }}>
                          {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                        </TableCell>
                      ))}
                      {actions && (
                        <TableCell className="px-2 text-left" style={{ width: 120 }}>
                          {actions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </div>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer with row count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {processedData.length} of {data.length} total results
        {processedData.length !== data.length && (
          <span className="ml-2">(filtered from {data.length})</span>
        )}
      </div>
    </div>
  );
});
