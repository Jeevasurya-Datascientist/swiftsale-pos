
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { KeyValueDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface TopItemsChartProps {
  data: KeyValueDataPoint[];
}

const chartConfig = {
  value: { // Corresponds to dataKey="value" in Bar
    label: "Quantity Sold",
    color: "hsl(var(--primary))",
  },
  // If individual items needed specific colors/icons in tooltip/legend, they would be keyed by item.name here
} satisfies ChartConfig;

export default function TopItemsChart({ data }: TopItemsChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No item data available.</p>;
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tickLine={false} 
              axisLine={false} 
              fontSize={12} 
              width={120}
              interval={0} // Show all labels
              tickFormatter={(value: string) => value.length > 15 ? `${value.substring(0,13)}...` : value}
            />
            <Tooltip 
              content={<ChartTooltipContent 
                  formatter={(value, name, props) => [value, props.payload.name]} // props.payload.name is the item name
              />}
              cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
             />
            <Bar 
              dataKey="value" 
              name="Quantity Sold" // This name is used by Tooltip if not overridden by formatter
              fill="var(--color-value)" // Use color from chartConfig
              radius={[0, 4, 4, 0]} 
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

