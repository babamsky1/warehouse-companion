/**
 * Stock Inquiry Page - READ-ONLY
 * 
 * Spec:
 * ✅ READ-ONLY (No create/update/delete)
 * ✅ Columns: PSC, AN #, Barcode, Description, Brand (BW, KLIK, OMG, ORO), Item Group, Color
 * ✅ Rule: No editing, no posting, no manual quantity changes
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { useStocks } from "@/hooks/use-stocks";
import { useCategories } from "@/hooks/use-categories";
import { Layers, Package, Tag } from "lucide-react";

interface StockRecord {
  id: string;
  psc: string;
  anNo: string;
  barcode: string;
  description: string;
  brand: "BW" | "KLIK" | "OMG" | "ORO";
  itemGroup: string;
  color: string;
  quantity: number;
}

export default function StockInquiry() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(1, 1000);
  const { data: stocksData, isLoading: isLoadingStocks } = useStocks(1, 1000);
  const { data: categories } = useCategories();

  const isLoading = isLoadingProducts || isLoadingStocks;

  // Map API data to StockRecord format
  const stockData: StockRecord[] = (productsData?.data || []).map((product) => {
    const stock = stocksData?.data.find((s) => s.product_id === product.id);
    const category = categories?.find((c) => c.id === product.category_id);
    
    return {
      id: product.id.toString(),
      psc: product.sku,
      anNo: product.barcode || "N/A",
      barcode: product.barcode || "",
      description: product.name,
      brand: (product.brand as "BW" | "KLIK" | "OMG" | "ORO") || "BW",
      itemGroup: category?.name || "Uncategorized",
      color: "N/A", // Not in current schema
      quantity: stock?.quantity || 0,
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  const columns: ColumnDef<StockRecord>[] = [
    {
      key: "psc",
      label: "PSC",
      className: "font-mono font-bold text-primary",
    },
    {
      key: "anNo",
      label: "AN #",
      className: "font-mono",
    },
    {
      key: "barcode",
      label: "Barcode",
      className: "font-mono text-muted-foreground",
    },
    {
      key: "description",
      label: "Description",
      className: "font-medium",
    },
    {
      key: "brand",
      label: "Brand",
      render: (row) => (
        <Badge variant="outline" className="font-bold">
          {row.brand}
        </Badge>
      ),
    },
    {
      key: "itemGroup",
      label: "Item Group",
    },
    {
      key: "color",
      label: "Color",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full border border-muted" 
            style={{ backgroundColor: row.color.toLowerCase() === 'multi' ? 'transparent' : row.color.toLowerCase() }}
          />
          {row.color}
        </div>
      ),
    },
    {
      key: "quantity",
      label: "System Balance",
      className: "font-bold",
      render: (row) => row.quantity.toLocaleString(),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Stock Inquiry</h1>
          <p className="page-description">View real-time balances derived from transaction history</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="secondary" className="px-3 py-1">READ-ONLY</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total PSCs"
          value={stockData.length}
          icon={Package}
          variant="primary"
        />
        <StatCard
          label="Stocked Brands"
          value={new Set(stockData.map(s => s.brand)).size}
          icon={Tag}
          variant="info"
        />
        <StatCard
          label="Active Groups"
          value={new Set(stockData.map(s => s.itemGroup)).size}
          icon={Layers}
          variant="success"
        />
      </div>

      <DataTable
        data={stockData}
        columns={columns}
        searchPlaceholder="Search by PSC, AN #, Barcode, or Description..."
        defaultPageSize={10}
        emptyMessage="No stock records found."
      />

      <div className="p-4 bg-muted/30 border border-dashed rounded-lg text-xs text-muted-foreground italic text-center">
        Note: Quantities are system-computed and cannot be manually adjusted on this page.
      </div>
    </div>
  );
}
