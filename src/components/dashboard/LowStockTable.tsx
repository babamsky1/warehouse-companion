import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  status: "critical" | "low";
}

const lowStockItems: LowStockItem[] = [
  {
    id: "1",
    sku: "WGT-A123",
    name: "Widget A-123",
    category: "Electronics",
    currentStock: 15,
    reorderLevel: 50,
    status: "critical",
  },
  {
    id: "2",
    sku: "CMP-B456",
    name: "Component B-456",
    category: "Machinery",
    currentStock: 28,
    reorderLevel: 40,
    status: "low",
  },
  {
    id: "3",
    sku: "RAW-C789",
    name: "Raw Material C-789",
    category: "Raw Materials",
    currentStock: 120,
    reorderLevel: 200,
    status: "low",
  },
  {
    id: "4",
    sku: "PKG-D012",
    name: "Packaging D-012",
    category: "Packaging",
    currentStock: 0,
    reorderLevel: 100,
    status: "critical",
  },
  {
    id: "5",
    sku: "ELC-E345",
    name: "Electronic E-345",
    category: "Electronics",
    currentStock: 8,
    reorderLevel: 25,
    status: "critical",
  },
];

export const LowStockTable = () => {
  return (
    <div className="content-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-lg">Low Stock Alerts</h3>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Reorder Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30">
                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.category}</TableCell>
                <TableCell className="text-right font-semibold">
                  <span
                    className={cn(
                      item.status === "critical" ? "text-destructive" : "text-warning"
                    )}
                  >
                    {item.currentStock}
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {item.reorderLevel}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.status === "critical" ? "destructive" : "secondary"}
                    className={cn(
                      item.status === "low" && "bg-warning/10 text-warning hover:bg-warning/20"
                    )}
                  >
                    {item.status === "critical" ? "Critical" : "Low"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
