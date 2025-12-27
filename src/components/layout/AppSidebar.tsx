import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderTree,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  PackageMinus,
  PackagePlus,
  Settings,
  ShoppingCart,
  TruckIcon,
  Undo2,
  UserCog,
  Users,
  Warehouse,
  X
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  isCollapsed?: boolean;
}

const NavItem = ({ to, icon, label, badge, isCollapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
      )}
    >
      {icon}
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-warning text-warning-foreground rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

interface NavGroupProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isCollapsed?: boolean;
}

const NavGroup = ({ label, icon, children, defaultOpen = false, isCollapsed }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return <>{children}</>;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-1 mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar = ({ isCollapsed, onToggle }: AppSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Boxes className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-accent-foreground">WMS Pro</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />

          <NavGroup
            label="Products"
            icon={<Package className="h-5 w-5" />}
            defaultOpen
            isCollapsed={isCollapsed}
          >
            <NavItem
              to="/products"
              icon={<Package className="h-4 w-4" />}
              label="All Products"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/categories"
              icon={<FolderTree className="h-4 w-4" />}
              label="Categories"
              isCollapsed={isCollapsed}
            />
          </NavGroup>

          <NavGroup
            label="Inventory"
            icon={<Boxes className="h-5 w-5" />}
            defaultOpen
            isCollapsed={isCollapsed}
          >
            <NavItem
              to="/inventory/overview"
              icon={<ClipboardList className="h-4 w-4" />}
              label="Overview"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/stock-in"
              icon={<PackagePlus className="h-4 w-4" />}
              label="Stock In"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/stock-out"
              icon={<PackageMinus className="h-4 w-4" />}
              label="Stock Out"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/transfers"
              icon={<ArrowLeftRight className="h-4 w-4" />}
              label="Transfers"
              isCollapsed={isCollapsed}
            />
          </NavGroup>

          <NavGroup
            label="Warehouse"
            icon={<Warehouse className="h-5 w-5" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              to="/warehouses"
              icon={<Building2 className="h-4 w-4" />}
              label="Warehouses"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/locations"
              icon={<MapPin className="h-4 w-4" />}
              label="Locations"
              isCollapsed={isCollapsed}
            />
          </NavGroup>

          <NavGroup
            label="Operations"
            icon={<TruckIcon className="h-5 w-5" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              to="/receiving"
              icon={<PackagePlus className="h-4 w-4" />}
              label="Receiving"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/shipping"
              icon={<TruckIcon className="h-4 w-4" />}
              label="Shipping"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/returns"
              icon={<Undo2 className="h-4 w-4" />}
              label="Returns"
              isCollapsed={isCollapsed}
            />
          </NavGroup>

          <NavItem
            to="/orders"
            icon={<ShoppingCart className="h-5 w-5" />}
            label="Orders"
            badge={5}
            isCollapsed={isCollapsed}
          />

          <NavItem
            to="/suppliers"
            icon={<Users className="h-5 w-5" />}
            label="Suppliers"
            isCollapsed={isCollapsed}
          />

          <NavGroup
            label="Reports"
            icon={<BarChart3 className="h-5 w-5" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              to="/reports/inventory"
              icon={<FileText className="h-4 w-4" />}
              label="Inventory Report"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/reports/movements"
              icon={<History className="h-4 w-4" />}
              label="Stock Movements"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/reports/low-stock"
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Low Stock"
              badge={12}
              isCollapsed={isCollapsed}
            />
          </NavGroup>

          <NavItem
            to="/users"
            icon={<UserCog className="h-5 w-5" />}
            label="User Management"
            isCollapsed={isCollapsed}
          />

          <NavItem
            to="/settings"
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            isCollapsed={isCollapsed}
          />
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};
