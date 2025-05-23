
"use client";

import { useState, useEffect } from 'react';
import type { Invoice, ReportTimeFilter, ReportDateRange, Product, Service, SearchableItem, AnalyzeProfitInput, AnalyzeProfitOutput } from '@/lib/types'; 
import { useSettings } from '@/context/SettingsContext';
import {
  filterInvoicesByDate,
  calculateSalesSummary,
  getSalesOverTimeData,
  getTopSellingItemsData,
  getSalesByCategoryData,
  getPaymentMethodDistributionData,
  getTopProfitableItemsData, // Import new util
} from '@/lib/reportUtils';
import { analyzeProfit } from '@/ai/flows/analyze-profit-flow'; // Import AI flow

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input"; // For AI chat
import { Textarea } from "@/components/ui/textarea"; // For AI chat
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, BarChart3, LineChart, PieChart, ShoppingBag, Users, Download, MessageCircleQuestion, TrendingUp, SendHorizonal, Loader2 } from 'lucide-react'; 
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

import SalesSummaryCards from '@/components/reports/SalesSummaryCards';
import SalesOverTimeChart from '@/components/reports/SalesOverTimeChart';
import TopItemsChart from '@/components/reports/TopItemsChart';
import CategorySalesChart from '@/components/reports/CategorySalesChart';
import PaymentMethodsChart from '@/components/reports/PaymentMethodsChart';
import TopProfitableItemsChart from '@/components/reports/TopProfitableItemsChart'; // Import new chart
import { ScrollArea } from '@/components/ui/scroll-area';

const defaultPlaceholder = (name = "Item") => `https://placehold.co/300x200.png?text=${encodeURIComponent(name)}`;

