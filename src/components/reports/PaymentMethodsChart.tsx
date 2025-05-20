
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import type { KeyValueDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface PaymentMethodsChartProps {
  data: KeyValueDataPoint[];
}

export default function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
   if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No payment method data available.</p>;
  }

  const dynamicChartConfig = data.reduce((acc, entry) => {
    acc[entry.name] = { label: entry.name, color: entry.fill || `hsl(var(--chart-1))` };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={dynamicChartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={<ChartTooltipContent 
                  formatter={(value, name, props) => {
                     const percentage = props.payload?.percent !== undefined ? (props.payload.percent * 100).toFixed(1) : 'N/A';
                     return [`${value} transactions (${percentage}%)`, props.payload.name];
                  }}
                  nameKey="name"
              />}
            />
            <Legend verticalAlign="bottom" height={36}/>
            <Pie
              data={data}
              dataKey="value" 
              nameKey="name" 
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ name, percent }) => (percent * 100) > 3 ? `${name.substring(0,10)}: ${(percent * 100).toFixed(0)}%` : ''}
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
