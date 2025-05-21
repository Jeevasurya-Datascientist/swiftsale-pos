
export interface BaseBillable {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface Product extends BaseBillable {
  barcode: string;
  stock: number;
}

export interface Service extends BaseBillable {
  serviceCode?: string; // Barcode equivalent for services, optional
  duration?: string; // e.g., "1 hour", "30 mins"
  // Services typically don't have 'stock'
}

// Item that can be searched and added to the cart
export type SearchableItem = Product | Service;

// Item as it appears in the cart
export interface CartItem {
  id: string; // Unique ID from Product or Service
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  dataAiHint?: string;
  type: 'product' | 'service'; // Differentiator
  category?: string; // Added for reporting
  itemSpecificPhoneNumber?: string; // New optional field for service specific phone

  // Product-specific properties, optional in CartItem
  barcode?: string;
  stock?: number; // Original stock for validation, only for products

  // Service-specific properties, optional in CartItem
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

// For charts
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

// Changed from "type ReportTimeFilter" to "export type ReportTimeFilter" for use in invoices page
export type ReportTimeFilter = "today" | "last7days" | "last30days" | "thisMonth" | "allTime" | "custom";

// Changed from "interface ReportDateRange" to "export type DateRange" for use in invoices page (matching react-day-picker)
export type DateRange = {
    from: Date | undefined;
    to: Date | undefined;
};

export interface ExistingCustomer {
  name: string;
  phoneNumber: string;
  id: string; 
}

