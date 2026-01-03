// App.tsx
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { WmsProvider } from "./context/WmsContext";
import { Skeleton } from "./components/ui/skeleton";
import { QueryProvider } from "./providers/QueryProvider";

// Code splitting - lazy load all pages with optimized loading
// Dashboard is heavy, so preload it when user hovers over navigation
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then(module => {
    // Optional: Preload related components
    return module;
  })
);
const Index = lazy(() => import("./pages/Index"));
const InventoryReport = lazy(() => import("./pages/InventoryReport"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OrderMonitoring = lazy(() => import("./pages/OrderMonitoring"));
const AllocationSummary = lazy(() => import("./pages/order-completion/AllocationSummary"));
const BarcoderAssignment = lazy(() => import("./pages/order-completion/BarcoderAssignment"));
const CheckerAssignment = lazy(() => import("./pages/order-completion/CheckerAssignment"));
const PickerAssignment = lazy(() => import("./pages/order-completion/PickerAssignment"));
const TaggerAssignment = lazy(() => import("./pages/order-completion/TaggerAssignment"));
const TransferAssignment = lazy(() => import("./pages/order-completion/TransferAssignment"));
const Adjustments = lazy(() => import("./pages/stock-management/Adjustments"));
const StockBuffering = lazy(() => import("./pages/stock-management/StockBuffering"));
const StockInquiry = lazy(() => import("./pages/stock-management/StockInquiry"));
const StockLocationInquiry = lazy(() => import("./pages/stock-management/StockLocationInquiry"));
const Transfers = lazy(() => import("./pages/stock-management/Transfers"));
const Withdrawal = lazy(() => import("./pages/stock-management/Withdrawal"));
const PurchaseOrder = lazy(() => import("./pages/supplier/PurchaseOrder"));
const SupplierDelivery = lazy(() => import("./pages/supplier/SupplierDelivery"));
const SupplierProfile = lazy(() => import("./pages/supplier/SupplierProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const Users = lazy(() => import("./pages/Users"));
const Products = lazy(() => import("./pages/Products"));

// Create Suspense wrapper for different page types
const SuspenseWrapper = ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

// Enhanced loading fallback components
const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-96 w-full" />
  </div>
);

// Specialized skeletons for different page types
const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
);

// Performance monitoring and main app content
const AppContent = () => {
  return (
    <Routes>
          <Route path="/" element={
            <SuspenseWrapper fallback={<PageSkeleton />}>
              <Index />
            </SuspenseWrapper>
          } />
          <Route path="/login" element={
            <SuspenseWrapper fallback={<PageSkeleton />}>
              <Login />
            </SuspenseWrapper>
          } />

          {/* Protected Routes with Layout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={
              <SuspenseWrapper fallback={<DashboardSkeleton />}>
                <Dashboard />
              </SuspenseWrapper>
            } />

            {/* Stock Management - Table-based pages */}
            <Route path="/stock-management/stock-buffering" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <StockBuffering />
              </SuspenseWrapper>
            } />
            <Route path="/stock-management/stock-inquiry" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <StockInquiry />
              </SuspenseWrapper>
            } />
            <Route path="/stock-management/stock-location-inquiry" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <StockLocationInquiry />
              </SuspenseWrapper>
            } />
            <Route path="/stock-management/adjustments" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <Adjustments />
              </SuspenseWrapper>
            } />
            <Route path="/stock-management/withdrawal" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <Withdrawal />
              </SuspenseWrapper>
            } />
            <Route path="/stock-management/transfers" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <Transfers />
              </SuspenseWrapper>
            } />

            {/* Operations & Order Completion */}
            <Route path="/operations/monitoring" element={
              <SuspenseWrapper fallback={<DashboardSkeleton />}>
                <OrderMonitoring />
              </SuspenseWrapper>
            } />
            <Route path="/order-completion/allocation" element={
              <SuspenseWrapper fallback={<PageSkeleton />}>
                <AllocationSummary />
              </SuspenseWrapper>
            } />
            <Route path="/order-completion/picker" element={
              <SuspenseWrapper fallback={<PageSkeleton />}>
                <PickerAssignment />
              </SuspenseWrapper>
            } />
            <Route path="/order-completion/barcoder" element={
              <SuspenseWrapper fallback={<PageSkeleton />}>
                <BarcoderAssignment />
              </SuspenseWrapper>
            } />
            <Route path="/order-completion/tagger" element={
              <SuspenseWrapper fallback={<PageSkeleton />}>
                <TaggerAssignment />
              </SuspenseWrapper>
            } />
            <Route path="/order-completion/checker" element={
              <SuspenseWrapper fallback={<PageSkeleton />}>
                <CheckerAssignment />
              </SuspenseWrapper>
            } />
            <Route path="/order-completion/transfer" element={
              <SuspenseWrapper fallback={<PageSkeleton />}>
                <TransferAssignment />
              </SuspenseWrapper>
            } />

            {/* Supplier Management */}
            <Route path="/supplier/delivery" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <SupplierDelivery />
              </SuspenseWrapper>
            } />
            <Route path="/supplier/profile" element={
              <SuspenseWrapper fallback={<PageSkeleton />}>
                <SupplierProfile />
              </SuspenseWrapper>
            } />
            <Route path="/supplier/purchase-order" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <PurchaseOrder />
              </SuspenseWrapper>
            } />

            {/* Reports */}
            <Route path="/reports/inventory" element={
              <SuspenseWrapper fallback={<DashboardSkeleton />}>
                <InventoryReport />
              </SuspenseWrapper>
            } />

            {/* Example Pages */}
            <Route path="/users" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <Users />
              </SuspenseWrapper>
            } />
            <Route path="/products" element={
              <SuspenseWrapper fallback={<TableSkeleton />}>
                <Products />
              </SuspenseWrapper>
            } />
            <Route path="/settings" element={
              <SuspenseWrapper fallback={<PageSkeleton />}>
                <Settings />
              </SuspenseWrapper>
            } />
          </Route>

          <Route path="*" element={
            <SuspenseWrapper fallback={<PageSkeleton />}>
              <NotFound />
            </SuspenseWrapper>
          } />
        </Routes>
  );
};

const App = () => (
  <QueryProvider>
    <WmsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </WmsProvider>
  </QueryProvider>
);

export default App;
