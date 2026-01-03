import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/services/analytics.api";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, startOfDay } from "date-fns";

export const StockMovementChart = () => {
  const { data: movementsData, isLoading } = useQuery({
    queryKey: ['stock-movements', 'chart'],
    queryFn: async () => {
      const response = await reportsApi.getStockMovements(1, 100);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch stock movements');
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Aggregate movements by day for the last 7 days
  const getChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map((day, index) => ({
      name: day,
      inbound: 0,
      outbound: 0,
    }));

    if (movementsData?.data) {
      movementsData.data.forEach((movement) => {
        const movementDate = new Date(movement.movement_date);
        const dayIndex = movementDate.getDay();
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert Sunday (0) to last index

        if (adjustedIndex >= 0 && adjustedIndex < 7) {
          if (movement.movement_type === 'in') {
            data[adjustedIndex].inbound += movement.quantity;
          } else if (movement.movement_type === 'out') {
            data[adjustedIndex].outbound += movement.quantity;
          }
        }
      });
    }

    return data;
  };

  if (isLoading) {
    return (
      <div className="content-section">
        <h3 className="font-semibold text-lg mb-4">Stock Movement (This Week)</h3>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const data = getChartData();

  return (
    <div className="content-section">
      <h3 className="font-semibold text-lg mb-4">Stock Movement (This Week)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="inbound"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInbound)"
              name="Inbound"
            />
            <Area
              type="monotone"
              dataKey="outbound"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOutbound)"
              name="Outbound"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
