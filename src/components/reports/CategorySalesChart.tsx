
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import type { KeyValueDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface CategorySalesChartProps {
  data: KeyValueDataPoint[];
  currencySymbol: string;
}

// For Pie charts, config can be dynamic based on data names or a generic setup
const chartConfig = {
  // We'll let the Cell component define fill colors.
  // This config is mainly for ChartTooltipContent to access context.
  // If we used ChartLegendContent from shadcn, we'd define item labels/colors here.
} satisfies ChartConfig;


export default function CategorySalesChart({ data, currencySymbol }: CategorySalesChartProps) {
   if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No category sales data available.</p>;
  }

  // Dynamically build a config for tooltip if needed, or use a simpler formatter
  const dynamicChartConfig = data.reduce((acc, entry) => {
    acc[entry.name] = { label: entry.name, color: entry.fill || `hsl(var(--chart-1))` };
    return acc;
  }, {} as ChartConfig);


  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={dynamicChartConfig}> {/* Pass config for tooltip context */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={<ChartTooltipContent 
                  formatter={(value, name, props) => [`${currencySymbol}${Number(value).toFixed(2)} (${(props.payload.percent * 100).toFixed(1)}%)`, props.payload.name]}
                  nameKey="name" 
              />}
            />
            <Legend verticalAlign="bottom" height={36} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name" // This corresponds to the 'name' property in KeyValueDataPoint
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60} // For doughnut chart
              paddingAngle={2}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                // Show label only if percent is significant
                return (percent * 100) > 5 ? (
                  <text x={x} y={y} fill="hsl(var(--primary-foreground))" textAnchor="middle" dominantBaseline="central" fontSize={12}>
                    {`${name.substring(0,8)}${(percent * 100).toFixed(0)}%`}
                  </text>
                ) : null;
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill || `hsl(var(--chart-${(index % 5) + 1}))`} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

