
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

  // Create chartConfig dynamically based on sorted data to ensure legend and tooltip match slice order
  const chartConfig = data.reduce((acc, entry) => {
    acc[entry.name] = {
      label: entry.name,
      color: entry.fill, // Use the fill color assigned in reportUtils
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={<ChartTooltipContent 
                  formatter={(value, name, props) => {
                     // Ensure props.payload and props.payload.percent are defined
                     const percentage = props.payload && typeof props.payload.percent === 'number' 
                                        ? (props.payload.percent * 100).toFixed(1) 
                                        : 'N/A';
                     return [`${value} transactions (${percentage}%)`, props.payload?.name || name];
                  }}
                  nameKey="name" // This refers to the 'name' property in your data objects
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
              innerRadius={0} // Making it a Pie chart instead of Doughnut for this one
              labelLine={false}
              label={({ name, percent, value }) => 
                (percent * 100) > 3 
                ? `${name.substring(0,10)}${(name.length > 10 ? '...' : '')}: ${value} (${(percent * 100).toFixed(0)}%)` 
                : ''
              }
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
