import { PackagePlus, PackageMinus, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "stock_in" | "stock_out" | "transfer" | "alert";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "stock_in",
    title: "Stock Received",
    description: "500 units of Widget A-123 received at Warehouse 1",
    time: "10 min ago",
  },
  {
    id: "2",
    type: "stock_out",
    title: "Order Shipped",
    description: "Order #ORD-2024-0156 dispatched to Customer XYZ",
    time: "25 min ago",
  },
  {
    id: "3",
    type: "alert",
    title: "Low Stock Alert",
    description: "Component B-456 is below reorder level (50 units)",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "transfer",
    title: "Stock Transfer",
    description: "200 units moved from Zone A to Zone C",
    time: "2 hours ago",
  },
  {
    id: "5",
    type: "stock_in",
    title: "Purchase Order Received",
    description: "PO-2024-089 fully received and put away",
    time: "3 hours ago",
  },
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "stock_in":
      return <PackagePlus className="h-4 w-4" />;
    case "stock_out":
      return <PackageMinus className="h-4 w-4" />;
    case "transfer":
      return <ArrowLeftRight className="h-4 w-4" />;
    case "alert":
      return <AlertTriangle className="h-4 w-4" />;
  }
};

const getActivityColor = (type: Activity["type"]) => {
  switch (type) {
    case "stock_in":
      return "bg-success/10 text-success";
    case "stock_out":
      return "bg-info/10 text-info";
    case "transfer":
      return "bg-primary/10 text-primary";
    case "alert":
      return "bg-warning/10 text-warning";
  }
};

export const RecentActivity = () => {
  return (
    <div className="content-section h-full">
      <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className={cn("p-2 rounded-lg", getActivityColor(activity.type))}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{activity.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
