
export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl: string; // Now mandatory
  dataAiHint?: string;
}

export interface Product extends BaseItem {
  barcode?: string; // Now optional
  stock: number;
  costPrice: number;
  sellingPrice: number;
}

export interface Service extends BaseItem {
  serviceCode?: string;
  duration?: string;
  sellingPrice: number;
}

export type SearchableItem = (Product | Service) & { price: number };

export interface CartItem {
  id: string;
  name: string;
  price: number; 
  quantity: number;
  imageUrl: string; // Now mandatory
  dataAiHint?: string;
  type: 'product' | 'service';
  category?: string;
  itemSpecificPhoneNumber?: string;

  costPrice?: number; 

  barcode?: string; // Now optional
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

