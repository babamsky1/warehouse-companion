import { StatCard } from "@/components/dashboard/StatCard";
import { ColumnDef, DataTable } from "@/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Package,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { useMemo, useState } from "react";

interface ReportItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  adjustments: number;
  closingStock: number;
  value: number;
}

const reportData: ReportItem[] = [
  { id: "1", sku: "WGT-A123", name: "Widget A-123", category: "Electronics", openingStock: 400, stockIn: 150, stockOut: 100, adjustments: 0, closingStock: 450, value: 4500.0 },
  { id: "2", sku: "CMP-B456", name: "Component B-456", category: "Components", openingStock: 50, stockIn: 100, stockOut: 122, adjustments: 0, closingStock: 28, value: 560.0 },
  { id: "3", sku: "RAW-C789", name: "Raw Material C-789", category: "Raw Materials", openingStock: 1000, stockIn: 500, stockOut: 300, adjustments: -50, closingStock: 1150, value: 11500.0 },
  { id: "4", sku: "ELC-E345", name: "Electronic E-345", category: "Electronics", openingStock: 800, stockIn: 200, stockOut: 144, adjustments: 0, closingStock: 856, value: 8560.0 },
  { id: "5", sku: "MCH-F678", name: "Machine Part F-678", category: "Machinery", openingStock: 200, stockIn: 50, stockOut: 16, adjustments: 0, closingStock: 234, value: 2340.0 },
  { id: "6", sku: "PKG-H234", name: "Packaging H-234", category: "Packaging", openingStock: 1200, stockIn: 800, stockOut: 500, adjustments: 0, closingStock: 1500, value: 3000.0 },
];

const InventoryReport = () => {
  const [reportType, setReportType] = useState("stock-summary");
  const [period, setPeriod] = useState("this-month");
  // const [searchQuery, setSearchQuery] = useState(""); // Managed by DataTable

  // Memoized calculations to prevent expensive operations on every render
  const { totalValue, totalItems, stockInTotal, stockOutTotal } = useMemo(() => {
    return reportData.reduce(
      (acc, item) => ({
        totalValue: acc.totalValue + item.value,
        totalItems: acc.totalItems + item.closingStock,
        stockInTotal: acc.stockInTotal + item.stockIn,
        stockOutTotal: acc.stockOutTotal + item.stockOut,
      }),
      { totalValue: 0, totalItems: 0, stockInTotal: 0, stockOutTotal: 0 }
    );
  }, []); // Empty dependency array since reportData is static

  const columns: ColumnDef<ReportItem>[] = [
    {
      key: "sku",
      label: "SKU",
      className: "font-mono font-medium",
    },
    {
      key: "name",
      label: "Product Name",
      className: "font-medium",
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <Badge variant="outline" className="font-normal">{row.category}</Badge>
      ),
    },
    {
      key: "openingStock",
      label: "Opening",
      className: "text-left",
      render: (row) => row.openingStock.toLocaleString(),
    },
    {
      key: "stockIn",
      label: "Stock In",
      className: "text-left text-success",
      render: (row) => `+${row.stockIn.toLocaleString()}`,
    },
    {
      key: "stockOut",
      label: "Stock Out",
      className: "text-left text-destructive",
      render: (row) => `-${row.stockOut.toLocaleString()}`,
    },
    {
      key: "adjustments",
      label: "Adjustments",
      className: "text-left",
      render: (row) => (
        <span className={row.adjustments < 0 ? "text-destructive" : row.adjustments > 0 ? "text-success" : ""}>
          {row.adjustments !== 0 ? (row.adjustments > 0 ? `+${row.adjustments}` : row.adjustments) : "0"}
        </span>
      ),
    },
    {
      key: "closingStock",
      label: "Closing",
      className: "text-left font-semibold",
      render: (row) => row.closingStock.toLocaleString(),
    },
    {
      key: "value",
      label: "Value",
      className: "text-left font-semibold",
      render: (row) => `$${row.value.toLocaleString()}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Inventory Reports</h1>
          <p className="page-description">Generate and analyze inventory reports</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Items"
          value={totalItems.toLocaleString()}
          icon={Package}
          variant="primary"
        />
        <StatCard
          label="Stock In"
          value={stockInTotal.toLocaleString()}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          label="Stock Out"
          value={stockOutTotal.toLocaleString()}
          icon={TrendingDown}
          variant="warning"
        />
        <StatCard
          label="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={FileText}
          variant="info"
        />
      </div>

      {/* Filters */}
      <div className="content-section">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
             {/* Search handled by DataTable */}
            <div className="flex items-center gap-2">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock-summary">Stock Summary</SelectItem>
                  <SelectItem value="movement">Stock Movement</SelectItem>
                  <SelectItem value="valuation">Inventory Valuation</SelectItem>
                  <SelectItem value="aging">Aging Report</SelectItem>
                </SelectContent>
              </Select>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={reportData}
        columns={columns as ColumnDef<unknown>[]}
        searchPlaceholder="Search by SKU, name, or category..."
      />
    </div>
  );
};

export default InventoryReport;
