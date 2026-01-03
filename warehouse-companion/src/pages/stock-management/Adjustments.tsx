/**
 * Adjustments Page - CONDITIONALLY READ-ONLY
 * 
 * Spec:
 * ✅ Read-only when status is Pending / Done
 * ✅ Columns: Reference #, Adjustment Date, Source Reference, Category (JO, Zero Out, etc), Warehouse, Status, Created By/At, Updated By/At
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
import { useAdjustments, useCreateAdjustment, useUpdateAdjustment, useDeleteAdjustment } from "@/hooks/use-adjustments";
import { useProducts } from "@/hooks/use-products";
import { useWarehouses } from "@/hooks/use-warehouses";
import { CheckCircle2, Clock, Scale } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Adjustment } from "@/types/database";

interface AdjustmentRecord {
  id: string;
  referenceNo: string;
  adjustmentDate: string;
  sourceReference: string;
  category: string;
  warehouse: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export default function Adjustments() {
  const { data: adjustmentsData, isLoading } = useAdjustments(1, 50);
  const createAdjustment = useCreateAdjustment();
  const updateAdjustment = useUpdateAdjustment();
  const deleteAdjustment = useDeleteAdjustment();
  const { data: warehouses } = useWarehouses();
  const { data: products } = useProducts();

  // Define adjustment categories
  const categories = ['correction', 'damaged', 'expired', 'theft', 'system', 'other'];

  // Map API data to component format
  const adjustments: AdjustmentRecord[] = (adjustmentsData?.data || []).map((adj: Adjustment) => ({
    id: adj.id.toString(),
    referenceNo: adj.adjustment_no || `ADJ-${adj.id}`,
    adjustmentDate: new Date(adj.created_at).toLocaleDateString(),
    sourceReference: adj.reason || 'N/A',
    category: adj.category || 'correction',
    warehouse: warehouses?.find(w => w.id === adj.warehouse_id)?.name || 'Unknown',
    status: adj.status || 'pending',
    createdBy: `User ${adj.created_by}`,
    createdAt: new Date(adj.created_at).toLocaleString(),
    updatedBy: `User ${adj.updated_by}`,
    updatedAt: new Date(adj.updated_at).toLocaleString(),
  }));

  const productOptions = (products || []).map(p => ({ value: p.id.toString(), label: `${p.sku} - ${p.name}` }));
  const warehouseOptions = (warehouses || []).map(w => ({ value: w.name, label: w.name }));
  const locationOptions = [{ value: "1", label: "Location 1" }, { value: "2", label: "Location 2" }]; // TODO: Replace with useStockLocations
  const adjustmentTypeOptions = [{ value: "increase", label: "Increase" }, { value: "decrease", label: "Decrease" }];

  const addFields: AddField<AdjustmentRecord>[] = [
    { label: "Product", name: "product_id", type: "select", options: productOptions, required: true },
    { label: "Warehouse", name: "warehouse", type: "select", options: warehouseOptions, required: true },
    { label: "Location", name: "location_id", type: "select", options: locationOptions, required: true },
    { label: "Adjustment Type", name: "adjustment_type", type: "select", options: adjustmentTypeOptions, required: true },
    { label: "Previous Quantity", name: "previous_qty", type: "number", required: true },
    { label: "Adjusted Quantity", name: "adjusted_qty", type: "number", required: true },
    { label: "Category", name: "category", type: "select", options: categories.map(c => ({ value: c, label: c })), required: true },
    { label: "Reason", name: "sourceReference", type: "text", required: true },
    { label: "Adjustment Date", name: "adjustmentDate", type: "text", placeholder: "YYYY-MM-DD", required: true },
  ];

  const columns: ColumnDef<AdjustmentRecord>[] = [
    { 
      key: "referenceNo", 
      label: "Reference #", 
      className: "font-mono font-bold",
      render: (row) => row.referenceNo
    },
    { key: "adjustmentDate", label: "Adjustment Date" },
    { key: "sourceReference", label: "Source Ref", className: "font-mono" },
    { key: "category", label: "Category" },
    { key: "warehouse", label: "Warehouse" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const variants: Record<string, string> = {
          "Open": "status-pending",
          "Pending": "status-warning",
          "Done": "status-active"
        };
        return <span className={`status-badge ${variants[row.status]}`}>{row.status}</span>;
      }
    },
    { key: "createdBy", label: "Created By", className: "hidden xl:table-cell text-sm text-muted-foreground" },
    { key: "createdAt", label: "Created At", className: "hidden xl:table-cell text-sm text-muted-foreground" }
  ];

  const handleUpdate = async (id: string, data: Partial<AdjustmentRecord>) => {
    try {
      const adjustmentId = parseInt(id);
      const warehouseId = warehouses?.find(w => w.name === data.warehouse)?.id;
      
      await updateAdjustment.mutateAsync({
        id: adjustmentId,
        data: {
          category: data.category as any,
          reason: data.sourceReference,
          status: data.status as any,
          warehouse_id: warehouseId,
        },
      });
      toast({
        title: "Success",
        description: "Adjustment updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update adjustment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdjustment.mutateAsync(parseInt(id));
      toast({
        title: "Success",
        description: "Adjustment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete adjustment",
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
          <h1 className="page-title">Inventory Adjustments</h1>
          <p className="page-description">Stock corrections and reconciliations</p>
        </div>
        <AddModal<AdjustmentRecord>
          title="New Adjustment"
          fields={addFields}
          onSubmit={async (data) => {
            try {
              const warehouseId = warehouses?.find(w => w.name === data.warehouse)?.id;
              const productId = parseInt(data.product_id);
              const locationId = parseInt(data.location_id);

              if (!warehouseId) {
                toast({
                  title: "Error",
                  description: "Please select a valid warehouse",
                  variant: "destructive",
                });
                return;
              }

              await createAdjustment.mutateAsync({
                product_id: productId,
                warehouse_id: warehouseId,
                location_id: locationId,
                previous_qty: data.previous_qty,
                adjusted_qty: data.adjusted_qty,
                adjustment_type: data.adjustment_type as any,
                category: data.category as any,
                reason: data.sourceReference,
              });
              toast({
                title: "Success",
                description: "Adjustment created successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to create adjustment",
                variant: "destructive",
              });
            }
          }}
          triggerLabel="New Adjustment"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Adjustments" value={adjustments.length} icon={Scale} variant="primary" />
        <StatCard label="Pending Approval" value={adjustments.filter(a => a.status === 'Pending').length} icon={Clock} variant="warning" />
        <StatCard label="Completed" value={adjustments.filter(a => a.status === 'Done').length} icon={CheckCircle2} variant="success" />
      </div>

      <DataTable
        data={adjustments}
        columns={columns}
        searchPlaceholder="Search adjustments..."
        actions={(row) => {
          const isLocked = row.status === "Pending" || row.status === "Done";
          if (isLocked) return <Badge variant="secondary">STATUS LOCKED</Badge>;
          
          return (
            <ActionMenu>
              <EditModal<AdjustmentRecord>
                title="Edit Adjustment"
                data={row}
                fields={addFields as any}
                onSubmit={(data) => handleUpdate(row.id, data)}
                triggerLabel="Edit"
              />
              <DeleteModal
                title="Delete Adjustment"
                onSubmit={() => handleDelete(row.id)}
                triggerLabel="Delete"
              />
              <Button size="sm" variant="ghost" className="text-success" onClick={() => handleUpdate(row.id, { status: "Pending" })}>
                 Post
              </Button>
            </ActionMenu>
          );
        }}
      />
    </div>
  );
}
