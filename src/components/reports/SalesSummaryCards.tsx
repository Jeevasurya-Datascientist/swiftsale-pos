
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, BarChartBig, Users } from "lucide-react"; // Users instead of Percent for average

interface SalesSummaryCardsProps {
  summary: {
    totalRevenue: number;
    totalSales: number;
    averageSaleValue: number;
    totalItemsSold: number;
  };
  currencySymbol: string;
}

export default function SalesSummaryCards({ summary, currencySymbol }: SalesSummaryCardsProps) {
  const summaryItems = [
    { title: "Total Revenue", value: `${currencySymbol}${summary.totalRevenue.toFixed(2)}`, icon: DollarSign, description: "Total income from sales" },
    { title: "Total Sales", value: summary.totalSales.toLocaleString(), icon: ShoppingCart, description: "Total number of invoices" },
    { title: "Average Sale Value", value: `${currencySymbol}${summary.averageSaleValue.toFixed(2)}`, icon: BarChartBig, description: "Average revenue per sale" },
    { title: "Total Items Sold", value: summary.totalItemsSold.toLocaleString(), icon: Users, description: "Total quantity of items sold" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item) => (
        <Card key={item.title} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
