
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { KeyValueDataPoint } from "@/lib/types";
import { ChartTooltipContent } from '@/components/ui/chart';

interface TopItemsChartProps {
  data: KeyValueDataPoint[];
}

export default function TopItemsChart({ data }: TopItemsChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No item data available.</p>;
  }

  return (
    <div className="h-[350px] w-full">
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
                formatter={(value, name, props) => [value, props.payload.name]}
            />}
            cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
           />
          <Bar 
            dataKey="value" 
            name="Quantity Sold"
            fill="hsl(var(--primary))" 
            radius={[0, 4, 4, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
