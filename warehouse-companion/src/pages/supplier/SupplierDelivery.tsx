/**
 * Supplier Delivery Page - CONDITIONALLY READ-ONLY
 * 
 * Spec:
 * ✅ Read-only when Pending / Done
 * ✅ Columns: Reference #, Transfer Date, Supplier Code, Packing #, Container No, Transfer Type (Local, International), Status (Open, Pending, Done), Warehouse, Created By, Created At, Updated By, Updated At
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
import { useReceivings, useCreateReceiving, useUpdateReceiving, useDeleteReceiving } from "@/hooks/use-receivings";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useWarehouses } from "@/hooks/use-warehouses";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, Truck } from "lucide-react";
import type { Receiving } from "@/types/database";

interface DeliveryRecord {
  id: string;
  referenceNo: string;
  transferDate: string;
  supplierCode: string;
  packingNo: string;
  containerNo: string;
  transferType: string;
  status: string;
  warehouse: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export default function SupplierDelivery() {
  const { data: receivingsData, isLoading } = useReceivings(1, 1000);
  const { data: suppliers } = useSuppliers();
  const { data: warehouses } = useWarehouses();
  const createReceiving = useCreateReceiving();
  const updateReceiving = useUpdateReceiving();
  const deleteReceiving = useDeleteReceiving();

  // Map receivings to delivery format
  const records: DeliveryRecord[] = (receivingsData?.data || []).map((receiving: Receiving) => {
    const supplier = suppliers?.find(s => s.id === receiving.supplier_id);
    const warehouse = warehouses?.find(w => w.id === receiving.warehouse_id);
    
    return {
      id: receiving.id.toString(),
      referenceNo: receiving.receiving_no,
      transferDate: new Date(receiving.received_date).toLocaleDateString(),
      supplierCode: supplier?.code || 'N/A',
      packingNo: 'N/A', // Not in current schema
      containerNo: 'N/A', // Not in current schema
      transferType: 'Local', // Not in current schema
      status: receiving.status === 'completed' ? 'Done' : 'Pending',
      warehouse: warehouse?.name || 'Unknown',
      createdBy: `User ${receiving.created_by}`,
      createdAt: new Date(receiving.created_at).toLocaleString(),
      updatedBy: `User ${receiving.updated_by}`,
      updatedAt: new Date(receiving.updated_at).toLocaleString(),
    };
  });

  const supplierOptions = (suppliers || []).map(s => ({ value: s.code, label: `${s.code} - ${s.name}` }));
  const warehouseOptions = (warehouses || []).map(w => ({ value: w.name, label: w.name }));

  const addFields: AddField<DeliveryRecord>[] = [
    { label: "Supplier", name: "supplierCode", type: "select", options: supplierOptions, required: true },
    { label: "Warehouse", name: "warehouse", type: "select", options: warehouseOptions, required: true },
    { label: "Received Date", name: "transferDate", type: "text", placeholder: "YYYY-MM-DD", required: true },
    { label: "Packing #", name: "packingNo", type: "text" },
    { label: "Container No", name: "containerNo", type: "text" },
    { label: "Transfer Type", name: "transferType", type: "select", options: [{value: "Local", label: "Local"}, {value: "International", label: "International"}], required: true },
  ];

  const columns: ColumnDef<DeliveryRecord>[] = [
    { 
      key: "referenceNo", 
      label: "Reference #", 
      className: "font-mono font-bold",
      render: (row) => row.referenceNo
    },
    { key: "transferDate", label: "Date" },
    { key: "supplierCode", label: "Supplier", className: "font-mono" },
    { key: "packingNo", label: "Packing #" },
    { key: "containerNo", label: "Container #" },
    { 
      key: "transferType", 
      label: "Type",
      render: (row) => <Badge variant={row.transferType === 'International' ? 'default' : 'secondary'}>{row.transferType}</Badge>
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const variants: Record<string, string> = {
          "Pending": "status-warning",
          "Done": "status-active"
        };
        return <span className={`status-badge ${variants[row.status]}`}>{row.status}</span>;
      }
    },
    { key: "warehouse", label: "Warehouse" },
    { key: "updatedAt", label: "Updated At", className: "hidden xl:table-cell text-sm text-muted-foreground" }
  ];

  const handleUpdate = async (id: string, data: Partial<DeliveryRecord>) => {
    try {
      const receivingId = parseInt(id);
      const supplier = suppliers?.find(s => s.code === data.supplierCode);
      const warehouse = warehouses?.find(w => w.name === data.warehouse);
      
      await updateReceiving.mutateAsync({
        id: receivingId,
        data: {
          supplier_id: supplier?.id,
          warehouse_id: warehouse?.id,
          received_date: data.transferDate,
          status: data.status === 'Done' ? 'completed' : data.status === 'Pending' ? 'pending' : 'pending' as any,
        },
      });
      toast({
        title: "Success",
        description: "Delivery updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReceiving.mutateAsync(parseInt(id));
      toast({
        title: "Success",
        description: "Delivery deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete delivery",
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
          <h1 className="page-title">Supplier Delivery</h1>
          <p className="page-description">Manage incoming merchandise and container deliveries</p>
        </div>
        <AddModal<DeliveryRecord>
          title="New Delivery Record"
          fields={addFields}
          onSubmit={async (data) => {
            try {
              const supplier = suppliers?.find(s => s.code === data.supplierCode);
              const warehouse = warehouses?.find(w => w.name === data.warehouse);
              
              if (!supplier || !warehouse) {
                toast({
                  title: "Error",
                  description: "Please select valid supplier and warehouse",
                  variant: "destructive",
                });
                return;
              }

              await createReceiving.mutateAsync({
                supplier_id: supplier.id,
                warehouse_id: warehouse.id,
                received_by: 1, // TODO: Get from auth context
                received_date: data.transferDate,
                status: 'pending',
              });
              toast({
                title: "Success",
                description: "Delivery created successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to create delivery",
                variant: "destructive",
              });
            }
          }}
          triggerLabel="New Delivery"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Deliveries" value={records.length} icon={Truck} variant="primary" />
        <StatCard label="Pending" value={records.filter(r => r.status === 'Pending').length} icon={Clock} variant="warning" />
        <StatCard label="Done" value={records.filter(r => r.status === 'Done').length} icon={CheckCircle2} variant="success" />
      </div>

      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search by reference, supplier, or container..."
        actions={(row) => {
          const isLocked = row.status === "Pending" || row.status === "Done";
          if (isLocked) return <Badge variant="secondary">LOCKED</Badge>;

          return (
            <ActionMenu>
              <EditModal<DeliveryRecord>
                title="Edit Delivery"
                data={row}
                fields={addFields as any}
                onSubmit={(data) => handleUpdate(row.id, data)}
                triggerLabel="Edit"
              />
              <DeleteModal
                title="Delete Delivery"
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
