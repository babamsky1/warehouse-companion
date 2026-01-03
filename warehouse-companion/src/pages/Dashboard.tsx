import { Suspense, lazy, useEffect, useState } from "react";
import { LowStockTable } from "@/components/dashboard/LowStockTable";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatCard } from "@/components/dashboard/StatCard";
import { PerformanceTest } from "@/components/ui/performance-test";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Zap, Rocket } from "lucide-react";

// Lazy load heavy chart components to reduce initial bundle size
const StockMovementChart = lazy(() => import("@/components/dashboard/StockMovementChart").then(module => ({ default: module.StockMovementChart })));
const InventoryByCategory = lazy(() => import("@/components/dashboard/InventoryByCategory").then(module => ({ default: module.InventoryByCategory })));

// Preload chart components after initial render to improve UX
const preloadCharts = () => {
  // Preload after a short delay to not block initial render
  setTimeout(() => {
    import("@/components/dashboard/StockMovementChart");
    import("@/components/dashboard/InventoryByCategory");
  }, 2000);
};
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "@/hooks/use-dashboard";

const Dashboard = () => {
  const { data: summary, isLoading, error } = useDashboardSummary();
  const [showPerformanceTest, setShowPerformanceTest] = useState(false);

  // Preload heavy chart components after initial render
  useEffect(() => {
    preloadCharts();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Overview of your warehouse operations and inventory status
          </p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Real-time Performance Monitor */}
      <PerformanceMonitor show={true} />

      <div className="space-y-6">
        {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Overview of your warehouse operations and inventory status
            </p>
          </div>
          <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
            <Rocket className="h-3 w-3" />
            Ultra Fast
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Products"
          value={summary.total_products.toLocaleString()}
          contentType="products"
          variant="primary"
        />
        <StatCard
          label="Total Stock Value"
          value={`$${summary.total_stock_value.toLocaleString()}`}
          contentType="value"
          variant="default"
        />
        <StatCard
          label="Low Stock Items"
          value={summary.low_stock_items.toString()}
          contentType="low-stock"
          variant="warning"
        />
        <StatCard
          label="Total Warehouses"
          value={summary.total_warehouses.toString()}
          contentType="warehouses"
          variant="info"
        />
        <StatCard
          label="Total Orders"
          value={summary.total_orders.toString()}
          contentType="orders"
          variant="success"
        />
        <StatCard
          label="Pending Orders"
          value={summary.pending_orders.toString()}
          contentType="pending"
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <StockMovementChart />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <InventoryByCategory />
          </Suspense>
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

      {/* Performance Test Section */}
      <div className="mt-8 pt-6 border-t">
        <Button
          onClick={() => setShowPerformanceTest(!showPerformanceTest)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Zap className="h-4 w-4" />
          {showPerformanceTest ? 'Hide' : 'Show'} Performance Test
          {showPerformanceTest ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showPerformanceTest && (
          <div className="mt-4">
            <PerformanceTest />
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default Dashboard;
