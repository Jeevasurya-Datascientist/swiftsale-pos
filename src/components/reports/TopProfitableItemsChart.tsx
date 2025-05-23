
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { KeyValueDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useSettings } from "@/context/SettingsContext";

interface TopProfitableItemsChartProps {
  data: KeyValueDataPoint[];
}

const chartConfig = {
  profit: { // Corresponds to dataKey="value" in Bar, but we rename for clarity
    label: "Total Profit",
    color: "hsl(var(--chart-2))", // Use a different chart color
  },
} satisfies ChartConfig;

export default function TopProfitableItemsChart({ data }: TopProfitableItemsChartProps) {
  const { currencySymbol } = useSettings();

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No profit data available for items.</p>;
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              tickLine={false} 
              axisLine={false} 
              fontSize={12} 
              tickFormatter={(value) => `${currencySymbol}${value}`}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tickLine={false} 
              axisLine={false} 
              fontSize={12} 
              width={120}
              interval={0} 
              tickFormatter={(value: string) => value.length > 15 ? `${value.substring(0,13)}...` : value}
            />
            <Tooltip 
              content={<ChartTooltipContent 
                  formatter={(value, name, props) => [`${currencySymbol}${Number(value).toFixed(2)}`, props.payload.name]} 
                  nameKey="name" 
              />}
              cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
             />
            <Bar 
              dataKey="value" // 'value' here represents totalProfit from KeyValueDataPoint
              name="Total Profit" 
              fill="var(--color-profit)" 
              radius={[0, 4, 4, 0]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
