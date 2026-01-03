/**
 * Allocation Summary Page - READ-ONLY
 * 
 * Spec:
 * ✅ READ-ONLY
 * ✅ Columns: PO #, Series #, Brand, Customer Name, Total Allocated Qty, Total Picked Qty, Total Remaining Qty, Status, Last Updated At
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/use-orders";
import { AlertCircle, CheckCircle2, ClipboardList } from "lucide-react";
import { useMemo, memo } from "react";
import type { Order } from "@/types/database";

interface AllocationRecord {
  id: string;
  poNo: string;
  seriesNo: string;
  brand: string;
  customerName: string;
  allocatedQty: number;
  pickedQty: number;
  remainingQty: number;
  status: "Fully Picked" | "Partially Picked" | "Pending";
  updatedAt: string;
}

const AllocationSummary = memo(function AllocationSummary() {
  const { data: ordersData, isLoading } = useOrders(1, 1000);

  // Memoize data mapping to prevent expensive recalculations
  const allocationData: AllocationRecord[] = useMemo(() => {
    return (ordersData?.data || []).map((order: Order) => {
      // Calculate quantities from order items (simplified - in real app, calculate from order items)
      const allocatedQty = 0; // TODO: Calculate from order items
      const pickedQty = order.status === 'completed' ? allocatedQty : order.status === 'processing' ? allocatedQty * 0.5 : 0;
      const remainingQty = allocatedQty - pickedQty;

      let status: "Fully Picked" | "Partially Picked" | "Pending";
      if (pickedQty === 0) {
        status = "Pending";
      } else if (pickedQty >= allocatedQty) {
        status = "Fully Picked";
      } else {
        status = "Partially Picked";
      }

      return {
        id: order.id.toString(),
        poNo: order.order_no,
        seriesNo: order.order_no.split('-').pop() || '',
        brand: 'N/A', // Not in current schema
        customerName: (order as any).customer_name || 'N/A',
        allocatedQty,
        pickedQty,
        remainingQty,
        status,
        updatedAt: new Date(order.updated_at).toLocaleString(),
      };
    });
  }, [ordersData?.data]);

  // Memoize expensive stat calculations
  const { totalAllocated, totalPicked, totalRemaining } = useMemo(() => {
    return allocationData.reduce(
      (acc, record) => ({
        totalAllocated: acc.totalAllocated + record.allocatedQty,
        totalPicked: acc.totalPicked + record.pickedQty,
        totalRemaining: acc.totalRemaining + record.remainingQty,
      }),
      { totalAllocated: 0, totalPicked: 0, totalRemaining: 0 }
    );
  }, [allocationData]);

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
  const columns: ColumnDef<AllocationRecord>[] = [
    { key: "poNo", label: "PO #", className: "font-mono font-bold" },
    { key: "seriesNo", label: "Series #", className: "font-mono" },
    { key: "brand", label: "Brand" },
    { key: "customerName", label: "Customer Name", className: "font-medium" },
    { 
      key: "allocatedQty", 
      label: "Allocated", 
      render: (row) => row.allocatedQty.toLocaleString() 
    },
    { 
      key: "pickedQty", 
      label: "Picked", 
      className: "text-success font-medium",
      render: (row) => row.pickedQty.toLocaleString() 
    },
    { 
      key: "remainingQty", 
      label: "Remaining", 
      className: "text-destructive font-medium",
      render: (row) => row.remainingQty.toLocaleString() 
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const variants: Record<string, string> = {
          "Fully Picked": "status-active",
          "Partially Picked": "status-pending",
          "Pending": "status-warning"
        };
        return <span className={`status-badge ${variants[row.status]}`}>{row.status}</span>;
      }
    },
    { key: "updatedAt", label: "Last Updated", className: "text-muted-foreground text-sm" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Allocation Summary</h1>
          <p className="page-description">Derived from picker, barcoder, tagger, and checker assignments</p>
        </div>
        <Badge variant="secondary">READ-ONLY</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Allocated"
          value={totalAllocated.toLocaleString()}
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          label="Total Picked"
          value={totalPicked.toLocaleString()}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="Total Remaining"
          value={totalRemaining.toLocaleString()}
          icon={AlertCircle}
          variant="destructive"
        />
      </div>

      <DataTable
        data={allocationData}
        columns={columns}
        searchPlaceholder="Search by PO #, Series #, or Customer..."
        defaultPageSize={10}
      />
    </div>
  );
});

export default AllocationSummary;
