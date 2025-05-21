
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
        return invoices;
      }
      break;
    case 'allTime':
    default:
      return invoices;
  }

  if (!startDate || !endDate) return invoices;

  return invoices.filter(invoice => {
    const invoiceDate = parseISO(invoice.date);
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
      const cost = item.costPrice || 0; // Assume cost is 0 if not defined (e.g., for services)
      const profitPerItem = (item.price - cost) * item.quantity; // item.price is sellingPrice
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

  let dateFormatStr = 'MMM dd';
  if (filter === 'today') {
    dateFormatStr = 'MMM dd'; // Simplified for daily summary even if 'today'
  } else if (filter === 'last7days') {
    dateFormatStr = 'EEE, MMM dd';
  } else if (filter === 'custom' && customRange?.from && customRange.to) {
    const days = differenceInDays(customRange.to, customRange.from);
    if (days <= 7) dateFormatStr = 'EEE, MMM dd';
    else if (days <= 31) dateFormatStr = 'MMM dd';
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
      categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity); // item.price is sellingPrice
    });
  });

  return Object.entries(categorySales).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
    fill: categoryColors[colorIndex++ % categoryColors.length]
  }));
};

export const getPaymentMethodDistributionData = (invoices: Invoice[]): KeyValueDataPoint[] => {
  const paymentDistribution: Record<string, number> = {};
   const paymentColors: string[] = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
  ];
  let colorIndex = 0;

  invoices.forEach(invoice => {
    paymentDistribution[invoice.paymentMethod] = (paymentDistribution[invoice.paymentMethod] || 0) + 1;
  });

  return Object.entries(paymentDistribution).map(([name, value]) => ({
    name,
    value,
    fill: paymentColors[colorIndex++ % paymentColors.length]
  }));
};
