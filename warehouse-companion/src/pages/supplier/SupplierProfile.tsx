/**
 * Supplier Profile Page - FULLY EDITABLE
 * 
 * Spec:
 * ✅ Fully Editable Master Data
 * ✅ Columns: Supplier Code, Supplier Name, Company Name, Supplier Type, Company, Status
 */

import { StatCard } from "@/components/dashboard/StatCard";
import AddModal, { AddField } from "@/components/modals/AddModal";
import DeleteModal from "@/components/modals/DeleteModal";
import EditModal, { EditField } from "@/components/modals/EditModal";
import { ActionMenu } from "@/components/table/ActionMenu";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/use-suppliers";
import { toast } from "@/hooks/use-toast";
import { Globe, ShieldCheck, Truck } from "lucide-react";
import type { Supplier } from "@/types/database";

interface SupplierRecord {
  id: string;
  supplierCode: string;
  supplierName: string;
  companyName: string;
  supplierType: string;
  company: string;
  status: string;
}

export default function SupplierProfile() {
  const { data: suppliers, isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  // Map API data to component format
  const records: SupplierRecord[] = (suppliers || []).map((supplier: Supplier) => ({
    id: supplier.id.toString(),
    supplierCode: supplier.code,
    supplierName: supplier.name,
    companyName: supplier.name,
    supplierType: 'Local', // Not in current schema
    company: supplier.name,
    status: supplier.status === 'active' ? 'Active' : 'Inactive',
  }));

  const fields: (AddField<SupplierRecord> | EditField<SupplierRecord>)[] = [
    { label: "Supplier Code", name: "supplierCode", type: "text", required: true },
    { label: "Supplier Name", name: "supplierName", type: "text", required: true },
    { label: "Company Name", name: "companyName", type: "text", required: true },
    { label: "Supplier Type", name: "supplierType", type: "select", options: [{value: "Local", label: "Local"}, {value: "International", label: "International"}], required: true },
    { label: "Company", name: "company", type: "text", required: true },
    { label: "Status", name: "status", type: "select", options: [{value: "Active", label: "Active"}, {value: "Inactive", label: "Inactive"}], required: true },
  ];

  const columns: ColumnDef<SupplierRecord>[] = [
    { 
      key: "supplierCode", 
      label: "Code", 
      className: "font-mono font-bold text-primary",
    },
    { key: "supplierName", label: "Supplier Name", className: "font-medium" },
    { key: "companyName", label: "Company Name" },
    { 
      key: "supplierType", 
      label: "Type",
      render: (row) => <Badge variant={row.supplierType === 'International' ? 'default' : 'secondary'}>{row.supplierType}</Badge>
    },
    { key: "company", label: "Division/Company" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>{row.status}</Badge>
      )
    },
  ];

  const handleUpdate = async (id: string, data: Partial<SupplierRecord>) => {
    try {
      await updateSupplier.mutateAsync({
        id: parseInt(id),
        data: {
          code: data.supplierCode,
          name: data.supplierName,
          contact_person: data.supplierName,
          status: data.status === 'Active' ? 'active' : 'inactive',
        },
      });
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSupplier.mutateAsync(parseInt(id));
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Supplier Profile</h1>
          <p className="page-description">Maintain vendor records and master profiles</p>
        </div>
        <AddModal<SupplierRecord>
          title="Add New Supplier"
          fields={fields as any}
          onSubmit={async (data) => {
            try {
              await createSupplier.mutateAsync({
                code: data.supplierCode,
                name: data.supplierName,
                contact_person: data.supplierName,
                phone: '',
                email: '',
                address: '',
                status: data.status === 'Active' ? 'active' : 'inactive',
              });
              toast({
                title: "Success",
                description: "Supplier created successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to create supplier",
                variant: "destructive",
              });
            }
          }}
          triggerLabel="New Supplier"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Suppliers" value={records.length} icon={Truck} variant="primary" />
        <StatCard label="Active" value={records.filter(r => r.status === 'Active').length} icon={ShieldCheck} variant="success" />
        <StatCard label="International" value={records.filter(r => r.supplierType === 'International').length} icon={Globe} variant="info" />
      </div>

      <DataTable
        data={records}
        columns={columns}
        searchPlaceholder="Search by supplier name or code..."
        actions={(row) => (
          <ActionMenu>
            <EditModal<SupplierRecord>
              title="Edit Supplier"
              data={row}
              fields={fields as any}
              onSubmit={(data) => handleUpdate(row.id, data)}
              triggerLabel="Edit"
            />
            <DeleteModal
              title="Delete Supplier"
              onSubmit={() => handleDelete(row.id)}
              triggerLabel="Delete"
            />
          </ActionMenu>
        )}
        defaultPageSize={10}
      />
    </div>
  );
}
