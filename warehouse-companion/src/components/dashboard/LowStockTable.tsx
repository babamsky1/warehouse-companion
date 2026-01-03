import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { memo, useMemo } from "react";
import { useLowStock } from "@/hooks/use-stocks";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useStockBuffers } from "@/hooks/use-stock-buffers";

export const LowStockTable = memo(() => {
  const { data: lowStocks, isLoading: isLoadingStocks, error } = useLowStock();
  const { data: products } = useProducts(1, 1000);
  const { data: categories } = useCategories();
  const { data: stockBuffers } = useStockBuffers();

  if (isLoadingStocks) {
    return (
      <div className="content-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-lg">Low Stock Alerts</h3>
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-section">
        <div className="text-center py-8 text-muted-foreground">
          Failed to load low stock items
        </div>
      </div>
    );
  }

  // Memoized data processing for performance
  const lowStockItems = useMemo(() => {
    if (!lowStocks || !products?.data || !categories || !stockBuffers) return [];

    return lowStocks.slice(0, 5).map((stock) => {
      const product = products.data.find((p) => p.id === stock.product_id);
      const category = categories.find((c) => c.id === product?.category_id);
      const buffer = stockBuffers.find((b) => b.product_id === stock.product_id);

      const reorderLevel = buffer?.reorder_point || buffer?.minimum_stock || 0;
      const isCritical = stock.quantity === 0 || (buffer && stock.quantity < buffer.minimum_stock * 0.5);

      return {
        id: stock.id.toString(),
        sku: product?.sku || 'N/A',
        name: product?.name || 'Unknown Product',
        category: category?.name || 'Uncategorized',
        currentStock: stock.quantity,
        reorderLevel,
        status: isCritical ? "critical" as const : "low" as const,
      };
    });
  }, [lowStocks, products?.data, categories, stockBuffers]);

  return (
    <div className="content-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-lg">Low Stock Alerts</h3>
        </div>
        <Link to="/reports/low-stocks">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
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
            {lowStockItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No low stock items
                </TableCell>
              </TableRow>
            ) : (
              lowStockItems.map((item) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});
