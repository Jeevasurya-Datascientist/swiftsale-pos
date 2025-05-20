
import type { Invoice, CartItem, ReportTimeFilter, TimeSeriesDataPoint, KeyValueDataPoint } from './types';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

export const filterInvoicesByDate = (
  invoices: Invoice[],
  filter: ReportTimeFilter,
  customRange?: { from: Date | undefined; to: Date | undefined }
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
      startDate = startOfDay(subDays(now, 6)); // Includes today
      endDate = endOfDay(now);
      break;
    case 'last30days':
      startDate = startOfDay(subDays(now, 29)); // Includes today
      endDate = endOfDay(now);
      break;
    case 'thisMonth':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'allTime':
      return invoices; // No date filtering
    default: // Handles custom range via customRange prop
      if (customRange?.from && customRange?.to) {
        startDate = startOfDay(customRange.from);
        endDate = endOfDay(customRange.to);
      } else if (customRange?.from) {
        startDate = startOfDay(customRange.from);
        endDate = endOfDay(customRange.from); // If only 'from' is selected, filter for that single day
      } else {
        return invoices; // No valid custom range
      }
  }

  if (!startDate || !endDate) return invoices; // Should not happen if logic is correct

  return invoices.filter(invoice => {
    const invoiceDate = parseISO(invoice.date);
    return isWithinInterval(invoiceDate, { start: startDate!, end: endDate! });
  });
};

export const calculateSalesSummary = (invoices: Invoice[]) => {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalSales = invoices.length;
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  return { totalRevenue, totalSales, averageSaleValue };
};

export const getSalesOverTimeData = (invoices: Invoice[], filter: ReportTimeFilter): TimeSeriesDataPoint[] => {
  const salesByDate: Record<string, number> = {};

  invoices.forEach(invoice => {
    const dateKey = format(parseISO(invoice.date), 'yyyy-MM-dd');
    salesByDate[dateKey] = (salesByDate[dateKey] || 0) + invoice.totalAmount;
  });

  const sortedDates = Object.keys(salesByDate).sort();
  
  let dateFormatStr = 'MMM dd';
  if (filter === 'last7days' || filter === 'today') dateFormatStr = 'EEE'; // Day of week for shorter periods
  else if (filter === 'last30days' || filter === 'thisMonth') dateFormatStr = 'dd'; // Day of month

  const dataPoints = sortedDates.map(date => ({
    date: format(parseISO(date), dateFormatStr),
    value: parseFloat(salesByD<ctrl63>