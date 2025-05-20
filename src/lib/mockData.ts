
import type { Product, Service, Invoice, CartItem } from './types';

export const mockProducts: Product[] = [
  {
    id: 'prod001',
    name: 'Fresh Milk 1L',
    price: 50, // INR
    barcode: 'SWSP001',
    stock: 50,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'milk carton',
    category: 'Groceries',
    description: 'Pasteurized full cream milk, 1 liter pack.'
  },
  {
    id: 'prod002',
    name: 'Whole Wheat Bread',
    price: 40, // INR
    barcode: 'SWSP002',
    stock: 30,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'bread loaf',
    category: 'Groceries',
    description: 'Healthy whole wheat bread, sliced.'
  },
  {
    id: 'prod003',
    name: 'Organic Eggs (Dozen)',
    price: 120, // INR
    barcode: 'SWSP003',
    stock: 25,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'egg carton',
    category: 'Groceries',
    description: 'Pack of 12 organic brown eggs.'
  },
  {
    id: 'prod004',
    name: 'Classic Blue T-Shirt',
    price: 500, // INR
    barcode: 'SWSP004',
    stock: 40,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'blue t-shirt',
    category: 'Apparel',
    description: 'Comfortable cotton t-shirt, size M.'
  },
  {
    id: 'prod005',
    name: 'Slim Fit Jeans',
    price: 1500, // INR
    barcode: 'SWSP005',
    stock: 20,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'denim jeans',
    category: 'Apparel',
    description: 'Dark wash slim fit jeans, waist 32.'
  },
  {
    id: 'prod010',
    name: 'Cola Drink (Can)',
    price: 35, // INR
    barcode: 'SWSP010',
    stock: 100,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'soda can',
    category: 'Beverages',
    description: '330ml can of cola.'
  }
];

export const mockServices: Service[] = [
  {
    id: 'serv001',
    name: 'Basic Haircut',
    price: 200, // INR
    serviceCode: 'SERVHC01',
    category: 'Salon',
    description: 'Standard haircut for men or women.',
    duration: '30 minutes',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'haircut salon'
  },
  {
    id: 'serv002',
    name: 'Software Consultation',
    price: 2500, // INR
    serviceCode: 'SERVCONS01',
    category: 'IT Services',
    description: 'One hour software consultation.',
    duration: '1 hour',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'software consultation'
  },
  {
    id: 'serv003',
    name: 'Express Car Wash',
    price: 400, // INR
    serviceCode: 'SERVCW01',
    category: 'Automotive',
    description: 'Quick exterior car wash.',
    duration: '20 minutes',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'car wash'
  }
];

mockProducts.forEach(p => {
  if (p.imageUrl && p.imageUrl.startsWith('https://placehold.co') && !p.dataAiHint) {
    p.dataAiHint = p.name.toLowerCase().split(' ').slice(0, 2).join(' ');
  }
});
mockServices.forEach(s => {
  if (s.imageUrl && s.imageUrl.startsWith('https://placehold.co') && !s.dataAiHint) {
    s.dataAiHint = s.name.toLowerCase().split(' ').slice(0, 2).join(' ');
  }
});

const productToCartItem = (product: Product, quantity: number): CartItem => ({
  ...product,
  quantity,
  type: 'product',
});

const serviceToCartItem = (service: Service, quantity: number): CartItem => ({
  ...service,
  quantity,
  type: 'service',
});

const defaultGstRate = 0.05; // 5%

