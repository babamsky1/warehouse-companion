/**
 * Transfers Page - CONDITIONALLY READ-ONLY
 * 
 * Spec:
 * ✅ Read-only when status != Open
 * ✅ Columns: Reference #, Transfer Date, Needed Date, Source Warehouse, Destination Warehouse, Requested By, Status, Updated By, Updated At
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
import { useTransfers, useCreateTransfer, useUpdateTransfer, useDeleteTransfer } from "@/hooks/use-transfers";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useProducts } from "@/hooks/use-products";
import { toast } from "@/hooks/use-toast";
import { ArrowRightLeft, CheckCircle2, Clock } from "lucide-react";
import type { Transfer } from "@/types/database";

interface TransferRecord {
  id: string;
  referenceNo: string;
  transferDate: string;
  neededDate: string;
  sourceWarehouse: string;
  destinationWarehouse: string;
  requestedBy: string;
  status: string;
  updatedBy: string;
  updatedAt: string;
}

export default function Transfers() {
  const { data: transfersData, isLoading } = useTransfers(1, 1000);
  const { data: warehouses } = useWarehouses();
  const createTransfer = useCreateTransfer();
  const updateTransfer = useUpdateTransfer();
  const deleteTransfer = useDeleteTransfer();

  // Map API data to component format
  const records: TransferRecord[] = (transfersData?.data || []).map((transfer: Transfer) => {
    const fromWarehouse = warehouses?.find(w => w.id === transfer.from_warehouse_id);
    const toWarehouse = warehouses?.find(w => w.id === transfer.to_warehouse_id);
    
    return {
      id: transfer.id.toString(),
      referenceNo: transfer.transfer_no,
      transferDate: new Date(transfer.transfer_date).toLocaleDateString(),
      neededDate: new Date(transfer.transfer_date).toLocaleDateString(), // Use transfer_date as needed date
      sourceWarehouse: fromWarehouse?.name || 'Unknown',
      destinationWarehouse: toWarehouse?.name || 'Unknown',
      requestedBy: `User ${transfer.requested_by}`,
      status: transfer.status === 'completed' ? 'Done' : transfer.status === 'in_transit' ? 'In Transit' : transfer.status === 'approved' ? 'For Approval' : 'Open',
      updatedBy: `User ${transfer.updated_by}`,
      updatedAt: new Date(transfer.updated_at).toLocaleString(),
    };
  });

  const warehouseOptions = (warehouses || []).map(w => ({ value: w.name, label: w.name }));

  const addFields: AddField<TransferRecord>[] = [
    { label: "Transfer Date", name: "transferDate", type: "text", placeholder: "YYYY-MM-DD", required: true },
    { label: "Needed Date", name: "neededDate", type: "text", placeholder: "YYYY-MM-DD", required: true },
    { label: "Source Warehouse", name: "sourceWarehouse", type: "select", options: warehouseOptions, required: true },
    { label: "Source Location", name: "fromLocation", type: "text", required: true },
    { label: "Destination Warehouse", name: "destinationWarehouse", type: "select", options: warehouseOptions, required: true },
    { label: "Destination Location", name: "toLocation", type: "text", required: true },
    { label: "Product", name: "productId", type: "text", placeholder: "Product ID", required: true },
    { label: "Quantity", name: "quantity", type: "number", required: true },
  ];

  const columns: ColumnDef<TransferRecord>[] = [
    { 
      key: "referenceNo", 
      label: "Reference #", 
      className: "font-mono font-bold",
    },
    { key: "transferDate", label: "Date" },
    { key: "neededDate", label: "Needed" },
    { key: "sourceWarehouse", label: "Source" },
    { key: "destinationWarehouse", label: "Destination" },
    { key: "requestedBy", label: "Requested By" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const variants: Record<string, string> = {
          "Open": "status-pending",
          "For Approval": "status-warning",
          "In Transit": "status-warning",
          "Done": "status-active",
          "Cancelled": "status-error"
        };
        return <span className={`status-badge ${variants[row.status] || 'status-pending'}`}>{row.status}</span>;
      }
    },
    { key: "updatedAt", label: "Last Updated", className: "hidden xl:table-cell text-sm text-muted-foreground" }
  ];

  const handleUpdate = async (id: string, data: Partial<TransferRecord>) => {
    try {
      const transferId = parseInt(id);
      const sourceWarehouse = warehouses?.find(w => w.name === data.sourceWarehouse);
      const destWarehouse = warehouses?.find(w => w.name === data.destinationWarehouse);
      
      await updateTransfer.mutateAsync({
        id: transferId,
        data: {
          status: data.status as any,
          transfer_date: data.transferDate,
        },
      });
      toast({
        title: "Success",
        description: "Transfer updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transfer",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransfer.mutateAsync(parseInt(id));
      toast({
        title: "Success",
        description: "Transfer deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transfer",
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
          <h1 className="page-title">Transfers</h1>
          <p className="page-description">Stock movement between warehouse locations</p>
        </div>
        <AddModal<TransferRecord>
          title="New Transfer"
          fields={addFields}
          onSubmit={async (data) => {
            try {
              const sourceWarehouse = warehouses?.find(w => w.name === data.sourceWarehouse);
              const destWarehouse = warehouses?.find(w => w.name === data.destinationWarehouse);
              
              if (!sourceWarehouse || !destWarehouse) {
                toast({
                  title: "Error",
                  description: "Please select valid warehouses",
                  variant: "destructive",
                });
                return;
              }

              await createTransfer.mutateAsync({
                product_id: parseInt((data as any).productId),
                from_warehouse_id: sourceWarehouse.id,
                to_warehouse_id: destWarehouse.id,
                from_location_id: parseInt((data as any).fromLocation),
                to_location_id: parseInt((data as any).toLocation),
                quantity: parseInt((data as any).quantity) || 0,
                transfer_date: data.transferDate,
                status: 'requested',
              });
              toast({
                title: "Success",
                description: "Transfer created successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to create transfer",
                variant: "destructive",
              });
            }
          }}
          triggerLabel="New Transfer"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Transfers" value={records.length} icon={ArrowRightLeft} variant="primary" />
        <StatCard label="Active" value={records.filter(r => r.status !== 'Done' && r.status !== 'Cancelled').length} icon={Clock} variant="warning" />
        <StatCard label="Completed" value={records.filter(r => r.status === 'Done').length} icon={CheckCircle2} variant="success" />
      </div>

      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search transfers..."
        actions={(row) => {
          const isLocked = row.status !== "Open";
          if (isLocked) return <Badge variant="secondary">LOCKED</Badge>;

          return (
            <ActionMenu>
              <EditModal<TransferRecord>
                title="Edit Transfer"
                data={row}
                fields={addFields as any}
                onSubmit={(data) => handleUpdate(row.id, data)}
                triggerLabel="Edit"
              />
              <DeleteModal
                title="Delete Transfer"
                onSubmit={() => handleDelete(row.id)}
                triggerLabel="Delete"
              />
              <Button size="sm" variant="ghost" className="text-success" onClick={() => handleUpdate(row.id, { status: "For Approval" })}>
                 Send for Approval
              </Button>
            </ActionMenu>
          );
        }}
      />
    </div>
  );
}
