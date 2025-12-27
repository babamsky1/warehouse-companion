import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronRight,
  CircleAlert,
  Filter,
  MapPin,
  Package,
  PieChart,
  Search,
  TrendingDown,
  Warehouse
} from "lucide-react";
import { useState } from "react";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  warehouse: string;
  location: string;
  quantity: number;
  capacity: number;
  unit: string;
  lastUpdated: string;
}

const inventoryItems: InventoryItem[] = [
  {
    id: "1",
    sku: "WGT-A123",
    name: "Widget A-123",
    warehouse: "Main Warehouse",
    location: "A-01-02-03",
    quantity: 250,
    capacity: 500,
    unit: "pcs",
    lastUpdated: "2024-01-15 14:30",
  },
  {
    id: "2",
    sku: "WGT-A123",
    name: "Widget A-123",
    warehouse: "Main Warehouse",
    location: "A-01-02-04",
    quantity: 200,
    capacity: 500,
    unit: "pcs",
    lastUpdated: "2024-01-15 14:30",
  },
  {
    id: "3",
    sku: "CMP-B456",
    name: "Component B-456",
    warehouse: "Main Warehouse",
    location: "B-02-01-01",
    quantity: 28,
    capacity: 100,
    unit: "pcs",
    lastUpdated: "2024-01-15 10:15",
  },
  {
    id: "4",
    sku: "RAW-C789",
    name: "Raw Material C-789",
    warehouse: "Secondary Warehouse",
    location: "C-01-03-02",
    quantity: 1200,
    capacity: 2000,
    unit: "kg",
    lastUpdated: "2024-01-14 16:45",
  },
  {
    id: "5",
    sku: "ELC-E345",
    name: "Electronic E-345",
    warehouse: "Main Warehouse",
    location: "A-03-01-01",
    quantity: 450,
    capacity: 500,
    unit: "pcs",
    lastUpdated: "2024-01-15 09:00",
  },
  {
    id: "6",
    sku: "ELC-E345",
    name: "Electronic E-345",
    warehouse: "Secondary Warehouse",
    location: "A-01-01-01",
    quantity: 406,
    capacity: 500,
    unit: "pcs",
    lastUpdated: "2024-01-15 11:20",
  },
  {
    id: "7",
    sku: "MCH-F678",
    name: "Machine Part F-678",
    warehouse: "Main Warehouse",
    location: "D-01-02-01",
    quantity: 234,
    capacity: 300,
    unit: "pcs",
    lastUpdated: "2024-01-13 15:00",
  },
  {
    id: "8",
    sku: "PKG-H234",
    name: "Packaging H-234",
    warehouse: "Secondary Warehouse",
    location: "E-02-01-03",
    quantity: 1500,
    capacity: 2000,
    unit: "pcs",
    lastUpdated: "2024-01-15 08:30",
  },
];

const warehouseSummary = [
  {
    name: "Main Warehouse",
    totalItems: 5,
    totalStock: 1162,
    capacity: 1900,
    utilization: 61,
  },
  {
    name: "Secondary Warehouse",
    totalItems: 3,
    totalStock: 3106,
    capacity: 4500,
    utilization: 69,
  },
];

const totalProducts = inventoryItems.length;
const totalStockQuantity = inventoryItems.reduce(
  (sum, item) => sum + item.quantity,
  0
);
const lowStockItems = inventoryItems.filter((item) => item.quantity <= 5);
const outOfStockItems = inventoryItems.filter((item) => item.quantity === 0);

const stockStatus = {
  inStock: totalStockQuantity - lowStockItems.length - outOfStockItems.length,
  lowStock: lowStockItems.length,
  outOfStock: outOfStockItems.length,
};

