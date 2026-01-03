import { StatCard } from "@/components/dashboard/StatCard";
import EditModal from "@/components/modals/EditModal";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowButton, WorkflowTransition } from "@/components/workflow/WorkflowButton";
import { CheckerRecord } from "@/context/WmsContext";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useUsers } from "@/hooks/use-users";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, ClipboardList, ShieldCheck, UserPlus } from "lucide-react";
import type { Order } from "@/types/database";

export default function CheckerAssignment() {
  const { data: ordersData, isLoading } = useOrders(1, 1000);
  const { data: users } = useUsers();
  const updateOrder = useUpdateOrder();

  // Get staff list from users API
  const staffList = (users || [])
    .filter(user => user.role === 'operator' || user.role === 'warehouse_manager')
    .map(user => ({ value: user.full_name, label: user.full_name }));

  // Map orders to checker format
  const records: CheckerRecord[] = (ordersData?.data || []).map((order: Order) => ({
    id: order.id.toString(),
    seriesNo: order.order_no.split('-').pop() || '',
    poNo: order.order_no,
    customerName: (order as any).customer_name || 'N/A',
    status: order.status === 'completed' ? 'Checked' : order.status === 'processing' ? 'Checking' : 'Pending' as any,
    assignedStaff: order.assigned_to ? `User ${order.assigned_to}` : '',
    lastVerified: order.status === 'completed' ? new Date(order.updated_at).toLocaleString() : undefined,
  }));

  const checkerTransitions: WorkflowTransition<CheckerRecord["status"]>[] = [
    { from: "Pending", to: "Checking", label: "Start Checking" },
    { from: "Checking", to: "Checked", label: "Complete Checking" },
  ];

  const columns: ColumnDef<CheckerRecord>[] = [
    { key: "seriesNo", label: "Series #", className: "font-mono font-bold" },
    { key: "poNo", label: "PO #", className: "font-mono" },
    { key: "customerName", label: "Customer", className: "font-medium" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const effectiveStatus = row.assignedStaff ? row.status : "No Assignment";
        const variants: Record<string, string> = {
          "No Assignment": "status-muted",
          Pending: "status-warning",
          Checking: "status-pending",
          Checked: "status-active",
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
              await updateOrder.mutateAsync({
                id: parseInt(row.id),
                data: {
                  assigned_to: staffId,
                },
              });
              toast({
                title: "Success",
                description: "Checker assigned successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to assign checker",
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
                  <span className="text-sm italic">Assign Checker</span>
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
          <h1 className="page-title">Checker Assignment</h1>
          <p className="page-description">Final quality and quantity verification before dispatch</p>
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
          <StatCard label="Active Checkers" value={records.filter(r => r.assignedStaff).length} icon={ShieldCheck} variant="primary" />
          <StatCard label="Pending Verify" value={records.filter((d) => d.status === "Pending").length} icon={ClipboardList} variant="warning" />
          <StatCard label="Total Checked" value={records.filter((d) => d.status === "Checked").length} icon={CheckCircle2} variant="success" />
        </div>
      )}

      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search assignments..."
        actions={(row) => (
          <WorkflowButton
            transitions={checkerTransitions}
            currentStatus={row.assignedStaff ? row.status : "Pending"}
            isAssigned={!!row.assignedStaff}
            onTransition={async (nextStatus) => {
              try {
                const statusMap: Record<string, any> = {
                  'Pending': 'pending',
                  'Checking': 'processing',
                  'Checked': 'completed',
                };
                await updateOrder.mutateAsync({
                  id: parseInt(row.id),
                  data: {
                    status: statusMap[nextStatus] || 'pending',
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
