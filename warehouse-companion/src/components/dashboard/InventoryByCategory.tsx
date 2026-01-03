import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useCategories } from "@/hooks/use-categories";
import { useStocks } from "@/hooks/use-stocks";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const InventoryByCategory = () => {
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: stocks, isLoading: isLoadingStocks } = useStocks(1, 1000);
  const { data: products, isLoading: isLoadingProducts } = useProducts(1, 1000);

  const isLoading = isLoadingCategories || isLoadingStocks || isLoadingProducts;

  // Aggregate stock quantities by category
  const getChartData = () => {
    if (!categories || !stocks || !products) return [];

    const categoryMap = new Map<number, number>();

    stocks.data.forEach((stock) => {
      const product = products.data.find((p) => p.id === stock.product_id);
      if (product && product.category_id) {
        const current = categoryMap.get(product.category_id) || 0;
        categoryMap.set(product.category_id, current + stock.quantity);
      }
    });

    return categories
      .map((category, index) => ({
        name: category.name,
        value: categoryMap.get(category.id) || 0,
        color: chartColors[index % chartColors.length],
      }))
      .filter((item) => item.value > 0)
      .slice(0, 5); // Top 5 categories
  };

  if (isLoading) {
    return (
      <div className="content-section h-full">
        <h3 className="font-semibold text-lg mb-4">Inventory by Category</h3>
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  const data = getChartData();

  if (data.length === 0) {
    return (
      <div className="content-section h-full">
        <h3 className="font-semibold text-lg mb-4">Inventory by Category</h3>
        <div className="h-[280px] flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="content-section h-full">
      <h3 className="font-semibold text-lg mb-4">Inventory by Category</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} units`, ""]}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
