
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
  items: CartItem[]; // Updated to use the new CartItem type
  subTotal: number;
  gstRate: number; // e.g., 0.18 for 18%
  gstAmount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Digital Wallet';
  date: string; // ISO string
  amountReceived?: number; // Amount paid by customer
  balanceAmount?: number; // Change given back, if any
  status?: 'Paid' | 'Due'; // Status of the invoice
}

export interface AppSettings {
  shopName: string;
  shopLogoUrl: string;
  shopAddress: string;
  currencySymbol: string;
  userName: string;
}

// For charts
export interface TimeSeriesDataPoint {
  date: string; // e.g., "YYYY-MM-DD" or "Mon", "Tue"
  value: number;
  [key: string]: any; // For additional properties like different series
}

export interface KeyValueDataPoint {
  name: string;
  value: number;
  fill?: string; // For pie chart colors
  [key: string]: any;
}

export type ReportTimeFilter = "today" | "last7days" | "last30days" | "thisMonth" | "allTime" | "custom";

export interface ReportDateRange {
    from: Date | undefined;
    to: Date | undefined;
}

export interface ExistingCustomer {
  name: string;
  phoneNumber: string;
  id: string; // A unique ID for the customer, e.g., name-phone
}
