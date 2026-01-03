import { StatCard } from "@/components/dashboard/StatCard";
import EditModal from "@/components/modals/EditModal";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowButton, WorkflowTransition } from "@/components/workflow/WorkflowButton";
import { TransferAssignmentRecord } from "@/context/WmsContext";
import { useTransfers, useUpdateTransfer } from "@/hooks/use-transfers";
import { useUsers } from "@/hooks/use-users";
import { useWarehouses } from "@/hooks/use-warehouses";
import { toast } from "@/hooks/use-toast";
import { ArrowLeftRight, ClipboardList, Truck, UserPlus } from "lucide-react";
import type { Transfer } from "@/types/database";

export default function TransferAssignment() {
  const { data: transfersData, isLoading } = useTransfers(1, 1000);
  const { data: users } = useUsers();
  const updateTransfer = useUpdateTransfer();

  const { data: warehouses } = useWarehouses();

  // Get staff list from users API
  const staffList = (users || [])
    .filter(user => user.role === 'operator' || user.role === 'warehouse_manager')
    .map(user => ({ value: user.full_name, label: user.full_name }));

  // Map transfers to assignment format
  const records: TransferAssignmentRecord[] = (transfersData?.data || []).map((transfer: Transfer) => {
    const fromWarehouse = warehouses?.find(w => w.id === transfer.from_warehouse_id);
    const toWarehouse = warehouses?.find(w => w.id === transfer.to_warehouse_id);
    
    return {
      id: transfer.id.toString(),
      transferId: transfer.transfer_no,
      fromWarehouse: fromWarehouse?.name || 'Unknown',
      toWarehouse: toWarehouse?.name || 'Unknown',
      driverName: transfer.transferred_by ? `User ${transfer.transferred_by}` : 'N/A',
      assignedStaff: transfer.transferred_by ? `User ${transfer.transferred_by}` : '',
      status: transfer.status === 'completed' ? 'Delivered' : transfer.status === 'in_transit' ? 'On Delivery' : 'Assigned' as any,
    };
  });

  const transferTransitions: WorkflowTransition<TransferAssignmentRecord["status"]>[] = [
    { from: "Assigned", to: "On Delivery", label: "Start Delivery" },
    { from: "On Delivery", to: "Delivered", label: "Complete Delivery" },
  ];

  const columns: ColumnDef<TransferAssignmentRecord>[] = [
    { key: "transferId", label: "Transfer ID", className: "font-mono font-bold" },
    { key: "fromWarehouse", label: "From", className: "font-medium" },
    { key: "toWarehouse", label: "To", className: "font-medium" },
    { key: "driverName", label: "Driver" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const effectiveStatus = row.assignedStaff ? row.status : "No Assignment";
        const variants: Record<string, string> = {
          "No Assignment": "status-muted",
          Assigned: "status-warning",
          "On Delivery": "status-pending",
          Delivered: "status-active",
        };
        return <span className={`status-badge ${variants[effectiveStatus]}`}>{effectiveStatus}</span>;
      },
    },
    {
      key: "assignedStaff",
      label: "Assigned Staff",
      render: (row) => (
        <EditModal
          title="Assign Staff"
          description="Select a staff member for this task"
          data={row}
          fields={[{ name: "assignedStaff", label: "Staff Member", type: "select", options: staffList }]}
          onSubmit={async (data) => {
            try {
              const staffId = users?.find(u => u.full_name === data.assignedStaff)?.id;
              await updateTransfer.mutateAsync({
                id: parseInt(row.id),
                data: {
                  transferred_by: staffId,
                },
              });
              toast({
                title: "Success",
                description: "Driver assigned successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to assign driver",
                variant: "destructive",
              });
            }
          }}
          customTrigger={
            <Button variant="ghost" className="w-full justify-between py-2 px-3 group hover:bg-slate-50 border border-transparent hover:border-slate-200">
              {row.assignedStaff ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                    {row.assignedStaff.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="text-sm font-medium">{row.assignedStaff}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-sm italic">Assign Driver</span>
                </div>
              )}
            </Button>
          }
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Transfer Assignment</h1>
          <p className="page-description">Assign and manage inter-warehouse stock transfer tasks</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active Drivers" value={records.filter(r => r.assignedStaff).length} icon={Truck} variant="primary" />
          <StatCard label="Pending Transfers" value={records.filter((r) => r.status === "Assigned").length} icon={ClipboardList} variant="warning" />
          <StatCard label="Completed Today" value={records.filter((r) => r.status === "Delivered").length} icon={ArrowLeftRight} variant="success" />
        </div>
      )}

      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search transfers..."
        actions={(row) => (
          <WorkflowButton
            transitions={transferTransitions}
            currentStatus={row.assignedStaff ? row.status : "Assigned"}
            isAssigned={!!row.assignedStaff}
            onTransition={async (nextStatus) => {
              try {
                const statusMap: Record<string, any> = {
                  'Assigned': 'approved',
                  'On Delivery': 'in_transit',
                  'Delivered': 'completed',
                };
                await updateTransfer.mutateAsync({
                  id: parseInt(row.id),
                  data: {
                    status: statusMap[nextStatus] || 'approved',
                  },
                });
                toast({
                  title: "Success",
                  description: "Status updated successfully",
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to update status",
                  variant: "destructive",
                });
              }
            }}
          />
        )}
      />
    </div>
  );
}
