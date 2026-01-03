import { cn } from "@/lib/utils";
import * as React from "react";

type TableVariant = "default" | "dashboard" | "inventory" | "transfers" | "orders" | "custom";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
}
const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div className="relative w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          "w-full table-auto min-w-full caption-bottom text-sm text-left border-collapse",
          variant !== "default" && `table-variant-${variant}`,
          className
        )}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("bg-muted/50 [&_tr]:border-b", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b hover:bg-muted/50 transition-colors",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 align-middle font-medium text-muted-foreground text-left",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle text-left break-words",
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };

