
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
  gstPercentage: number; // New: Product-specific GST rate
}

export interface Service extends BaseItem {
  serviceCode?: string;
  duration?: string;
  // sellingPrice: number; // Removed: Price is now dynamic at point of sale
}

export type SearchableItem = (Omit<Product, 'gstPercentage'> | Service) & { price: number; type: 'product' | 'service'; gstPercentage?: number }; // Added gstPercentage for product items

export interface CartItem {
  id: string;
  name: string;
  price: number; // This will be the manually entered service charge for services, or sellingPrice for products
  quantity: number;
  imageUrl: string;
  dataAiHint?: string;
  type: 'product' | 'service';
  category?: string;
  itemSpecificPhoneNumber?: string;
  itemSpecificNote?: string;
  isPriceOverridden?: boolean;

  costPrice?: number; // For products, to calculate profit
  gstPercentage?: number; // For products, specific GST rate

  barcode?: string;
  stock?: number;

  serviceCode?: string;
  duration?: string;
}


export interface Invoice {
  id:string;
  invoiceNumber: string;
  customerName: string;
  customerPhoneNumber?: string;
  items: CartItem[];
  subTotal: number;
  // gstRate: number; // Removed: GST is now item-specific for products
  gstAmount: number; // This will be the SUM of GST from all applicable items
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
  // gstRate: number; // Removed: Global GST rate is no longer used
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
