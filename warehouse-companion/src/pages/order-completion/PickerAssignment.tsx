import { StatCard } from "@/components/dashboard/StatCard";
import EditModal from "@/components/modals/EditModal";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowButton, WorkflowTransition } from "@/components/workflow/WorkflowButton";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useUsers } from "@/hooks/use-users";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, ClipboardList, UserPlus, Users } from "lucide-react";
import { useMemo, memo } from "react";
import type { Order } from "@/types/database";

interface PickerRecord {
  id: string;
  seriesNo: string;
  poNo: string;
  poBrand: string;
  customerName: string;
  routeCode: string;
  deliverySchedule: string;
  priorityLevel: string;
  status: string;
  totalQty: number;
  assignedStaff: string;
  approvedBy: string;
}

const PickerAssignment = memo(function PickerAssignment() {
  const { data: ordersData, isLoading } = useOrders(1, 1000);
  const { data: users } = useUsers();
  const updateOrder = useUpdateOrder();

  // Memoize staff list to prevent expensive filtering on every render
  const staffList = useMemo(() => {
    return (users || [])
      .filter(user => user.role === 'operator' || user.role === 'warehouse_manager')
      .map(user => ({ value: user.full_name, label: user.full_name }));
  }, [users]);

  // Memoize data mapping to prevent expensive recalculations
  const records = useMemo(() => {
    const allPickers: PickerRecord[] = (ordersData?.data || []).map((order: Order) => ({
      id: order.id.toString(),
      seriesNo: order.order_no.split('-').pop() || '',
      poNo: order.order_no,
      poBrand: 'N/A',
      customerName: (order as any).customer_name || 'N/A',
      routeCode: 'N/A',
      deliverySchedule: order.expected_date ? new Date(order.expected_date).toLocaleDateString() : 'N/A',
      priorityLevel: order.priority === 'urgent' ? 'High' : order.priority === 'high' ? 'High' : 'Normal',
      status: order.status === 'pending' ? 'Assigned' : order.status === 'processing' ? 'Picking' : order.status === 'completed' ? 'Picked' : 'No Assignment',
      totalQty: 0, // TODO: Calculate from order items
      assignedStaff: order.assigned_to ? `User ${order.assigned_to}` : '',
      approvedBy: 'N/A',
    }));

    // Map pickers to include dynamic status: No Assignment if no staff
    return allPickers.map((r) => ({
      ...r,
      status: r.assignedStaff ? r.status || "Assigned" : "No Assignment",
    }));
  }, [ordersData?.data]);

  // Workflow transitions
  const pickerTransitions: WorkflowTransition<PickerRecord["status"]>[] = [
    { from: "Assigned", to: "Picking", label: "Start Picking" },
    { from: "Picking", to: "Picked", label: "Complete Picking" },
  ];

  // Table columns
  const columns: ColumnDef<PickerRecord>[] = [
    { key: "seriesNo", label: "Series #", className: "font-mono font-bold" },
    { key: "poNo", label: "PO #", className: "font-mono" },
    { key: "poBrand", label: "Brand" },
    { key: "customerName", label: "Customer" },
    { key: "routeCode", label: "Route" },
    { key: "deliverySchedule", label: "Schedule" },
    {
      key: "priorityLevel",
      label: "Priority",
      render: (row) => (
        <Badge variant={row.priorityLevel === "High" ? "destructive" : "secondary"}>
          {row.priorityLevel}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const variants: Record<string, string> = {
          "No Assignment": "status-muted",
          Assigned: "status-warning",
          Picking: "status-pending",
          Picked: "status-active",
        };
        return <span className={`status-badge ${variants[row.status]}`}>{row.status}</span>;
      },
    },
    { key: "totalQty", label: "Qty", className: "font-bold" },
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
              // Extract user ID from staff name (simplified - in real app, use user ID)
              const staffId = users?.find(u => u.full_name === data.assignedStaff)?.id;
              
              await updateOrder.mutateAsync({
                id: parseInt(row.id),
                data: {
                  assigned_to: staffId,
                  status: data.assignedStaff ? 'pending' : 'pending' as any,
                },
              });
              toast({
                title: "Success",
                description: "Picker assigned successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to assign picker",
                variant: "destructive",
              });
            }
          }}
          customTrigger={
            <Button
              variant="ghost"
              className="w-full justify-between py-2 px-3 group hover:bg-slate-50 border border-transparent hover:border-slate-200"
            >
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
                  <span className="text-sm italic">Assign Picker</span>
                </div>
              )}
            </Button>
          }
        />
      ),
    },
    { key: "approvedBy", label: "Approved By", className: "text-sm text-muted-foreground" },
  ];

  // Memoize expensive stat calculations
  const { activePickersCount, pendingTasksCount, completedTodayCount } = useMemo(() => {
    return records.reduce(
      (acc, record) => ({
        activePickersCount: acc.activePickersCount + (record.assignedStaff ? 1 : 0),
        pendingTasksCount: acc.pendingTasksCount + ((record.status === 'Assigned' || record.status === 'No Assignment') ? 1 : 0),
        completedTodayCount: acc.completedTodayCount + (record.status === 'Picked' ? 1 : 0),
      }),
      { activePickersCount: 0, pendingTasksCount: 0, completedTodayCount: 0 }
    );
  }, [records]);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Picker Assignment</h1>
          <p className="page-description">Assign and track picking tasks for active orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Pickers" value={activePickersCount} icon={Users} variant="primary" />
        <StatCard label="Pending Tasks" value={pendingTasksCount} icon={ClipboardList} variant="warning" />
        <StatCard label="Completed Today" value={completedTodayCount} icon={CheckCircle2} variant="success" />
      </div>

      {/* Data Table */}
      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search by series, PO, or customer..."
        actions={(row) => (
          <WorkflowButton
            transitions={pickerTransitions}
            currentStatus={row.status}
            isAssigned={!!row.assignedStaff} // disable if no staff
            onTransition={async (nextStatus) => {
              if (!row.assignedStaff) return; // prevent moving if unassigned
              try {
                const statusMap: Record<string, any> = {
                  'Assigned': 'pending',
                  'Picking': 'processing',
                  'Picked': 'completed',
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
});

export default PickerAssignment;
