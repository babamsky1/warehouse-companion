/**
 * Stock Location Inquiry Page - READ-ONLY
 * 
 * Spec:
 * ✅ READ-ONLY
 * ✅ TWO SCREENS: Warehouse Location List -> Product Stocks per Location
 */

import { StatCard } from "@/components/dashboard/StatCard";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Package, Warehouse } from "lucide-react";
import { useState } from "react";

// Types for Screen 1
interface LocationInfo {
  id: string;
  warehouse: "POS Warehouse" | "TSD / Production" | "Mendez Warehouse" | "Reparo Warehouse";
  section: string;
  location: string;
  description: string;
}

// Types for Screen 2
interface StockDetail {
  id: string;
  locationId: string;
  anNo: string;
  description: string;
  brand: string;
  category: string;
  boxNo: string;
  batchNo: string;
  quantity: number;
}

const locationData: LocationInfo[] = [
  { id: "L1", warehouse: "POS Warehouse", section: "SEC-A", location: "LOC-01", description: "Main Display Shelf" },
  { id: "L2", warehouse: "TSD / Production", section: "RAW-1", location: "ZONE-B", description: "Raw Material Bin" },
  { id: "L3", warehouse: "Mendez Warehouse", section: "BULK", location: "PALLET-05", description: "Bulk Storage Area" },
  { id: "L4", warehouse: "Reparo Warehouse", section: "QC", location: "RACK-12", description: "Repair & QC Rack" },
];

const stockDetails: StockDetail[] = [
  { id: "S1", locationId: "L1", anNo: "AN-1001", description: "Product A", brand: "KLIK", category: "Electronics", boxNo: "BX-99", batchNo: "BT-2024", quantity: 50 },
  { id: "S2", locationId: "L1", anNo: "AN-1002", description: "Product B", brand: "OMG", category: "Hardware", boxNo: "BX-102", batchNo: "BT-2024", quantity: 120 },
  { id: "S3", locationId: "L2", anNo: "AN-2001", description: "Product C", brand: "BW", category: "Paints", boxNo: "BX-55", batchNo: "BT-2023", quantity: 500 },
];

export default function StockLocationInquiry() {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);

  // Screen 1 Columns
  const locationColumns: ColumnDef<LocationInfo>[] = [
    {
      key: "warehouse",
      label: "Warehouse",
      className: "font-semibold",
    },
    {
      key: "section",
      label: "Section",
    },
    {
      key: "location",
      label: "Location",
      className: "font-mono font-bold text-primary",
    },
    {
      key: "description",
      label: "Description",
      className: "text-muted-foreground",
    }
  ];

  // Screen 2 Columns
  const stockColumns: ColumnDef<StockDetail>[] = [
    { key: "anNo", label: "AN #", className: "font-mono font-bold" },
    { key: "description", label: "Description", className: "font-medium" },
    { key: "brand", label: "Brand" },
    { key: "category", label: "Category" },
    { key: "boxNo", label: "Box #" },
    { key: "batchNo", label: "Batch #" },
    { 
      key: "quantity", 
      label: "Quantity", 
      className: "font-bold text-success",
      render: (row) => row.quantity.toLocaleString()
    }
  ];

  const filteredStocks = stockDetails.filter(s => s.locationId === selectedLocation?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Stock Location Inquiry</h1>
          <p className="page-description">
            {selectedLocation 
              ? `Stocks for Location: ${selectedLocation.location} (${selectedLocation.warehouse})` 
              : "Select a warehouse location to view detailed stock levels"}
          </p>
        </div>
        {selectedLocation && (
          <Button variant="outline" onClick={() => setSelectedLocation(null)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Location List
          </Button>
        )}
      </div>

      {!selectedLocation ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Warehouses"
              value={new Set(locationData.map(l => l.warehouse)).size}
              icon={Warehouse}
              variant="primary"
            />
            <StatCard
              label="Total Locations"
              value={locationData.length}
              icon={MapPin}
              variant="info"
            />
            <StatCard
              label="Total Items inventoried"
              value={stockDetails.length}
              icon={Package}
              variant="success"
            />
          </div>

          <DataTable
            data={locationData}
            columns={locationColumns}
            searchPlaceholder="Search by warehouse, section, or location..."
            actions={(row) => (
              <Button size="sm" variant="ghost" className="text-primary font-medium" onClick={() => setSelectedLocation(row)}>
                View Stocks
              </Button>
            )}
          />
        </>
      ) : (
        <DataTable
          data={filteredStocks}
          columns={stockColumns}
          searchPlaceholder="Search items in this location..."
          emptyMessage="No stocks currently recorded in this location."
        />
      )}

      {selectedLocation && (
        <div className="p-4 bg-muted/30 border border-dashed rounded-lg text-xs text-muted-foreground italic text-center">
          Note: Quantities come ONLY from stock movement history and cannot be edited.
        </div>
      )}
    </div>
  );
}