export const mockInvoices: Invoice[] = [
  {
    id: 'inv001',
    invoiceNumber: 'INV-20240701-001',
    customerName: 'John Doe',
    items: [
      productToCartItem(mockProducts[0], 2), 
      productToCartItem(mockProducts[1], 1), 
    ],
    subTotal: (mockProducts[0].price * 2) + mockProducts[1].price,
    gstRate: defaultGstRate,
    gstAmount: ((mockProducts[0].price * 2) + mockProducts[1].price) * defaultGstRate,
    totalAmount: (((mockProducts[0].price * 2) + mockProducts[1].price) * (1 + defaultGstRate)),
    paymentMethod: 'Cash',
    date: new Date(Date.now() - 86400000 * 5).toISOString(), 
    amountReceived: (((mockProducts[0].price * 2) + mockProducts[1].price) * (1 + defaultGstRate)),
    balanceAmount: 0,
    status: 'Paid',
    shopName: 'SwiftSale POS',
  },
  {
    id: 'inv002',
    invoiceNumber: 'INV-20240703-001',
    customerName: 'Jane Smith',
    customerPhoneNumber: '9876543210',
    items: [
      productToCartItem(mockProducts[3], 1), 
      serviceToCartItem(mockServices[0], 1), 
      productToCartItem(mockProducts[5], 4), 
    ],
    subTotal: mockProducts[3].price + mockServices[0].price + (mockProducts[5].price * 4),
    gstRate: defaultGstRate,
    gstAmount: (mockProducts[3].price + mockServices[0].price + (mockProducts[5].price * 4)) * defaultGstRate,
    totalAmount: (mockProducts[3].price + mockServices[0].price + (mockProducts[5].price * 4)) * (1 + defaultGstRate),
    paymentMethod: 'Card',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), 
    amountReceived: (mockProducts[3].price + mockServices[0].price + (mockProducts[5].price * 4)) * (1 + defaultGstRate),
    balanceAmount: 0,
    status: 'Paid',
    shopName: 'SwiftSale POS',
  },
  {
    id: 'inv003',
    invoiceNumber: 'INV-20240704-001',
    customerName: 'Alice Brown',
    items: [
      productToCartItem(mockProducts[2], 2), 
      productToCartItem(mockProducts[4], 1), 
      serviceToCartItem(mockServices[2], 1), 
    ],
    subTotal: (mockProducts[2].price * 2) + mockProducts[4].price + mockServices[2].price,
    gstRate: defaultGstRate,
    gstAmount: ((mockProducts[2].price * 2) + mockProducts[4].price + mockServices[2].price) * defaultGstRate,
    totalAmount: (((mockProducts[2].price * 2) + mockProducts[4].price + mockServices[2].price) * (1 + defaultGstRate)),
    paymentMethod: 'UPI',
    date: new Date(Date.now() - 86400000 * 1).toISOString(), 
    amountReceived: (((mockProducts[2].price * 2) + mockProducts[4].price + mockServices[2].price) * (1 + defaultGstRate)) - 100, // Underpaid
    balanceAmount: -100,
    status: 'Due',
    shopName: 'SwiftSale POS',
  },
    {
    id: 'inv004',
    invoiceNumber: 'INV-20240615-001',
    customerName: 'Bob Green',
    items: [
      serviceToCartItem(mockServices[1], 1), 
      productToCartItem(mockProducts[0], 5), 
    ],
    subTotal: mockServices[1].price + (mockProducts[0].price * 5),
    gstRate: defaultGstRate,
    gstAmount: (mockServices[1].price + (mockProducts[0].price * 5)) * defaultGstRate,
    totalAmount: (mockServices[1].price + (mockProducts[0].price * 5)) * (1 + defaultGstRate),
    paymentMethod: 'Digital Wallet',
    date: new Date(Date.now() - 86400000 * 20).toISOString(), 
    amountReceived: (mockServices[1].price + (mockProducts[0].price * 5)) * (1 + defaultGstRate),
    balanceAmount: 0,
    status: 'Paid',
    shopName: 'SwiftSale POS',
  },
  {
    id: 'inv005',
    invoiceNumber: 'INV-20240705-001', 
    customerName: 'Eve Davis',
    customerPhoneNumber: '9988776655',
    items: [
      productToCartItem(mockProducts[5], 10), 
    ],
    subTotal: mockProducts[5].price * 10,
    gstRate: defaultGstRate,
    gstAmount: (mockProducts[5].price * 10) * defaultGstRate,
    totalAmount: (mockProducts[5].price * 10) * (1 + defaultGstRate),
    paymentMethod: 'Cash',
    date: new Date().toISOString(), 
    amountReceived: (mockProducts[5].price * 10) * (1 + defaultGstRate) + 50, 
    balanceAmount: 50,
    status: 'Paid',
    shopName: 'SwiftSale POS',
  }
];

mockInvoices.forEach(invoice => {
  invoice.items.forEach(item => {
    if (!item.category) {
      const masterItem = [...mockProducts, ...mockServices].find(mi => mi.id === item.id);
      item.category = masterItem?.category || 'Uncategorized';
    }
  });
});

if (typeof window !== 'undefined') {
    if (!localStorage.getItem('appInvoices')) {
        localStorage.setItem('appInvoices', JSON.stringify(mockInvoices));
    }
    if (!localStorage.getItem('appProducts')) {
        localStorage.setItem('appProducts', JSON.stringify(mockProducts));
    }
    if (!localStorage.getItem('appServices')) {
        localStorage.setItem('appServices', JSON.stringify(mockServices));
    }
}
