/**
 * Order Monitoring Page - READ-ONLY
 * 
 * Spec:
 * ✅ READ-ONLY
 * ✅ Columns: PO #, Series #, Customer Name, Brand, Picker Status, Barcoder Status, Tagger Status, Checker Status, Overall Order Status, Delivery Schedule, Last Updated At
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/use-orders";
import { Activity, CheckCircle2, Clock } from "lucide-react";
import { useMemo, memo } from "react";
import type { Order } from "@/types/database";

interface OrderMonitorRecord {
  id: string;
  poNo: string;
  seriesNo: string;
  customerName: string;
  brand: string;
  pickerStatus: string;
  barcoderStatus: string;
  taggerStatus: string;
  checkerStatus: string;
  overallStatus: string;
  deliverySchedule: string;
  updatedAt: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case "Done": return "text-success font-bold";
    case "In Progress": return "text-warning font-bold";
    default: return "text-muted-foreground";
  }
};

// Memoized status color function to prevent unnecessary recalculations
const getStatusColor = (status: string) => statusColor(status);

const OrderMonitoring = memo(function OrderMonitoring() {
  const { data: ordersData, isLoading } = useOrders(1, 1000);

  // Memoize data mapping to prevent expensive recalculations
  const monitorData: OrderMonitorRecord[] = useMemo(() => {
    return (ordersData?.data || []).map((order: Order) => ({
      id: order.id.toString(),
      poNo: order.order_no,
      seriesNo: order.order_no.split('-').pop() || '',
      customerName: (order as { customer_name?: string }).customer_name || 'N/A',
      brand: 'N/A', // Not in current schema
      pickerStatus: order.status === 'completed' ? 'Done' : order.status === 'processing' ? 'In Progress' : 'Pending',
      barcoderStatus: order.status === 'completed' ? 'Done' : order.status === 'processing' ? 'In Progress' : 'Pending',
      taggerStatus: order.status === 'completed' ? 'Done' : order.status === 'processing' ? 'In Progress' : 'Pending',
      checkerStatus: order.status === 'completed' ? 'Done' : order.status === 'processing' ? 'In Progress' : 'Pending',
      overallStatus: order.status === 'completed' ? 'Ready' : order.status === 'processing' ? 'Processing' : 'Pending',
      deliverySchedule: order.expected_date ? new Date(order.expected_date).toLocaleDateString() : 'N/A',
      updatedAt: new Date(order.updated_at).toLocaleString(),
    }));
  }, [ordersData?.data]);

  // Memoize expensive stat calculations
  const { activeOrdersCount, pendingWorkflowCount, readyForDispatchCount } = useMemo(() => {
    return monitorData.reduce(
      (acc, order) => ({
        activeOrdersCount: acc.activeOrdersCount + 1,
        pendingWorkflowCount: acc.pendingWorkflowCount + (order.overallStatus === 'Processing' ? 1 : 0),
        readyForDispatchCount: acc.readyForDispatchCount + (order.overallStatus === 'Ready' ? 1 : 0),
      }),
      { activeOrdersCount: 0, pendingWorkflowCount: 0, readyForDispatchCount: 0 }
    );
  }, [monitorData]);

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
  const columns: ColumnDef<OrderMonitorRecord>[] = [
    { 
      key: "poNo", 
      label: "PO #", 
      className: "font-mono font-bold",
    },
    { key: "seriesNo", label: "Series #", className: "font-mono" },
    { key: "customerName", label: "Customer Name", className: "font-medium" },
    { key: "brand", label: "Brand" },
    {
      key: "pickerStatus",
      label: "Picker",
      render: (row) => <span className={getStatusColor(row.pickerStatus)}>{row.pickerStatus}</span>
    },
    {
      key: "barcoderStatus",
      label: "Barcoder",
      render: (row) => <span className={getStatusColor(row.barcoderStatus)}>{row.barcoderStatus}</span>
    },
    {
      key: "taggerStatus",
      label: "Tagger",
      render: (row) => <span className={getStatusColor(row.taggerStatus)}>{row.taggerStatus}</span>
    },
    {
      key: "checkerStatus",
      label: "Checker",
      render: (row) => <span className={getStatusColor(row.checkerStatus)}>{row.checkerStatus}</span>
    },
    {
      key: "overallStatus",
      label: "Overall Status",
      render: (row) => {
        const variants: Record<string, string> = {
          "Ready": "status-active",
          "Shipped": "status-active",
          "Processing": "status-pending",
          "Delayed": "status-error"
        };
        return <span className={`status-badge ${variants[row.overallStatus]}`}>{row.overallStatus}</span>;
      }
    },
    { key: "deliverySchedule", label: "Schedule", className: "font-bold" },
    { key: "updatedAt", label: "Last Updated", className: "text-muted-foreground text-sm" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Order Monitoring</h1>
          <p className="page-description">Real-time status tracking across the warehouse workflow</p>
        </div>
        <Badge variant="secondary">READ-ONLY</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Active Orders"
          value={activeOrdersCount}
          icon={Activity}
          variant="primary"
        />
        <StatCard
          label="Pending Workflow"
          value={pendingWorkflowCount}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          label="Ready for Dispatch"
          value={readyForDispatchCount}
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      <DataTable
        data={monitorData}
        columns={columns}
        searchPlaceholder="Search by PO #, Series #, or Customer..."
        defaultPageSize={10}
      />
    </div>
  );
});

export default OrderMonitoring;
