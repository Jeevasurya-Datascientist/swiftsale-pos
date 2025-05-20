
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import type { KeyValueDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface CategorySalesChartProps {
  data: KeyValueDataPoint[];
  currencySymbol: string;
}

export default function CategorySalesChart({ data, currencySymbol }: CategorySalesChartProps) {
   if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No category sales data available.</p>;
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
                    return [`${currencySymbol}${Number(value).toFixed(2)} (${percentage}%)`, props.payload.name];
                  }}
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
              innerRadius={60} 
              paddingAngle={2}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                const RADIAN = Math.PI / 180;
                // Adjust label radius to be closer to the middle of the doughnut slice
                const labelRadius = innerRadius + (outerRadius - innerRadius) * 0.4; 
                const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
                const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
                
                if ((percent * 100) > 5) { // Show label only if percent is significant
                  return (
                    <text x={x} y={y} fill="hsl(var(--primary-foreground))" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="medium">
                      {`${name.substring(0, 7)}${(name.length > 7 ? '...' : '')}`}
                    </text>
                  );
                }
                return null;
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
