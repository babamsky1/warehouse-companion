import { memo, useMemo } from "react";
import { DataTable, type ColumnDef } from "./DataTable";
import { VirtualizedTable } from "./VirtualizedTable";

interface SmartTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: (row: T) => React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  externalSearch?: string;
  onSearchChange?: (value: string) => void;
  // Auto-virtualization threshold
  virtualizationThreshold?: number;
  // Virtual table settings
  rowHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

/**
 * Smart Table Component
 *
 * Automatically chooses between regular DataTable and VirtualizedTable
 * based on data size for optimal performance.
 *
 * - Uses DataTable for small datasets (< 100 rows by default)
 * - Uses VirtualizedTable for large datasets (>= 100 rows by default)
 *
 * Performance optimization:
 * - Small datasets: Fast rendering, full pagination
 * - Large datasets: Virtual scrolling, smooth performance
 */
export const SmartTable = memo(function SmartTable<T>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = "Search...",
  isLoading = false,
  emptyMessage = "No data available",
  externalSearch,
  onSearchChange,
  virtualizationThreshold = 100, // Auto-switch to virtualization at 100+ rows
  rowHeight = 48,
  containerHeight = 600,
  overscan = 5,
}: SmartTableProps<T>) {
  // Determine if we should use virtualization
  const shouldVirtualize = useMemo(() => {
    return data.length >= virtualizationThreshold;
  }, [data.length, virtualizationThreshold]);

  // Performance logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`SmartTable: ${data.length} rows, using ${shouldVirtualize ? 'virtualized' : 'regular'} table`);
  }

  if (shouldVirtualize) {
    return (
      <VirtualizedTable
        data={data}
        columns={columns}
        actions={actions}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        externalSearch={externalSearch}
        onSearchChange={onSearchChange}
        rowHeight={rowHeight}
        containerHeight={containerHeight}
        overscan={overscan}
      />
    );
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      actions={actions}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      externalSearch={externalSearch}
      onSearchChange={onSearchChange}
    />
  );
});
