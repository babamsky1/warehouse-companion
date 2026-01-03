/**
 * Enhanced StatCard Component with Content-Aware Icons
 * 
 * Purpose: Display key metrics consistently across all pages with contextual icons
 * 
 * Comment: This replaces all inline stat card implementations.
 * Now includes content-specific icons for better visual context while
 * maintaining a clean, professional aesthetic.
 * 
 * Features:
 * - Content-aware icons (Products, Orders, Stock, etc.)
 * - Percentage change indicators
 * - Color variants for visual categorization
 * - Responsive hover effects
 */

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FolderTree,
  Hash,
  Layers,
  MapPin,
  Maximize,
  Minus,
  Package,
  PackageCheck,
  Percent,
  Plane,
  RotateCcw,
  Shield,
  ShoppingCart,
  Star,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Warehouse,
  type LucideIcon
} from "lucide-react";
import { memo } from "react";

/**
 * Content type mapping for automatic icon selection
 * Comment: Pass a contentType to automatically get the correct icon
 */
export type StatCardContentType =
  | "products"
  | "orders"
  | "stock"
  | "low-stock"
  | "adjustments"
  | "transfers"
  | "receiving"
  | "shipping"
  | "returns"
  | "users"
  | "suppliers"
  | "categories"
  | "locations"
  | "warehouses"
  | "value"
  | "pending"
  | "completed"
  | "active"
  | "quantity"
  | "percentage"
  | "calendar"
  | "clock"
  | "shield"
  | "eye"
  | "star"
  | "truck"
  | "plane"
  | "edit"
  | "check"
  | "alert"
  | "parent-category"
  | "sub-category"
  | "capacity"
  | "in-transit";

interface StatCardProps {
  label: string; // Stat description (e.g., "Total Products")
  value: string | number; // Main value to display
  
  // Icon configuration
  icon?: LucideIcon; // Custom icon component
  contentType?: StatCardContentType; // Auto-select icon based on content
  
  // Optional change indicator
  change?: {
    value: number; // Percentage change
    type: "increase" | "decrease" | "neutral";
    period?: string; // Default: "vs last week"
  };
  
  // Optional secondary metric
  trend?: {
    value: number;
    label: string;
  };
  
  className?: string;
  
  // Color variant for visual categorization
  variant?: "default" | "primary" | "success" | "warning" | "destructive" | "info";
}

/**
 * Get icon component based on content type
 * Comment: Centralizes icon mapping for consistency
 */
const getIconFromContentType = (contentType: StatCardContentType): LucideIcon => {
  const iconMap: Record<StatCardContentType, LucideIcon> = {
    products: Package,
    orders: ShoppingCart,
    stock: Warehouse,
    "low-stock": AlertTriangle,
    adjustments: Edit,
    transfers: ArrowRightLeft,
    receiving: PackageCheck,
    shipping: Truck,
    returns: RotateCcw,
    users: User,
    suppliers: Building2,
    categories: FolderTree,
    locations: MapPin,
    warehouses: Warehouse,
    value: DollarSign,
    pending: Clock,
    completed: CheckCircle,
    active: CheckCircle,
    quantity: Hash,
    percentage: Percent,
    calendar: Calendar,
    clock: Clock,
    shield: Shield,
    eye: Eye,
    star: Star,
    truck: Truck,
    plane: Plane,
    edit: Edit,
    check: CheckCircle,
    alert: AlertCircle,
    "parent-category": FolderTree,
    "sub-category": Layers,
    capacity: Maximize,
    "in-transit": Truck,
  };

  return iconMap[contentType];
};

export const StatCard = memo(({
  label,
  value,
  icon: customIcon,
  contentType,
  change,
  trend,
  className,
  variant = "default",
}: StatCardProps) => {
  /**
   * Variant styling configuration
   * Comment: Subtle border and background colors for visual distinction
   */
  const variantStyles = {
    default: "border-border bg-card",
    primary: "border-primary/20 bg-primary/5",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
    destructive: "border-destructive/20 bg-destructive/5",
    info: "border-info/20 bg-info/5",
  };

  /**
   * Get trend icon based on change type
   * Comment: Small, subtle icons only for directional indicators
   */
  const getTrendIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case "increase":
        return <TrendingUp className="h-3 w-3" />;
      case "decrease":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  /**
   * Get color for trend indicator
   * Comment: Semantic colors - green for increase, red for decrease
   */
  const getTrendColor = () => {
    if (!change) return "";
    switch (change.type) {
      case "increase":
        return "text-success";
      case "decrease":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  // Determine which icon to display
  const IconComponent = customIcon || (contentType ? getIconFromContentType(contentType) : null);

  return (
    <div
      className={cn(
        // Comment: Card with subtle border, hover effect for interactivity
        "rounded-lg border bg-card p-4 transition-all hover:shadow-md h-full",
        variantStyles[variant],
        className
      )}
    >
      {/* Header with Label and Icon */}
      <div className="flex items-center justify-between">
        {/* Label */}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        
        {/* Content Icon */}
        {/* Content Icon */}
        {/* Comment: Icon provides visual context for the metric */}
        {IconComponent && (
          <div className={cn("rounded-full p-2", {
            "bg-primary/10 text-primary": variant === "default" || variant === "primary",
            "bg-success/10 text-success": variant === "success",
            "bg-warning/10 text-warning": variant === "warning",
            "bg-destructive/10 text-destructive": variant === "destructive",
            "bg-info/10 text-info": variant === "info",
          })}>
            <IconComponent className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Main Value */}
      {/* Comment: Large, bold number is the primary focus */}
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>

      {/* Change Indicator */}
      {/* Comment: Shows percentage change with directional arrow */}
      {change && (
        <div className={cn("mt-2 flex items-center gap-1 text-sm font-medium", getTrendColor())}>
          {getTrendIcon()}
          <span>
            {change.value > 0 ? "+" : ""}
            {change.value}%
          </span>
          <span className="text-muted-foreground font-normal">
            {change.period || "vs last week"}
          </span>
        </div>
      )}

      {/* Optional Trend Data */}
      {/* Comment: Additional context metric if needed */}
      {trend && (
        <div className="mt-2 text-xs text-muted-foreground">
          {trend.label}: <span className="font-medium">{trend.value}</span>
        </div>
      )}
    </div>
  );
});
