import { PackagePlus, PackageMinus, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "stock_in" | "stock_out" | "transfer" | "alert";
  title: string;
  description: string;
  time: string;
}

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
  const { data: summary, isLoading } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="content-section h-full">
        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Map recent movements to activity format
  const activities: Activity[] = (summary?.recent_movements || []).slice(0, 5).map((movement) => {
    const movementDate = new Date(movement.movement_date);
    const timeAgo = formatDistanceToNow(movementDate, { addSuffix: true });
    
    let type: Activity["type"] = "transfer";
    let title = "Stock Movement";
    let description = "";

    switch (movement.movement_type) {
      case "in":
        type = "stock_in";
        title = "Stock Received";
        description = `${movement.quantity} units received`;
        break;
      case "out":
        type = "stock_out";
        title = "Stock Out";
        description = `${movement.quantity} units shipped`;
        break;
      case "transfer":
        type = "transfer";
        title = "Stock Transfer";
        description = `${movement.quantity} units transferred`;
        break;
      case "adjustment":
        type = "alert";
        title = "Stock Adjustment";
        description = `${movement.quantity} units adjusted`;
        break;
    }

    return {
      id: movement.id.toString(),
      type,
      title,
      description,
      time: timeAgo,
    };
  });

  if (activities.length === 0) {
    return (
      <div className="content-section h-full">
        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-muted-foreground text-sm">
          No recent activity
        </div>
      </div>
    );
  }

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
