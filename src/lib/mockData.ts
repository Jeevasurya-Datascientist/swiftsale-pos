import type { Product, Invoice } from './types';

export const mockProducts: Product[] = [
  {
    id: 'prod001',
    name: 'Fresh Milk 1L',
    price: 2.5,
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
    price: 3.0,
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
    price: 4.5,
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
    price: 15.0,
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
    price: 40.0,
    barcode: 'SWSP005',
    stock: 20,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'denim jeans',
    category: 'Apparel',
    description: 'Dark wash slim fit jeans, waist 32.'
  },
  {
    id: 'prod006',
    name: 'Paracetamol 500mg',
    price: 1.0,
    barcode: 'SWSP006',
    stock: 100,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'medicine pills',
    category: 'Pharmacy',
    description: 'Strip of 10 paracetamol tablets.'
  },
  {
    id: 'prod007',
    name: 'Adhesive Band-Aids',
    price: 2.0,
    barcode: 'SWSP007',
    stock: 75,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'band aid',
    category: 'Pharmacy',
    description: 'Pack of 20 assorted adhesive bandages.'
  },
  {
    id: 'prod008',
    name: 'Chicken Burger',
    price: 8.0,
    barcode: 'SWSP008',
    stock: 0, // Restaurants might not track stock this way, or have ingredients
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'chicken burger',
    category: 'Restaurant',
    description: 'Grilled chicken patty with lettuce and tomato.'
  },
  {
    id: 'prod009',
    name: 'French Fries (Large)',
    price: 3.5,
    barcode: 'SWSP009',
    stock: 0,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'french fries',
    category: 'Restaurant',
    description: 'Crispy large french fries with salt.'
  },
  {
    id: 'prod010',
    name: 'Cola Drink (Can)',
    price: 1.5,
    barcode: 'SWSP010',
    stock: 100,
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'soda can',
    category: 'Groceries',
    description: '330ml can of cola.'
  }
];

// Ensure mockProducts have dataAiHint where imageUrl is a placeholder
mockProducts.forEach(p => {
  if (p.imageUrl && p.imageUrl.startsWith('https://placehold.co') && !p.dataAiHint) {
    p.dataAiHint = p.name.toLowerCase().split(' ').slice(0, 2).join(' ');
  }
});


export const mockInvoices: Invoice[] = [
  {
    id: 'inv001',
    invoiceNumber: 'INV-2024-001',
    customerName: 'John Doe',
    items: [
      { ...mockProducts[0], quantity: 2 },
      { ...mockProducts[1], quantity: 1 },
    ],
    subTotal: (mockProducts[0].price * 2) + mockProducts[1].price,
    gstRate: 0.05, // 5% GST
    gstAmount: ((mockProducts[0].price * 2) + mockProducts[1].price) * 0.05,
    totalAmount: (((mockProducts[0].price * 2) + mockProducts[1].price) * 1.05),
    paymentMethod: 'Cash',
    date: new Date().toISOString(),
  },
  {
    id: 'inv002',
    invoiceNumber: 'INV-2024-002',
    customerName: 'Jane Smith',
    items: [
      { ...mockProducts[3], quantity: 1 },
      { ...mockProducts[4], quantity: 1 },
      { ...mockProducts[9], quantity: 4 },
    ],
    subTotal: mockProducts[3].price + mockProducts[4].price + (mockProducts[9].price * 4),
    gstRate: 0.05,
    gstAmount: (mockProducts[3].price + mockProducts[4].price + (mockProducts[9].price * 4)) * 0.05,
    totalAmount: (mockProducts[3].price + mockProducts[4].price + (mockProducts[9].price * 4)) * 1.05,
    paymentMethod: 'Card',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
];
