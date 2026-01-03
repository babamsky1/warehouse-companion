import { StatCard } from "@/components/dashboard/StatCard";
import EditModal from "@/components/modals/EditModal";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowButton, WorkflowTransition } from "@/components/workflow/WorkflowButton";
import { BarcoderRecord } from "@/context/WmsContext";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useUsers } from "@/hooks/use-users";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, ClipboardList, QrCode, UserPlus } from "lucide-react";
import type { Order } from "@/types/database";

export default function BarcoderAssignment() {
  const { data: ordersData, isLoading } = useOrders(1, 1000);
  const { data: users } = useUsers();
  const updateOrder = useUpdateOrder();

  // Get staff list from users API
  const staffList = (users || [])
    .filter(user => user.role === 'operator' || user.role === 'warehouse_manager')
    .map(user => ({ value: user.full_name, label: user.full_name }));

  // Map orders to barcoder format
  const records: BarcoderRecord[] = (ordersData?.data || []).map((order: Order) => ({
    id: order.id.toString(),
    seriesNo: order.order_no.split('-').pop() || '',
    poNo: order.order_no,
    poBrand: 'N/A',
    customerName: (order as any).customer_name || 'N/A',
    routeCode: 'N/A',
    barcoderName: order.assigned_to ? `User ${order.assigned_to}` : '',
    deliverySchedule: order.expected_date ? new Date(order.expected_date).toLocaleDateString() : 'N/A',
    dateApproved: new Date(order.created_at).toLocaleDateString(),
    approvedTime: new Date(order.created_at).toLocaleTimeString(),
    priorityLevel: order.priority === 'urgent' ? 'High' : order.priority === 'high' ? 'High' : 'Medium' as any,
    transferType: 'Standard',
    approvedBy: `User ${order.created_by}`,
    receivedBy: 'N/A',
    status: order.status === 'completed' ? 'Scanned' : order.status === 'processing' ? 'Scanning' : 'Pending' as any,
    assignedStaff: order.assigned_to ? `User ${order.assigned_to}` : '',
  }));

  const barcoderTransitions: WorkflowTransition<BarcoderRecord["status"]>[] = [
    { from: "Pending", to: "Scanning", label: "Start Scanning" },
    { from: "Scanning", to: "Scanned", label: "Complete Scanning" },
  ];

  const columns: ColumnDef<BarcoderRecord>[] = [
    { key: "seriesNo", label: "Series #", className: "font-mono font-bold" },
    { key: "poNo", label: "PO #", className: "font-mono" },
    { key: "poBrand", label: "Brand" },
    { key: "customerName", label: "Customer" },
    { key: "deliverySchedule", label: "Schedule" },
    {
      key: "priorityLevel",
      label: "Priority",
      render: (row) => <Badge variant={row.priorityLevel === "High" ? "destructive" : "secondary"}>{row.priorityLevel}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const effectiveStatus = row.assignedStaff ? row.status : "No Assignment";
        const variants: Record<string, string> = {
          "No Assignment": "status-muted",
          Pending: "status-warning",
          Scanning: "status-pending",
          Scanned: "status-active",
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
                description: "Barcoder assigned successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to assign barcoder",
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
                  <span className="text-sm italic">Assign Barcoder</span>
                </div>
              )}
            </Button>
          }
        />
      ),
    },
    { key: "approvedBy", label: "Approved By", className: "text-sm text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Barcoder Assignment</h1>
          <p className="page-description">Assign and manage barcode verification tasks</p>
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
          <StatCard label="Active Barcoders" value={records.filter(r => r.assignedStaff).length} icon={QrCode} variant="primary" />
          <StatCard label="Pending Qty" value={records.filter(r => r.status === 'Pending').length} icon={ClipboardList} variant="warning" />
          <StatCard label="Verified Today" value={records.filter(r => r.status === 'Scanned').length} icon={CheckCircle2} variant="success" />
        </div>
      )}

      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search by series, PO, or customer..."
        actions={(row) => (
          <WorkflowButton
            transitions={barcoderTransitions}
            currentStatus={row.assignedStaff ? row.status : "Pending"} // only allow if assigned
            isAssigned={!!row.assignedStaff}
            onTransition={async (nextStatus) => {
              try {
                const statusMap: Record<string, any> = {
                  'Pending': 'pending',
                  'Scanning': 'processing',
                  'Scanned': 'completed',
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