// Dummy data for recent activity - replace with actual data fetching
const recentActivity = [
  {
    id: "1",
    type: "Restocked",
    item: "Widget A-123",
    quantity: 50,
    date: "2024-01-16",
  },
  {
    id: "2",
    type: "Sold",
    item: "Component B-456",
    quantity: 10,
    date: "2024-01-16",
  },
  {
    id: "3",
    type: "Returned",
    item: "Raw Material C-789",
    quantity: 5,
    date: "2024-01-15",
  },
];

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Inventory Overview</h1>
        <p className="page-description">
          View and manage stock levels across all locations
        </p>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Total Stock Quantity"
          value={totalStockQuantity.toLocaleString()}
          icon={Warehouse}
          iconColor="text-green-500"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems.length}
          icon={TrendingDown}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Out of Stock Items"
          value={outOfStockItems.length}
          icon={CircleAlert}
          iconColor="text-red-500"
        />
      </div>

      {/* Stock Level Status Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Level Status Breakdown */}
        <div className="content-section">
          <h2 className="text-lg font-semibold mb-4">Stock Level Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-green-600">
                <PieChart className="h-5 w-5" /> In Stock
              </span>
              <span className="font-semibold">{stockStatus.inStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-orange-600">
                <TrendingDown className="h-5 w-5" /> Low Stock
              </span>
              <span className="font-semibold">{stockStatus.lowStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-red-600">
                <CircleAlert className="h-5 w-5" /> Out of Stock
              </span>
              <span className="font-semibold">{stockStatus.outOfStock}</span>
            </div>
          </div>
        </div>

        {/* Recent Stock Activity */}
        <div className="content-section">
          <h2 className="text-lg font-semibold mb-4">Recent Stock Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="font-medium">
                  {activity.type === "Restocked" ? "+" : "-"}
                  {activity.quantity} {activity.item}
                  <span className="text-muted-foreground ml-2">
                    ({activity.type})
                  </span>
                </span>
                <span className="text-muted-foreground">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock & Out-of-Stock List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="content-section">
          <h2 className="text-lg font-semibold mb-4">Low Stock Items</h2>
          {lowStockItems.length > 0 ? (
            <ul className="space-y-2">
              {lowStockItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>
                    {item.name} ({item.sku})
                  </span>
                  <Badge variant="destructive">{item.quantity} left</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No low stock items.</p>
          )}
        </div>

        {/* Out of Stock Items */}
        <div className="content-section">
          <h2 className="text-lg font-semibold mb-4">Out of Stock Items</h2>
          {outOfStockItems.length > 0 ? (
            <ul className="space-y-2">
              {outOfStockItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <span>
                    {item.name} ({item.sku})
                  </span>
                  <Badge variant="destructive">Out of Stock</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No out of stock items.</p>
          )}
        </div>
      </div>

      {/* Warehouse Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouseSummary.map((warehouse) => (
          <div
            key={warehouse.name}
            className="content-section hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Warehouse className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{warehouse.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {warehouse.totalItems} items ·{" "}
                    {warehouse.totalStock.toLocaleString()} units
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Capacity Utilization</span>
                <span className="font-medium">{warehouse.utilization}%</span>
              </div>
              <Progress
                value={warehouse.utilization}
                className={cn("h-2", getCapacityColor(warehouse.utilization))}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="content-section">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU, product name, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              <SelectItem value="main">Main Warehouse</SelectItem>
              <SelectItem value="secondary">Secondary Warehouse</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              <SelectItem value="a">Zone A</SelectItem>
              <SelectItem value="b">Zone B</SelectItem>
              <SelectItem value="c">Zone C</SelectItem>
              <SelectItem value="d">Zone D</SelectItem>
              <SelectItem value="e">Zone E</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8">
                  SKU
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                  Warehouse
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </div>
              </TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Capacity Usage</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.map((item) => {
              const usagePercentage = Math.round(
                (item.quantity / item.capacity) * 100
              );
              return (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {item.warehouse}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {item.location}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">
                      {item.quantity.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={usagePercentage}
                        className={cn("h-2 w-24", getCapacityColor(usagePercentage))}
                      />
                      <span className="text-sm text-muted-foreground w-12">
                        {usagePercentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.lastUpdated}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-8 of 8 inventory records
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
