import { StatCard } from "@/components/dashboard/StatCard";
import AddModal, { AddField } from "@/components/modals/AddModal";
import DeleteModal from "@/components/modals/DeleteModal";
import EditModal, { EditField } from "@/components/modals/EditModal";
import { ActionMenu } from "@/components/table/ActionMenu";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { toast } from "@/hooks/use-toast";
import { Box, DollarSign, ListFilter, Tag } from "lucide-react";
import type { Product } from "@/types/database";

interface ItemMasterRecord {
  id: string;
  psc: string;
  shortDescription: string;
  barcode: string;
  picklistCode: string;
  productType: string;
  igDescription: string;
  brand: "BW" | "KLIK" | "OMG" | "ORO";
  category: string;
  color: string;
  cost: number;
  srp: number;
}

export default function StockBuffering() {
  const { data: productsData, isLoading } = useProducts(1, 1000);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Map products to component format
  const items: ItemMasterRecord[] = (productsData?.data || []).map((product: Product) => {
    const category = categories?.find(c => c.id === product.category_id);
    
    return {
      id: product.id.toString(),
      psc: product.sku,
      shortDescription: product.name,
      barcode: product.barcode || '',
      picklistCode: product.sku,
      productType: 'Standard',
      igDescription: product.description || '',
      brand: (product.brand as "BW" | "KLIK" | "OMG" | "ORO") || "BW",
      category: category?.name || 'Uncategorized',
      color: 'N/A',
      cost: product.cost_price,
      srp: product.selling_price,
    };
  });

  const fields: (AddField<ItemMasterRecord> | EditField<ItemMasterRecord>)[] = [
    // Basic
    { label: "PSC", name: "psc", type: "text", required: true },
    { label: "Short Description", name: "shortDescription", type: "text", required: true, fullWidth: true },
    { label: "Barcode", name: "barcode", type: "text", required: true },
    { label: "Picklist Code", name: "picklistCode", type: "text", required: true },
    // Types
    { label: "Product Type", name: "productType", type: "text", required: true },
    { label: "IG Description", name: "igDescription", type: "text", fullWidth: true },
    // Class
    { label: "Brand", name: "brand", type: "select", options: ["BW", "KLIK", "OMG", "ORO"].map(b => ({value: b, label: b})), required: true },
    { 
      label: "Category", 
      name: "category", 
      type: "select", 
      options: [
        { value: "Paint", label: "Paint" },
        { value: "Ink", label: "Ink" },
        { value: "Paper", label: "Paper" },
        { value: "Supplies", label: "Supplies" },
        { value: "Chemicals", label: "Chemicals" }
      ],
      required: true 
    },
    { label: "Color", name: "color", type: "text" },
    // Price
    { label: "Cost", name: "cost", type: "number", required: true },
    { label: "SRP", name: "srp", type: "number", required: true },
  ];

  const columns: ColumnDef<ItemMasterRecord>[] = [
    { key: "psc", label: "PSC", className: "font-mono font-bold text-primary" },
    { 
      key: "shortDescription", 
      label: "Description", 
      className: "font-medium",
    },
    { key: "brand", label: "Brand", render: (row) => <Badge variant="outline">{row.brand}</Badge> },
    { key: "category", label: "Category" },
    { key: "size", label: "Size" },
    { key: "color", label: "Color" },
    { 
      key: "srp", 
      label: "SRP", 
      className: "font-bold text-success",
      render: (row) => `₱${row.srp.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { key: "barcode", label: "Barcode", className: "font-mono text-xs text-muted-foreground" }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const categoryOptions = (categories || []).map(c => ({ value: c.name, label: c.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Stock Buffering</h1>
          <p className="page-description">Maintain core product definitions and master data</p>
        </div>
        <AddModal<ItemMasterRecord>
          title="New Item"
          fields={fields as any}
          onSubmit={async (data) => {
            try {
              const category = categories?.find(c => c.name === data.category);
              
              await createProduct.mutateAsync({
                sku: data.psc,
                name: data.shortDescription,
                barcode: data.barcode,
                category_id: category?.id || 1,
                brand: data.brand,
                unit: 'pcs',
                cost_price: data.cost,
                selling_price: data.srp,
                status: 'active',
              });
              toast({
                title: "Success",
                description: "Product created successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to create product",
                variant: "destructive",
              });
            }
          }}
          triggerLabel="Add New Item"
          size="2xl"
          columns={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={items.length} icon={Box} variant="primary" />
        <StatCard label="Active Brands" value={new Set(items.map(i => i.brand)).size} icon={Tag} variant="info" />
        <StatCard label="Avg. Margin" value="45%" icon={DollarSign} variant="success" />
        <StatCard label="Categories" value={new Set(items.map(i => i.category)).size} icon={ListFilter} variant="default" />
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search by PSC, description, or barcode..."
        actions={(row) => (
          <ActionMenu>
            <EditModal<ItemMasterRecord>
              title="Edit Item Master"
              data={row}
              fields={fields as any}
              onSubmit={async (data) => {
                try {
                  const category = categories?.find(c => c.name === data.category);
                  
                  await updateProduct.mutateAsync({
                    id: parseInt(row.id),
                    data: {
                      sku: data.psc,
                      name: data.shortDescription,
                      barcode: data.barcode,
                      category_id: category?.id,
                      brand: data.brand,
                      cost_price: data.cost,
                      selling_price: data.srp,
                    },
                  });
                  toast({
                    title: "Success",
                    description: "Product updated successfully",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to update product",
                    variant: "destructive",
                  });
                }
              }}
              triggerLabel="Edit"
              size="2xl"
              columns={2}
            />
            <DeleteModal
              title="Delete Product"
              onSubmit={async () => {
                try {
                  await deleteProduct.mutateAsync(parseInt(row.id));
                  toast({
                    title: "Success",
                    description: "Product deleted successfully",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to delete product",
                    variant: "destructive",
                  });
                }
              }}
              triggerLabel="Delete"
            />
          </ActionMenu>
        )}
      />
    </div>
  );
}
