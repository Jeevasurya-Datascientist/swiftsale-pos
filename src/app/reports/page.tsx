
"use client";

import { useState, useEffect } from 'react';
import type { Invoice, ReportTimeFilter, ReportDateRange, SearchableItem } from '@/lib/types';
import { mockInvoices, mockProducts, mockServices } from '@/lib/mockData';
import { useSettings } from '@/context/SettingsContext';
import {
  filterInvoicesByDate,
  calculateSalesSummary,
  getSalesOverTimeData,
  getTopSellingItemsData,
  getSalesByCategoryData,
  getPaymentMethodDistributionData,
} from '@/lib/reportUtils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, BarChart3, LineChart, PieChart, ShoppingBag, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import SalesSummaryCards from '@/components/reports/SalesSummaryCards';
import SalesOverTimeChart from '@/components/reports/SalesOverTimeChart';
import TopItemsChart from '@/components/reports/TopItemsChart';
import CategorySalesChart from '@/components/reports/CategorySalesChart';
import PaymentMethodsChart from '@/components/reports/PaymentMethodsChart';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices); // Use mock data for now
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(mockInvoices);
  const [timeFilter, setTimeFilter] = useState<ReportTimeFilter>('last7days');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  
  const { currencySymbol, isSettingsLoaded } = useSettings();

  // In a real app, you might fetch invoices based on filters or fetch all and filter client-side
  // For now, we'll use mockInvoices and filter client-side.
  // Also, load products/services to enrich invoice items if necessary (e.g. for category)
  useEffect(() => {
    const storedProducts = localStorage.getItem('appProducts');
    const allProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : mockProducts;
    const storedServices = localStorage.getItem('appServices');
    const allServices: Service[] = storedServices ? JSON.parse(storedServices) : mockServices;
    const allItems: SearchableItem[] = [...allProducts, ...allServices];

    // Simulate fetching invoices and enriching them (if necessary)
    // For mock data, ensure items have category
    const enrichedInvoices = mockInvoices.map(inv => ({
        ...inv,
        items: inv.items.map(item => {
            const masterItem = allItems.find(mi => mi.id === item.id);
            return {
                ...item,
                category: item.category || masterItem?.category || 'Uncategorized'
            }
        })
    }));
    setInvoices(enrichedInvoices);
  }, []);


  useEffect(() => {
    const range: ReportDateRange | undefined = 
      timeFilter === 'custom' && customDateRange 
      ? { from: customDateRange.from, to: customDateRange.to } 
      : undefined;
    const newFilteredInvoices = filterInvoicesByDate(invoices, timeFilter, range);
    setFilteredInvoices(newFilteredInvoices);
  }, [invoices, timeFilter, customDateRange]);

  const salesSummary = calculateSalesSummary(filteredInvoices);
  const salesOverTimeData = getSalesOverTimeData(filteredInvoices, timeFilter, customDateRange);
  const topSellingItemsData = getTopSellingItemsData(filteredInvoices);
  const salesByCategoryData = getSalesByCategoryData(filteredInvoices);
  const paymentMethodData = getPaymentMethodDistributionData(filteredInvoices);

  if (!isSettingsLoaded) {
    return (
      <div className="container mx-auto py-4 flex justify-center items-center h-screen">
        <BarChart3 className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-xl">Loading reports...</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full">
    <div className="container mx-auto py-4 space-y-6 pb-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
          <BarChart3 className="h-10 w-10" /> Reports & Insights
        </h1>
        <p className="text-muted-foreground">Analyze your sales performance and trends.</p>
      </header>

      {/* Filters Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <Select value={timeFilter} onValueChange={(value) => {
            setTimeFilter(value as ReportTimeFilter);
            if (value !== 'custom') setCustomDateRange(undefined);
          }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {timeFilter === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full sm:w-auto justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange?.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "LLL dd, y")} -{" "}
                        {format(customDateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(customDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange?.from}
                  selected={customDateRange}
                  onSelect={setCustomDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </CardContent>
      </Card>

      {/* Sales Summary Cards */}
      <SalesSummaryCards summary={salesSummary} currencySymbol={currencySymbol} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="h-6 w-6 text-primary"/>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {salesOverTimeData.length > 0 ? (
                <SalesOverTimeChart data={salesOverTimeData} currencySymbol={currencySymbol} />
            ) : <p className="text-muted-foreground text-center py-8">No sales data for selected period.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary"/>Top Selling Items (by Quantity)</CardTitle>
          </CardHeader>
          <CardContent>
             {topSellingItemsData.length > 0 ? (
                <TopItemsChart data={topSellingItemsData} />
            ) : <p className="text-muted-foreground text-center py-8">No item data for selected period.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart className="h-6 w-6 text-primary"/>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {salesByCategoryData.length > 0 ? (
                <CategorySalesChart data={salesByCategoryData} currencySymbol={currencySymbol} />
            ) : <p className="text-muted-foreground text-center py-8">No category data for selected period.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
             {paymentMethodData.length > 0 ? (
                <PaymentMethodsChart data={paymentMethodData} />
            ) : <p className="text-muted-foreground text-center py-8">No payment data for selected period.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
    </ScrollArea>
  );
}

