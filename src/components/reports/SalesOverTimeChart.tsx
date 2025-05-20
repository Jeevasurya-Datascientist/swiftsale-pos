
"use client";

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { TimeSeriesDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'; // Using shadcn's chart tooltip

interface SalesOverTimeChartProps {
  data: TimeSeriesDataPoint[];
  currencySymbol: string;
}

const chartConfig = {
  value: { // Corresponds to dataKey="value" in ChartElement
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function SalesOverTimeChart({ data, currencySymbol }: SalesOverTimeChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No data available for this period.</p>;
  }
  
  // Determine chart type based on number of data points
  const ChartComponent = data.length > 15 ? LineChart : BarChart;
  const ChartElement = data.length > 15 ? Line : Bar;

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false} 
              fontSize={12} 
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              tickFormatter={(value) => `${currencySymbol}${value}`} 
              tickLine={false} 
              axisLine={false} 
              fontSize={12}
              width={70}
            />
            <Tooltip
              content={<ChartTooltipContent 
                  formatter={(value, name) => [`${currencySymbol}${Number(value).toFixed(2)}`, name === 'value' ? 'Sales' : name]}
                  labelFormatter={(label) => label}
              />}
              cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
            />
            <ChartElement
              dataKey="value"
              name="Sales"
              type={ChartComponent === LineChart ? "monotone" : undefined}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary))"
              dot={ChartComponent === LineChart ? { r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' } : undefined}
              activeDot={ChartComponent === LineChart ? { r: 6 } : undefined}
              radius={ChartComponent === BarChart ? [4, 4, 0, 0] : undefined}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

