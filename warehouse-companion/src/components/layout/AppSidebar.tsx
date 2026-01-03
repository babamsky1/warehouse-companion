import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Contact,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  PackageMinus,
  QrCode,
  Scale,
  Settings,
  ShieldCheck,
  Tag,
  TruckIcon,
  Users,
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
        "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/20"
      )}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 w-1 h-6 bg-sidebar-primary rounded-r-full" />
      )}
      
      <div className={cn(
        "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-primary"
      )}>
        {icon}
      </div>

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-sidebar-primary text-sidebar-primary-foreground rounded-full min-w-[1.25rem]">
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
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className={cn(
          "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider",
          "text-sidebar-foreground/50 hover:text-sidebar-accent-foreground transition-all duration-200"
        )}>
          {icon}
          <span className="flex-1 text-left">{label}</span>
          <div className="transition-transform duration-200">
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-2 space-y-1 mt-1 border-l border-sidebar-border/50 ml-5">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
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
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center shadow-lg shadow-sidebar-primary/20">
              <Boxes className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-none text-sidebar-accent-foreground">WMS Pro</span>
              <span className="text-[10px] text-sidebar-foreground/50 font-medium tracking-widest uppercase">Enterprise</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-6">
          <div className="space-y-1">
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="Dashboard"
              isCollapsed={isCollapsed}
            />
          </div>

          <NavGroup
            label="Stock Management"
            icon={<Boxes className="h-4 w-4" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              to="/stock-management/stock-buffering"
              icon={<Package className="h-4 w-4" />}
              label="Stock Buffering"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/stock-management/stock-inquiry"
              icon={<BarChart3 className="h-4 w-4" />}
              label="Stock Inquiry"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/stock-management/stock-location-inquiry"
              icon={<MapPin className="h-4 w-4" />}
              label="Stock Location Inquiry"
              isCollapsed={isCollapsed}
            />
             <NavItem
              to="/stock-management/adjustments"
              icon={<Scale className="h-4 w-4" />}
              label="Adjustments"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/stock-management/withdrawal"
              icon={<PackageMinus className="h-4 w-4" />}
              label="Withdrawal"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/stock-management/transfers"
              icon={<ArrowLeftRight className="h-4 w-4" />}
              label="Transfers"
              isCollapsed={isCollapsed}
            />
          </NavGroup>

          <NavGroup
            label="Suppliers"
            icon={<TruckIcon className="h-4 w-4" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              to="/supplier/delivery"
              icon={<TruckIcon className="h-4 w-4" />}
              label="Supplier Delivery"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/supplier/purchase-order"
              icon={<FileText className="h-4 w-4" />}
              label="Purchase Order"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/supplier/profile"
              icon={<Contact className="h-4 w-4" />}
              label="Supplier Profile"
              isCollapsed={isCollapsed}
            />
          </NavGroup>

          <NavGroup
            label="Order Completion"
            icon={<CheckCircle2 className="h-4 w-4" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              to="/order-completion/picker"
              icon={<Users className="h-4 w-4" />}
              label="Picker Assignment"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/order-completion/barcoder"
              icon={<QrCode className="h-4 w-4" />}
              label="Barcoder Assignment"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/order-completion/tagger"
              icon={<Tag className="h-4 w-4" />}
              label="Tagger Assignment"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/order-completion/checker"
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Checker Assignment"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/order-completion/transfer"
              icon={<ArrowLeftRight className="h-4 w-4" />}
              label="Transfer Assignment"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/order-completion/allocation"
              icon={<ClipboardList className="h-4 w-4" />}
              label="Allocation Summary"
              isCollapsed={isCollapsed}
            />
          </NavGroup>

            <NavItem
              to="/operations/monitoring"
              icon={<Activity className="h-4 w-4" />}
              label="Order Monitoring"
              isCollapsed={isCollapsed}
            />
            <NavItem
              to="/reports/inventory"
              icon={<ClipboardList className="h-4 w-4" />}
              label="Inventory Report"
              isCollapsed={isCollapsed}
            />
        </nav>
      </ScrollArea>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-sidebar-accent/50",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <Avatar className="h-9 w-9 border-2 border-sidebar-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold">JD</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-accent-foreground truncate">John Doe</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate font-medium">Warehouse Manager</p>
            </div>
          )}
          {!isCollapsed && (
             <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-accent-foreground">
                <Settings className="h-4 w-4" />
             </Button>
          )}
        </div>
        
        <Separator className="my-4 bg-sidebar-border/50" />

        <Button
          variant="ghost"
          className={cn(
            "w-full group text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-200",
            isCollapsed ? "justify-center px-0" : "justify-start px-3"
          )}
        >
          <LogOut className={cn(
            "h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1",
            isCollapsed ? "" : "mr-3"
          )} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};
