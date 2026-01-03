/**
 * Purchase Order Page
 * 
 * Spec:
 * ✅ Read-only when Pending / Approved / Received
 * ✅ Columns: PO #, Order Date, Supplier, Expected Date, Total Amount, Status, Created By/At
 */

import { StatCard } from "@/components/dashboard/StatCard";
import AddModal, { AddField } from "@/components/modals/AddModal";
import DeleteModal from "@/components/modals/DeleteModal";
import EditModal from "@/components/modals/EditModal";
import { ActionMenu } from "@/components/table/ActionMenu";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from "@/hooks/use-orders";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useWarehouses } from "@/hooks/use-warehouses";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, ShoppingCart } from "lucide-react";
import type { Order } from "@/types/database";

interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  orderDate: string;
  supplierName: string;
  expectedDate: string;
  totalAmount: number;
  priority: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function PurchaseOrder() {
  const { data: ordersData, isLoading } = useOrders(1, 50);
  const { data: suppliers } = useSuppliers();
  const { data: warehouses } = useWarehouses();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  // Filter purchase orders (order_type === 'purchase')
  const purchaseOrders = (ordersData?.data || []).filter((o: Order) => o.order_type === 'purchase');
  
  // Map to component format
  const records: PurchaseOrderRecord[] = purchaseOrders.map((order: Order) => {
    const supplier = suppliers?.find(s => s.id === order.supplier_id);
    
    return {
      id: order.id.toString(),
      poNumber: order.order_no,
      orderDate: new Date(order.order_date).toLocaleDateString(),
      supplierName: supplier?.name || 'Unknown',
      expectedDate: order.expected_date ? new Date(order.expected_date).toLocaleDateString() : 'N/A',
      totalAmount: order.total_amount || 0,
      priority: order.priority || 'normal',
      status: order.status === 'draft' ? 'Draft' : order.status === 'pending' ? 'Pending' : order.status === 'approved' ? 'Approved' : order.status === 'completed' ? 'Received' : 'Draft',
      createdBy: `User ${order.created_by}`,
      createdAt: new Date(order.created_at).toLocaleString(),
      updatedAt: new Date(order.updated_at).toLocaleString(),
    };
  });

  const supplierOptions = (suppliers || []).map(s => ({ value: s.name, label: s.name }));
  const warehouseOptions = (warehouses || []).map(w => ({ value: w.name, label: w.name }));

  const addFields: AddField<PurchaseOrderRecord>[] = [
    { label: "Supplier", name: "supplierName", type: "select", options: supplierOptions, required: true },
    { label: "Warehouse", name: "warehouseName", type: "select", options: warehouseOptions, required: true },
    { label: "Total Amount", name: "totalAmount", type: "number", required: true },
    { label: "Priority", name: "priority", type: "select", options: [{value: "low", label: "Low"}, {value: "normal", label: "Medium"}, {value: "high", label: "High"}, {value: "urgent", label: "Urgent"}], required: true },
    { label: "Order Date", name: "orderDate", type: "text", placeholder: "YYYY-MM-DD", required: true },
    { label: "Expected Delivery", name: "expectedDate", type: "text", placeholder: "YYYY-MM-DD", required: true },
  ];

  const columns: ColumnDef<PurchaseOrderRecord>[] = [
    { 
      key: "poNumber", 
      label: "PO #", 
      className: "font-mono font-bold",
    },
    { key: "orderDate", label: "Order Date" },
    { key: "supplierName", label: "Supplier" },
    { key: "expectedDate", label: "Expected Date" },
    { 
      key: "totalAmount", 
      label: "Amount", 
      className: "font-bold",
      render: (row) => `₱${row.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    {
      key: "priority",
      label: "Priority",
      render: (row) => {
        const colors: Record<string, string> = {
          "Low": "bg-info/10 text-info",
          "Medium": "bg-warning/10 text-warning",
          "High": "bg-destructive/10 text-destructive"
        };
        return <span className={cn("status-badge", colors[row.priority])}>{row.priority}</span>;
      }
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const variants: Record<string, string> = {
          "Draft": "status-pending",
          "Pending": "status-warning",
          "Approved": "status-active",
          "Received": "bg-success text-success-foreground"
        };
        return <span className={cn("status-badge", variants[row.status])}>{row.status}</span>;
      }
    },
    { key: "updatedAt", label: "Updated At", className: "hidden xl:table-cell text-sm text-muted-foreground" }
  ];

  const handleUpdate = async (id: string, data: Partial<PurchaseOrderRecord>) => {
    try {
      const orderId = parseInt(id);
      const supplier = suppliers?.find(s => s.name === data.supplierName);
      const warehouse = warehouses?.find(w => w.name === (data as any).warehouseName);
      
      await updateOrder.mutateAsync({
        id: orderId,
        data: {
          supplier_id: supplier?.id,
          warehouse_id: warehouse?.id,
          total_amount: data.totalAmount,
          priority: data.priority as any,
          status: data.status === 'Pending' ? 'pending' : data.status === 'Approved' ? 'approved' : data.status === 'Received' ? 'completed' : 'draft' as any,
          expected_date: data.expectedDate,
        },
      });
      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase order",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOrder.mutateAsync(parseInt(id));
      toast({
        title: "Success",
        description: "Purchase order deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete purchase order",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-description">Manage and track procurement cycles with suppliers</p>
        </div>
        <AddModal<PurchaseOrderRecord>
          title="Create New Purchase Order"
          fields={addFields}
          onSubmit={async (data) => {
            try {
              const supplier = suppliers?.find(s => s.name === data.supplierName);
              const warehouse = warehouses?.find(w => w.name === (data as any).warehouseName);
              
              if (!supplier || !warehouse) {
                toast({
                  title: "Error",
                  description: "Please select valid supplier and warehouse",
                  variant: "destructive",
                });
                return;
              }

              await createOrder.mutateAsync({
                order_type: 'purchase',
                supplier_id: supplier.id,
                warehouse_id: warehouse.id,
                total_amount: data.totalAmount,
                priority: data.priority as any,
                order_date: data.orderDate,
                expected_date: data.expectedDate,
                status: 'draft',
              });
              toast({
                title: "Success",
                description: "Purchase order created successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to create purchase order",
                variant: "destructive",
              });
            }
          }}
          triggerLabel="New PO"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total POs" value={records.length} icon={ShoppingCart} variant="primary" />
        <StatCard label="Pending Approval" value={records.filter(r => r.status === 'Pending').length} icon={Clock} variant="warning" />
        <StatCard label="Approved" value={records.filter(r => r.status === 'Approved').length} icon={CheckCircle2} variant="success" />
      </div>

      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search by PO #, supplier..."
        actions={(row) => {
          const isLocked = row.status === "Approved" || row.status === "Received";
          if (isLocked) return <Badge variant="secondary">LOCKED</Badge>;

          return (
            <ActionMenu>
              <EditModal<PurchaseOrderRecord>
                title="Edit Purchase Order"
                data={row}
                fields={addFields as any}
                onSubmit={(data) => handleUpdate(row.id, data)}
                triggerLabel="Edit"
              />
              <DeleteModal
                title="Delete Purchase Order"
                onSubmit={() => handleDelete(row.id)}
                triggerLabel="Delete"
              />
              <Button size="sm" variant="ghost" className="text-success" onClick={() => handleUpdate(row.id, { status: "Pending" })}>
                 Submit for Approval
              </Button>
            </ActionMenu>
          );
        }}
      />
    </div>
  );
}
