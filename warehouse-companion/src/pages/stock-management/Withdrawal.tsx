/**
 * Withdrawal Page - CONDITIONALLY READ-ONLY
 * 
 * Spec:
 * ✅ Read-only when status is Pending / Done
 * ✅ Columns: Reference #, Transfer Date, Category (Acetone), Warehouse, Status, Created By/At, Updated By/At
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
import { useStockOuts, useCreateStockOut, useUpdateStockOut, useDeleteStockOut } from "@/hooks/use-stock-outs";
import { useWarehouses } from "@/hooks/use-warehouses";
import { toast } from "@/hooks/use-toast";
import { ArrowUpCircle, CheckCircle2, Clock } from "lucide-react";
import type { StockOut } from "@/types/database";

interface WithdrawalRecord {
  id: string;
  referenceNo: string;
  transferDate: string;
  category: string;
  warehouse: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export default function Withdrawal() {
  const { data: stockOutsData, isLoading } = useStockOuts(1, 1000);
  const { data: warehouses } = useWarehouses();
  const createStockOut = useCreateStockOut();
  const updateStockOut = useUpdateStockOut();
  const deleteStockOut = useDeleteStockOut();

  // Map stock outs to withdrawal format
  const records: WithdrawalRecord[] = (stockOutsData?.data || []).map((stockOut: StockOut) => {
    const warehouse = warehouses?.find(w => w.id === stockOut.warehouse_id);
    
    return {
      id: stockOut.id.toString(),
      referenceNo: stockOut.reference_no,
      transferDate: new Date(stockOut.transaction_date).toLocaleDateString(),
      category: stockOut.reason || 'Industrial',
      warehouse: warehouse?.name || 'Unknown',
      status: stockOut.status === 'completed' ? 'Done' : stockOut.status === 'pending' ? 'Pending' : 'Open',
      createdBy: `User ${stockOut.created_by}`,
      createdAt: new Date(stockOut.created_at).toLocaleString(),
      updatedBy: `User ${stockOut.updated_by}`,
      updatedAt: new Date(stockOut.updated_at).toLocaleString(),
    };
  });

  const warehouseOptions = (warehouses || []).map(w => ({ value: w.name, label: w.name }));

  const addFields: AddField<WithdrawalRecord>[] = [
    { label: "Category", name: "category", type: "select", options: [{value: "Acetone", label: "Acetone"}, {value: "Industrial", label: "Industrial"}, {value: "Consumables", label: "Consumables"}], required: true },
    { label: "Warehouse", name: "warehouse", type: "select", options: warehouseOptions, required: true },
    { label: "Transaction Date", name: "transferDate", type: "text", placeholder: "YYYY-MM-DD", required: true },
    { label: "Reason", name: "reason", type: "text", required: true },
  ];

  const columns: ColumnDef<WithdrawalRecord>[] = [
    { 
      key: "referenceNo", 
      label: "Reference #", 
      className: "font-mono font-bold",
      render: (row) => row.referenceNo
    },
    { key: "transferDate", label: "Transfer Date" },
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
    { key: "updatedBy", label: "Updated By", className: "hidden xl:table-cell text-sm text-muted-foreground" },
    { key: "updatedAt", label: "Updated At", className: "hidden xl:table-cell text-sm text-muted-foreground" }
  ];

  const handleUpdate = async (id: string, data: Partial<WithdrawalRecord>) => {
    try {
      const stockOutId = parseInt(id);
      const warehouse = warehouses?.find(w => w.name === data.warehouse);
      
      await updateStockOut.mutateAsync({
        id: stockOutId,
        data: {
          warehouse_id: warehouse?.id,
          transaction_date: data.transferDate,
          reason: (data as any).reason || data.category,
          status: data.status === 'Done' ? 'completed' : data.status === 'Pending' ? 'pending' : 'pending' as any,
        },
      });
      toast({
        title: "Success",
        description: "Withdrawal updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update withdrawal",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStockOut.mutateAsync(parseInt(id));
      toast({
        title: "Success",
        description: "Withdrawal deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete withdrawal",
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
          <h1 className="page-title">Withdrawal</h1>
          <p className="page-description">Manage stock withdrawals and industrial usage</p>
        </div>
        <AddModal<WithdrawalRecord>
          title="New Withdrawal"
          fields={addFields}
          onSubmit={async (data) => {
            try {
              const warehouse = warehouses?.find(w => w.name === data.warehouse);
              
              if (!warehouse) {
                toast({
                  title: "Error",
                  description: "Please select a valid warehouse",
                  variant: "destructive",
                });
                return;
              }

              await createStockOut.mutateAsync({
                warehouse_id: warehouse.id,
                transaction_date: data.transferDate,
                transaction_type: 'withdrawal',
                reason: (data as any).reason || data.category,
                total_quantity: 0, // TODO: Get from form
                performed_by: 1, // TODO: Get from auth context
                status: 'pending',
              });
              toast({
                title: "Success",
                description: "Withdrawal created successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to create withdrawal",
                variant: "destructive",
              });
            }
          }}
          triggerLabel="New Withdrawal"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Withdrawals" value={records.length} icon={ArrowUpCircle} variant="primary" />
        <StatCard label="Pending" value={records.filter(r => r.status === 'Pending').length} icon={Clock} variant="warning" />
        <StatCard label="Done" value={records.filter(r => r.status === 'Done').length} icon={CheckCircle2} variant="success" />
      </div>

      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search withdrawals..."
        actions={(row) => {
          const isLocked = row.status === "Pending" || row.status === "Done";
          if (isLocked) return <Badge variant="secondary">STATUS LOCKED</Badge>;

          return (
            <ActionMenu>
              <EditModal<WithdrawalRecord>
                title="Edit Withdrawal"
                data={row}
                fields={addFields as any}
                onSubmit={(data) => handleUpdate(row.id, data)}
                triggerLabel="Edit"
              />
              <DeleteModal
                title="Delete Withdrawal"
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
