import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Inventory from "./pages/inventory/Overview";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Products from "./pages/products/AllProducts";
import Categories from "./pages/products/Categories";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes with Layout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/inventory/overview" element={<Inventory />} />
            <Route path="/stock-in" element={<Dashboard />} />
            <Route path="/stock-out" element={<Dashboard />} />
            <Route path="/transfers" element={<Dashboard />} />
            <Route path="/warehouses" element={<Dashboard />} />
            <Route path="/locations" element={<Dashboard />} />
            <Route path="/receiving" element={<Dashboard />} />
            <Route path="/shipping" element={<Dashboard />} />
            <Route path="/returns" element={<Dashboard />} />
            <Route path="/orders" element={<Dashboard />} />
            <Route path="/suppliers" element={<Dashboard />} />
            <Route path="/reports/inventory" element={<Dashboard />} />
            <Route path="/reports/movements" element={<Dashboard />} />
            <Route path="/reports/low-stock" element={<Dashboard />} />
            <Route path="/users" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
