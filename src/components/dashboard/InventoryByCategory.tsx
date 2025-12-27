import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Electronics", value: 3500, color: "hsl(var(--chart-1))" },
  { name: "Machinery", value: 2800, color: "hsl(var(--chart-2))" },
  { name: "Raw Materials", value: 2200, color: "hsl(var(--chart-3))" },
  { name: "Packaging", value: 1800, color: "hsl(var(--chart-4))" },
  { name: "Other", value: 1200, color: "hsl(var(--chart-5))" },
];

export const InventoryByCategory = () => {
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