const downloadCSV = (data: any[], filename: string, headers: string[]) => {
  if (data.length === 0) { alert("No data available to export."); return; }
  const csvRows = []; csvRows.push(headers.join(','));
  for (const row of data) {
    const values = headers.map(header => {
      let value;
      const keySimple = header.toLowerCase().replace(/\s+/g, '');
      const keyCamelCase = header.replace(/\s+(.)/g, (_match, group1) => group1.toUpperCase()).replace(/\s+/g, '');
      const keyFirstLowerCamelCase = keyCamelCase.charAt(0).toLowerCase() + keyCamelCase.slice(1);

      if (header === 'Invoice Number') value = row.invoiceNumber;
      else if (header === 'Date') value = typeof row.date === 'string' ? format(new Date(row.date), 'yyyy-MM-dd HH:mm') : row.date;
      else if (header === 'Customer Name') value = row.customerName;
      else if (header === 'Phone Number') value = row.customerPhoneNumber;
      else if (header === 'Total Amount') value = typeof row.totalAmount === 'number' ? row.totalAmount.toFixed(2) : row.totalAmount;
      else if (header === 'Payment Method') value = row.paymentMethod;
      else if (header === 'Status') value = row.status;
      else if (header === 'Items (Name & Qty)') value = Array.isArray(row.items) ? row.items.map((item: any) => `${item.name} (Qty: ${item.quantity})`).join('; ') : row.itemsSummary;
      else if (header === 'Subtotal') value = typeof row.subTotal === 'number' ? row.subTotal.toFixed(2) : row.subTotal;
      else if (header === 'Total GST') value = typeof row.gstAmount === 'number' ? row.gstAmount.toFixed(2) : row.gstAmount;
      else if (header === 'ID') value = row.id;
      else if (header === 'Name') value = row.name;
      else if (header === 'Cost Price') value = typeof row.costPrice === 'number' ? row.costPrice.toFixed(2) : row.costPrice;
      else if (header === 'Selling Price') value = typeof row.sellingPrice === 'number' ? row.sellingPrice.toFixed(2) : row.sellingPrice;
      else if (header === 'Barcode') value = row.barcode;
      else if (header === 'Stock') value = row.stock;
      else if (header === 'Category') value = row.category;
      else if (header === 'Description') value = row.description;
      else if (header === 'Service Code') value = row.serviceCode;
      else if (header === 'Duration') value = row.duration;
      else if (header === 'GST Percentage') value = typeof row.gstPercentage === 'number' ? row.gstPercentage : 'N/A'; 
      else { value = row[header] ?? row[keySimple] ?? row[keyCamelCase] ?? row[keyFirstLowerCamelCase]; }
      if (value === undefined || value === null) { value = ''; } else if (typeof value === 'string' && value.includes(',')) { value = `"${value}"`; }
      return value;
    });
    csvRows.push(values.join(','));
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute('href', url); link.setAttribute('download', `${filename}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }
};


export default function ReportsPage() {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);

  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [timeFilter, setTimeFilter] = useState<ReportTimeFilter>('last7days');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { currencySymbol, isSettingsLoaded } = useSettings();
  const { toast } = useToast();

  useEffect(() => {
    if (isSettingsLoaded && typeof window !== 'undefined') {
        const storedProductsString = localStorage.getItem('appProducts');
        let loadedProducts: Product[] = [];
        if(storedProductsString){
            try {
                const parsed = JSON.parse(storedProductsString);
                if(Array.isArray(parsed)){
                    loadedProducts = parsed.map((p: any) => ({
                        id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                        name: p.name || "Unnamed Product",
                        costPrice: typeof p.costPrice === 'number' ? p.costPrice : (typeof p.price === 'number' ? p.price : 0),
                        sellingPrice: typeof p.sellingPrice === 'number' ? p.sellingPrice : 0,
                        stock: typeof p.stock === 'number' ? p.stock : 0,
                        barcode: p.barcode || "",
                        imageUrl: p.imageUrl || defaultPlaceholder(p.name),
                        dataAiHint: p.dataAiHint || (p.name ? p.name.toLowerCase().split(' ').slice(0, 2).join(' ') : 'product image'),
                        category: p.category || undefined,
                        description: p.description || undefined,
                        gstPercentage: typeof p.gstPercentage === 'number' ? p.gstPercentage : 0,
                    }));
                }
            } catch(e) { loadedProducts = []; }
        }
        setAllProducts(loadedProducts);

        const storedServicesString = localStorage.getItem('appServices');
        let loadedServices: Service[] = [];
        if(storedServicesString){
            try {
                const parsed = JSON.parse(storedServicesString);
                if(Array.isArray(parsed)){
                     loadedServices = parsed.map((s: any) => ({
                        id: s.id || `serv-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                        name: s.name || "Unnamed Service",
                        serviceCode: s.serviceCode || undefined,
                        imageUrl: s.imageUrl || defaultPlaceholder(s.name),
                        dataAiHint: s.dataAiHint || (s.name ? s.name.toLowerCase().split(' ').slice(0, 2).join(' ') : 'service image'),
                        category: s.category || undefined,
                        description: s.description || undefined,
                        duration: s.duration || undefined,
                        // costPrice would be 0 for services
                    }));
                }
            } catch(e) { loadedServices = []; }
        }
        setAllServices(loadedServices);

        const storedInvoicesData = localStorage.getItem('appInvoices');
        let loadedAppInvoices: Invoice[] = [];
        if (storedInvoicesData) { 
            try { 
                const parsed = JSON.parse(storedInvoicesData); 
                if (Array.isArray(parsed)) { 
                    loadedAppInvoices = parsed; 
                } else {
                    loadedAppInvoices = [];
                }
            } catch (error) { 
                loadedAppInvoices = []; 
            } 
        }
        
        // Enrich invoices with costPrice for profit calculation
        const enrichedInvoices = loadedAppInvoices.map(inv => ({
            ...inv,
            items: inv.items.map(item => {
                let costPrice = 0;
                if (item.type === 'product') {
                    const productDetails = loadedProducts.find(p => p.id === item.id);
                    costPrice = productDetails?.costPrice || 0;
                }
                // Services have costPrice 0 by default from CartItem creation
                return { ...item, costPrice: item.costPrice || costPrice, category: item.category || 'Uncategorized' };
            })
        }));
        setAllInvoices(enrichedInvoices);
    }
  }, [isSettingsLoaded]);


  useEffect(() => {
    const range: ReportDateRange | undefined = timeFilter === 'custom' && customDateRange ? { from: customDateRange.from, to: customDateRange.to } : undefined;
    const newFilteredInvoices = filterInvoicesByDate(allInvoices, timeFilter, range);
    setFilteredInvoices(newFilteredInvoices);
  }, [allInvoices, timeFilter, customDateRange]);

  const salesSummary = calculateSalesSummary(filteredInvoices);
  const salesOverTimeData = getSalesOverTimeData(filteredInvoices, timeFilter, customDateRange);
  const topSellingItemsData = getTopSellingItemsData(filteredInvoices);
  const topProfitableItemsData = getTopProfitableItemsData(filteredInvoices); // New data
  const salesByCategoryData = getSalesByCategoryData(filteredInvoices);
  const paymentMethodData = getPaymentMethodDistributionData(filteredInvoices);

  const handleExportCustomers = () => {
    const uniqueCustomers: { [key: string]: { customerName: string; customerPhoneNumber?: string } } = {};
    allInvoices.forEach(invoice => { if(invoice.customerName){ const key = `${invoice.customerName}-${invoice.customerPhoneNumber || ''}`; if (!uniqueCustomers[key]) { uniqueCustomers[key] = { customerName: invoice.customerName, customerPhoneNumber: invoice.customerPhoneNumber || 'N/A' }; } } });
    const customerData = Object.values(uniqueCustomers);
    if (customerData.length === 0) { toast({ title: "No Customers to export", variant: "destructive" }); return; }
    downloadCSV(customerData, 'customers_export', ['Customer Name', 'Phone Number']); toast({ title: "Customers Exported" });
  };
  const handleExportInvoices = () => {
    if (filteredInvoices.length === 0) { toast({ title: "No Invoices to export for selected period", variant: "destructive" }); return; }
    const invoiceData = filteredInvoices.map(inv => ({ ...inv, itemsSummary: inv.items.map(i => `${i.name} (Qty:${i.quantity}, Price:${i.price.toFixed(2)})${i.gstPercentage ? ` GST:${i.gstPercentage}%` : ''}`).join('; ') }));
    downloadCSV(invoiceData, 'invoices_export', ['Invoice Number', 'Date', 'Customer Name', 'Phone Number', 'Subtotal', 'Total GST', 'Total Amount', 'Payment Method', 'Status', 'Items (Name & Qty)']); toast({ title: "Invoices Exported" });
  };
  const handleExportProducts = () => {
     if (allProducts.length === 0) { toast({ title: "No Products to export", variant: "destructive" }); return; }
    const productData = allProducts.map(p => ({ ...p, gstPercentage: typeof p.gstPercentage === 'number' ? p.gstPercentage : 'N/A' }));
    downloadCSV(productData, 'products_export', ['ID', 'Name', 'Cost Price', 'Selling Price', 'GST Percentage', 'Barcode', 'Stock', 'Category', 'Description']); toast({ title: "Products Exported" });
  };
  const handleExportServices = () => {
    if (allServices.length === 0) { toast({ title: "No Services to export", variant: "destructive" }); return; }
    downloadCSV(allServices, 'services_export', ['ID', 'Name', 'Service Code', 'Category', 'Description', 'Duration']); toast({ title: "Services Exported" });
  };

  const handleAiQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const input: AnalyzeProfitInput = { query: aiQuery };
      const result: AnalyzeProfitOutput = await analyzeProfit(input);
      setAiResponse(result.analysis);
    } catch (error) {
      console.error("AI Profit Analysis Error:", error);
      setAiResponse("Sorry, I couldn't process your request at this time.");
      toast({ title: "AI Error", description: "Failed to get analysis from AI.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isSettingsLoaded) { return ( <div className="container mx-auto py-4 flex justify-center items-center h-screen"> <BarChart3 className="h-12 w-12 animate-pulse text-primary" /> <p className="ml-4 text-xl">Loading reports...</p> </div> ); }

  return (
    <ScrollArea className="h-full">
    <div className="container mx-auto py-4 space-y-6 pb-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-primary flex items-center gap-2"> <BarChart3 className="h-10 w-10" /> Reports & Insights </h1>
        <p className="text-muted-foreground">Analyze your sales performance and trends.</p>
      </header>
      <Card className="shadow-md">
        <CardHeader> <CardTitle>Filters & Exports</CardTitle> </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Select value={timeFilter} onValueChange={(value) => { setTimeFilter(value as ReportTimeFilter); if (value !== 'custom') setCustomDateRange(undefined); }}>
                    <SelectTrigger className="w-full sm:w-[180px]"> <SelectValue placeholder="Select time range" /> </SelectTrigger>
                    <SelectContent> <SelectItem value="today">Today</SelectItem> <SelectItem value="last7days">Last 7 Days</SelectItem> <SelectItem value="last30days">Last 30 Days</SelectItem> <SelectItem value="thisMonth">This Month</SelectItem> <SelectItem value="allTime">All Time</SelectItem> <SelectItem value="custom">Custom Range</SelectItem> </SelectContent>
                </Select>
                {timeFilter === 'custom' && (
                    <Popover>
                    <PopoverTrigger asChild> <Button variant={"outline"} className="w-full sm:w-auto justify-start text-left font-normal"> <CalendarIcon className="mr-2 h-4 w-4" /> {customDateRange?.from ? (customDateRange.to ? (<>{format(customDateRange.from, "LLL dd, y")} - {format(customDateRange.to, "LLL dd, y")}</>) : (format(customDateRange.from, "LLL dd, y"))) : (<span>Pick a date range</span>)} </Button> </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"> <Calendar initialFocus mode="range" defaultMonth={customDateRange?.from} selected={customDateRange} onSelect={setCustomDateRange} numberOfMonths={2} /> </PopoverContent>
                    </Popover>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleExportCustomers}><Download className="mr-2 h-4 w-4"/>Export Customers</Button>
                <Button variant="outline" onClick={handleExportInvoices}><Download className="mr-2 h-4 w-4"/>Export Invoices</Button>
                <Button variant="outline" onClick={handleExportProducts}><Download className="mr-2 h-4 w-4"/>Export Products</Button>
                <Button variant="outline" onClick={handleExportServices}><Download className="mr-2 h-4 w-4"/>Export Services</Button>
            </div>
        </CardContent>
      </Card>
      <SalesSummaryCards summary={salesSummary} currencySymbol={currencySymbol} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader> <CardTitle className="flex items-center gap-2"><LineChart className="h-6 w-6 text-primary"/>Sales Over Time</CardTitle> </CardHeader>
          <CardContent> {salesOverTimeData.length > 0 ? (<SalesOverTimeChart data={salesOverTimeData} currencySymbol={currencySymbol} />) : <p className="text-muted-foreground text-center py-8">No sales data for selected period.</p>} </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader> <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary"/>Top Selling Items (by Quantity)</CardTitle> </CardHeader>
          <CardContent> {topSellingItemsData.length > 0 ? (<TopItemsChart data={topSellingItemsData} />) : <p className="text-muted-foreground text-center py-8">No item data for selected period.</p>} </CardContent>
        </Card>
        <Card className="shadow-md"> {/* New Chart for Profitable Items */}
          <CardHeader> <CardTitle className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-green-600"/>Top Profitable Items</CardTitle> </CardHeader>
          <CardContent> {topProfitableItemsData.length > 0 ? (<TopProfitableItemsChart data={topProfitableItemsData} />) : <p className="text-muted-foreground text-center py-8">No profit data for items in selected period.</p>} </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader> <CardTitle className="flex items-center gap-2"><PieChart className="h-6 w-6 text-primary"/>Sales by Category</CardTitle> </CardHeader>
          <CardContent> {salesByCategoryData.length > 0 ? (<CategorySalesChart data={salesByCategoryData} currencySymbol={currencySymbol} />) : <p className="text-muted-foreground text-center py-8">No category data for selected period.</p>} </CardContent>
        </Card>
        <Card className="shadow-md lg:col-span-2"> {/* Adjusted span to make space for new chart */}
          <CardHeader> <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>Payment Method Distribution</CardTitle> </CardHeader>
          <CardContent> {paymentMethodData.length > 0 ? (<PaymentMethodsChart data={paymentMethodData} />) : <p className="text-muted-foreground text-center py-8">No payment data for selected period.</p>} </CardContent>
        </Card>
        
        {/* AI Profit Insights Chat Section */}
        <Card className="shadow-md lg:col-span-2">
            <CardHeader> <CardTitle className="flex items-center gap-2"> <MessageCircleQuestion className="h-6 w-6 text-purple-600" /> AI Profit Insights (Chat) </CardTitle> </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAiQuerySubmit} className="flex items-center gap-2">
                <Input 
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask about profits, e.g., 'Most profitable product last month?'"
                  className="flex-grow"
                  disabled={isAiLoading}
                />
                <Button type="submit" disabled={isAiLoading || !aiQuery.trim()}>
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                  <span className="ml-2">Ask AI</span>
                </Button>
              </form>
              {isAiLoading && !aiResponse && (
                <div className="text-muted-foreground flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Thinking...
                </div>
              )}
              {aiResponse && (
                <Textarea 
                  value={aiResponse}
                  readOnly
                  rows={5}
                  className="bg-muted/50 border-border"
                  placeholder="AI analysis will appear here..."
                />
              )}
               {!isAiLoading && !aiResponse && (
                 <p className="text-sm text-muted-foreground text-center py-2">Ask a question to get AI-powered profit insights.</p>
               )}
            </CardContent>
        </Card>
      </div>
    </div>
    </ScrollArea>
  );
}
