
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import type { KeyValueDataPoint } from "@/lib/types";
import { ChartTooltipContent } from '@/components/ui/chart';

interface PaymentMethodsChartProps {
  data: KeyValueDataPoint[];
}

export default function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
   if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No payment method data available.</p>;
  }
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={<ChartTooltipContent 
                formatter={(value, name, props) => [`${value} transactions (${(props.payload.percent * 100).toFixed(1)}%)`, name]}
                nameKey="name"
            />}
          />
          <Legend verticalAlign="bottom" height={36} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
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
    </div>
  );
}
