
import type { Invoice, CartItem, ReportTimeFilter, TimeSeriesDataPoint, KeyValueDataPoint, ReportDateRange } from './types';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO, isWithinInterval, differenceInDays } from 'date-fns';

export const filterInvoicesByDate = (
  invoices: Invoice[],
  filter: ReportTimeFilter,
  customRange?: ReportDateRange
): Invoice[] => {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  switch (filter) {
    case 'today':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case 'last7days':
      startDate = startOfDay(subDays(now, 6));
      endDate = endOfDay(now);
      break;
    case 'last30days':
      startDate = startOfDay(subDays(now, 29));
      endDate = endOfDay(now);
      break;
    case 'thisMonth':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'custom':
      if (customRange?.from) {
        startDate = startOfDay(customRange.from);
        endDate = customRange.to ? endOfDay(customRange.to) : endOfDay(customRange.from);
      } else {
        // If custom range is not fully defined, it might mean "all time" or no filter if not handled upstream.
        // For safety, let's return all invoices if the custom range isn't valid.
        return invoices;
      }
      break;
    case 'allTime':
    default:
      return invoices;
  }

  if (!startDate || !endDate) return invoices; // Should not happen if logic is correct

  return invoices.filter(invoice => {
    const invoiceDate = parseISO(invoice.date); // Assuming invoice.date is ISO string
    return isWithinInterval(invoiceDate, { start: startDate!, end: endDate! });
  });
};

export const calculateSalesSummary = (invoices: Invoice[]) => {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalSales = invoices.length;
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const totalItemsSold = invoices.reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  const totalProfit = invoices.reduce((sum, inv) => {
    const invoiceProfit = inv.items.reduce((itemProfitSum, item) => {
      const cost = item.costPrice || 0; // costPrice is on CartItem
      const profitPerItem = (item.price - cost) * item.quantity;
      return itemProfitSum + profitPerItem;
    }, 0);
    return sum + invoiceProfit;
  }, 0);

  return { totalRevenue, totalSales, averageSaleValue, totalItemsSold, totalProfit };
};

export const getSalesOverTimeData = (invoices: Invoice[], filter: ReportTimeFilter, customRange?: ReportDateRange): TimeSeriesDataPoint[] => {
  const salesByDate: Record<string, number> = {};

  invoices.forEach(invoice => {
    const dateKey = format(parseISO(invoice.date), 'yyyy-MM-dd');
    salesByDate[dateKey] = (salesByDate[dateKey] || 0) + invoice.totalAmount;
  });

  const sortedDates = Object.keys(salesByDate).sort();

  let dateFormatStr = 'MMM dd'; // Default
  if (filter === 'today') {
     // For 'today', if you want hourly, the data aggregation needs to be much more granular.
     // Sticking to daily for now.
     dateFormatStr = 'MMM dd'; 
  } else if (filter === 'last7days') {
    dateFormatStr = 'EEE, MMM dd';
  } else if (filter === 'last30days' || filter === 'thisMonth') {
     dateFormatStr = 'MMM dd';
  } else if (filter === 'custom' && customRange?.from && customRange.to) {
    const days = differenceInDays(customRange.to, customRange.from);
    if (days <= 1) dateFormatStr = 'MMM dd'; // Could be hourly if data supports
    else if (days <= 7) dateFormatStr = 'EEE, MMM dd';
    else if (days <= 90) dateFormatStr = 'MMM dd'; // Up to 3 months, show day
    else dateFormatStr = 'MMM yy'; // Longer than 3 months, show month/year
  } else if (filter === 'allTime' && sortedDates.length > 0) {
    const firstDate = parseISO(sortedDates[0]);
    const lastDate = parseISO(sortedDates[sortedDates.length-1]);
    const days = differenceInDays(lastDate, firstDate);
    if (days <= 1) dateFormatStr = 'MMM dd';
    else if (days <= 7) dateFormatStr = 'EEE, MMM dd';
    else if (days <= 90) dateFormatStr = 'MMM dd';
    else dateFormatStr = 'MMM yy';
  }


  return sortedDates.map(date => ({
    date: format(parseISO(date), dateFormatStr),
    value: parseFloat(salesByDate[date].toFixed(2)),
  }));
};

export const getTopSellingItemsData = (invoices: Invoice[], limit: number = 5): KeyValueDataPoint[] => {
  const itemCounts: Record<string, { name: string, value: number, type: 'product' | 'service' }> = {};
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      if (itemCounts[item.id]) {
        itemCounts[item.id].value += item.quantity;
      } else {
        itemCounts[item.id] = { name: item.name, value: item.quantity, type: item.type };
      }
    });
  });

  return Object.values(itemCounts)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map(item => ({ name: `${item.name} (${item.type.charAt(0).toUpperCase() + item.type.slice(1)})`, value: item.value }));
};


export const getSalesByCategoryData = (invoices: Invoice[]): KeyValueDataPoint[] => {
  const categorySales: Record<string, number> = {};
  const categoryColors: string[] = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  let colorIndex = 0;

  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const category = item.category || 'Uncategorized';
      // item.price is sellingPrice (pre-GST for products, manually entered for services)
      categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
    });
  });

  return Object.entries(categorySales)
    .sort(([, aValue], [, bValue]) => bValue - aValue) // Sort by value descending
    .map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      fill: categoryColors[colorIndex++ % categoryColors.length]
  }));
};

export const getPaymentMethodDistributionData = (invoices: Invoice[]): KeyValueDataPoint[] => {
  const paymentDistribution: Record<string, number> = {};
   const paymentColors: string[] = [ // Define distinct colors
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))', // Added one more for potential 'Digital Wallet'
  ];
  let colorIndex = 0;

  invoices.forEach(invoice => {
    paymentDistribution[invoice.paymentMethod] = (paymentDistribution[invoice.paymentMethod] || 0) + 1;
  });

  return Object.entries(paymentDistribution)
    .sort(([, aValue], [, bValue]) => bValue - aValue) // Sort by count descending
    .map(([name, value]) => ({
    name,
    value,
    fill: paymentColors[colorIndex++ % paymentColors.length] // Assign color explicitly
  }));
};

export const getTopProfitableItemsData = (invoices: Invoice[], limit: number = 5): KeyValueDataPoint[] => {
  const itemProfits: Record<string, { name: string; totalProfit: number; type: 'product' | 'service' }> = {};

  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const cost = item.costPrice || 0;
      const profitForItemInstance = (item.price - cost) * item.quantity;
      
      if (itemProfits[item.id]) {
        itemProfits[item.id].totalProfit += profitForItemInstance;
      } else {
        itemProfits[item.id] = {
          name: item.name,
          totalProfit: profitForItemInstance,
          type: item.type,
        };
      }
    });
  });

  return Object.values(itemProfits)
    .sort((a, b) => b.totalProfit - a.totalProfit) // Sort by profit descending
    .slice(0, limit)
    .map(item => ({
      name: `${item.name} (${item.type.charAt(0).toUpperCase() + item.type.slice(1)})`,
      value: parseFloat(item.totalProfit.toFixed(2)), // value is the total profit
    }));
};
