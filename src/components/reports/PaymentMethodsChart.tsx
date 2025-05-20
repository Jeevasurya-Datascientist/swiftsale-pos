
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import type { KeyValueDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface PaymentMethodsChartProps {
  data: KeyValueDataPoint[];
}

const chartConfig = {
 // Similar to CategorySalesChart, config is mainly for tooltip context
 // Dynamic config could be built if specific labels/icons per payment method were needed in a shadcn ChartLegendContent
} satisfies ChartConfig;

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
      <ChartContainer config={dynamicChartConfig}> {/* Pass config for tooltip context */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={<ChartTooltipContent 
                  formatter={(value, name, props) => [`${value} transactions (${(props.payload.percent * 100).toFixed(1)}%)`, name]}
                  nameKey="name" // 'name' here refers to the payment method name from KeyValueDataPoint
              />}
            />
            <Legend verticalAlign="bottom" height={36} />
            <Pie
              data={data}
              dataKey="value" // The count of transactions
              nameKey="name" // The payment method name
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
               label={({ name, percent }) => (percent * 100) > 3 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
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

