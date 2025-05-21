
export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface Product extends BaseItem {
  barcode: string;
  stock: number;
  costPrice: number; // Price shop owner pays
  sellingPrice: number; // Price customer pays
}

export interface Service extends BaseItem {
  serviceCode?: string;
  duration?: string;
  sellingPrice: number; // Price customer pays (cost assumed 0 for now for services)
}

export type SearchableItem = (Product | Service) & { price: number }; // price here refers to sellingPrice for display in grid

export interface CartItem {
  id: string;
  name: string;
  price: number; // This is the sellingPrice
  quantity: number;
  imageUrl?: string;
  dataAiHint?: string;
  type: 'product' | 'service';
  category?: string;
  itemSpecificPhoneNumber?: string;

  costPrice?: number; // Only for products, for profit calculation

  barcode?: string;
  stock?: number;

  serviceCode?: string;
  duration?: string;
}


export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhoneNumber?: string;
  items: CartItem[];
  subTotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Digital Wallet';
  date: string; // ISO string
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
  gstRate: number;
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

export type ReportDateRange = { // Changed from DateRange to avoid conflict with react-day-picker's DateRange
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
  timestamp: string; // ISO string
  read: boolean;
  link?: string;
}
