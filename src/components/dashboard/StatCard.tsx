import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary",
  className,
}: StatCardProps) => {
  return (
    <div className={cn("stat-card animate-fade-in", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label">{title}</p>
          <p className="stat-value mt-1">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm mt-2 font-medium",
                change.type === "increase" && "text-success",
                change.type === "decrease" && "text-destructive",
                change.type === "neutral" && "text-muted-foreground"
              )}
            >
              {change.type === "increase" && "↑ "}
              {change.type === "decrease" && "↓ "}
              {change.value}%{" "}
              <span className="text-muted-foreground font-normal">vs last week</span>
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg bg-muted", iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
