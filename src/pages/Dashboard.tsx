import { Package, Boxes, AlertTriangle, TrendingDown, TruckIcon, PackageMinus } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StockMovementChart } from "@/components/dashboard/StockMovementChart";
import { InventoryByCategory } from "@/components/dashboard/InventoryByCategory";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LowStockTable } from "@/components/dashboard/LowStockTable";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Overview of your warehouse operations and inventory status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Products"
          value="2,847"
          icon={Package}
          iconColor="text-primary"
          change={{ value: 12, type: "increase" }}
        />
        <StatCard
          title="Total Stock"
          value="145,328"
          icon={Boxes}
          iconColor="text-info"
          change={{ value: 8, type: "increase" }}
        />
        <StatCard
          title="Low Stock Items"
          value="23"
          icon={AlertTriangle}
          iconColor="text-warning"
          change={{ value: 5, type: "decrease" }}
        />
        <StatCard
          title="Out of Stock"
          value="8"
          icon={TrendingDown}
          iconColor="text-destructive"
          change={{ value: 2, type: "increase" }}
        />
        <StatCard
          title="Today's Inbound"
          value="1,247"
          icon={TruckIcon}
          iconColor="text-success"
          change={{ value: 18, type: "increase" }}
        />
        <StatCard
          title="Today's Outbound"
          value="892"
          icon={PackageMinus}
          iconColor="text-primary"
          change={{ value: 3, type: "neutral" }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockMovementChart />
        </div>
        <div>
          <InventoryByCategory />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LowStockTable />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
