
export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl: string;
  dataAiHint?: string;
}

export interface Product extends BaseItem {
  barcode?: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  gstPercentage: number; 
}

export interface Service extends BaseItem {
  serviceCode?: string;
  duration?: string;
  // sellingPrice removed - price is dynamic via ServiceDetailsDialog
}

export type SearchableItem = 
  (Omit<Product, 'gstPercentage'> & { price: number; type: 'product'; gstPercentage: number; costPrice: number; stock: number; barcode?: string; }) | 
  (Service & { price: number; type: 'service'; costPrice: 0 }); // Explicitly add costPrice:0 for services in SearchableItem for profit calcs

export interface CartItem {
  id: string;
  name: string;
  price: number; 
  quantity: number;
  imageUrl: string;
  dataAiHint?: string;
  type: 'product' | 'service';
  category?: string;
  itemSpecificPhoneNumber?: string;
  itemSpecificNote?: string;
  isPriceOverridden?: boolean;

  costPrice: number; // For products and services (0 for services)
  gstPercentage?: number; // For products, specific GST rate

  barcode?: string; // product only
  stock?: number; // product only

  serviceCode?: string; // service only
  duration?: string; // service only
}


export interface Invoice {
  id:string;
  invoiceNumber: string;
  customerName: string;
  customerPhoneNumber?: string;
  items: CartItem[];
  subTotal: number;
  gstAmount: number; 
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Digital Wallet';
  date: string;
  amountReceived: number;
  balanceAmount: number;
  status: 'Paid' | 'Due';
  shopName?: string;
}

export interface AppSettings {
  shopName: string;
  shopLogoUrl: string;
  shopAddress: string;
  currencySymbol: string;
  userName: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface KeyValueDataPoint {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

export type ReportTimeFilter = "today" | "last7days" | "last30days" | "thisMonth" | "allTime" | "custom";

export type ReportDateRange = {
    from: Date | undefined;
    to: Date | undefined;
};


export interface ExistingCustomer {
  name: string;
  phoneNumber: string;
  id: string;
}

export interface NotificationItem {
  id: string;
  type: 'lowStock' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// AI Profit Analysis Flow Types
export interface AnalyzeProfitInput {
  query: string;
  // Potentially add filteredInvoices, products, services if sending data to flow
}
export interface AnalyzeProfitOutput {
  analysis: string;
}
