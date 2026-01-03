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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { ReactNode, useMemo, useState, memo } from "react";

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: (row: T) => ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  defaultPageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  externalSearch?: string;
  onSearchChange?: (value: string) => void;
}

export const DataTable = memo(function DataTable<T>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = "Search...",
  defaultPageSize = 10,
  isLoading = false,
  emptyMessage = "No data available",
  externalSearch,
  onSearchChange,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = defaultPageSize;

  const search = externalSearch ?? internalSearch;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) onSearchChange(value);
    else setInternalSearch(value);
    setPage(1);
  };

  const handleColumnFilterChange = (key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (key: keyof T) => {
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
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

  const totalPages = Math.ceil(filtered.length / pageSize);
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const goToFirstPage = () => setPage(1);
  const goToLastPage = () => setPage(totalPages);
  const goToPreviousPage = () => setPage(Math.max(1, page - 1));
  const goToNextPage = () => setPage(Math.min(totalPages, page + 1));

  const getSortIcon = (columnKey: keyof T) => {
    if (sortKey !== columnKey)
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

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

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <Table className="table-auto w-full">
          <TableHeader>
            {/* Header Row */}
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={`px-2 text-left ${col.headerClassName || col.className}`}
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
              {actions && <TableHead className="px-2 text-left">Actions</TableHead>}
            </TableRow>

            {/* Filter Row */}
            <TableRow className="bg-muted/10">
              {columns.map((col) => (
                <TableHead key={`filter-${String(col.key)}`} className="px-2 text-left">
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
              {actions && <TableHead className="px-2 text-left" />}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32">
                  <div className="flex items-left text-left justify-left">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32">
                  <div className="flex flex-col items-left justify-left text-muted-foreground">
                    <p className="text-sm">{emptyMessage}</p>
                    {(search || Object.keys(columnFilters).length > 0) && (
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={String((row as Record<string, unknown>).id || index)} className="hover:bg-muted/30">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={`${col.className} px-2 text-left`}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                    </TableCell>
                  ))}
                  {actions && <TableCell className="px-2 text-left">{actions(row)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * pageSize, filtered.length)}</span> of{" "}
            <span className="font-medium">{filtered.length}</span> results
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={goToFirstPage}
              disabled={page === 1}
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousPage}
              disabled={page === 1}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center min-w-[100px] px-3">
              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={page === totalPages}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToLastPage}
              disabled={page === totalPages}
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
