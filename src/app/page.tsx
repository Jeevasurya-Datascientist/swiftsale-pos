
"use client";

import { useState, useEffect } from 'react';
import type { Product, CartItem, Invoice } from '@/lib/types';
import { mockProducts } from '@/lib/mockData';
import { BarcodeInput } from '@/components/dashboard/BarcodeInput';
import { CartDisplay } from '@/components/dashboard/CartDisplay';
import { SmartSuggestions } from '@/components/dashboard/SmartSuggestions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InvoiceView } from '@/components/invoices/InvoiceView';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShoppingBag, Lightbulb, CreditCard } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Digital Wallet'>('Cash');
  const [customerName, setCustomerName] = useState('');

  const { toast } = useToast();
  const { currencySymbol, isSettingsLoaded } = useSettings();

  const handleProductSearch = (searchTerm: string) => {
    const foundProduct = products.find(
      (p) => p.barcode.toLowerCase() === searchTerm.toLowerCase() || p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (foundProduct) {
      if (foundProduct.stock <= 0) {
        toast({ title: "Out of Stock", description: `${foundProduct.name} is currently out of stock.`, variant: "destructive" });
        return;
      }

      setCartItems((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === foundProduct.id);
        if (existingItem) {
          if (existingItem.quantity < foundProduct.stock) {
            return prevCart.map((item) =>
              item.id === foundProduct.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            toast({ title: "Stock Limit Reached", description: `Cannot add more ${foundProduct.name}. Max stock available.`, variant: "destructive" });
            return prevCart;
          }
        } else {
          return [...prevCart, { ...foundProduct, quantity: 1 }];
        }
      });
      toast({ title: "Item Added", description: `${foundProduct.name} added to cart.` });
    } else {
      toast({ title: "Product Not Found", description: "No product matched your search.", variant: "destructive" });
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast({ title: "Item Removed", description: "Item removed from cart." });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast({ title: "Stock Limit Exceeded", description: `Only ${product.stock} units of ${product.name} available.`, variant: "destructive" });
      setCartItems((prevCart) =>
        prevCart.map((item) => (item.id === productId ? { ...item, quantity: product.stock } : item))
      );
      return;
    }

    setCartItems((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    return `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };
  
  const handleGenerateInvoice = () => {
    if (cartItems.length === 0) {
      toast({ title: "Empty Cart", description: "Cannot generate invoice for an empty cart.", variant: "destructive" });
      return;
    }

    const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gstRate = 0.05; // 5% GST
    const gstAmount = subTotal * gstRate;
    const totalAmount = subTotal + gstAmount;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerName: customerName || "Walk-in Customer",
      items: cartItems,
      subTotal,
      gstRate,
      gstAmount,
      totalAmount,
      paymentMethod,
      date: new Date().toISOString(),
    };
    setCurrentInvoice(newInvoice);
    setIsInvoiceDialogOpen(true); // Open the dialog
  };

  const handleFinalizeSale = () => {
     // Update stock levels
    const updatedProducts = products.map(p => {
      const cartItem = cartItems.find(ci => ci.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    setProducts(updatedProducts); // This would ideally be an API call

    // Clear cart and customer name
    setCartItems([]);
    setCustomerName('');
    setIsInvoiceDialogOpen(false); // Close the dialog
    setCurrentInvoice(null);
    toast({ title: "Sale Finalized!", description: `Invoice ${currentInvoice?.invoiceNumber} generated. Stock updated.` });
  };


  const cartItemNames = cartItems.map(item => item.name);
  
  if (!isSettingsLoaded) {
    return (
      <div className="container mx-auto py-4 flex justify-center items-center h-screen">
        <ShoppingBag className="h-12 w-12 animate-pulse text-primary" />
         <p className="ml-4 text-xl">Loading POS...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
          <ShoppingBag className="h-10 w-10" /> SwiftSale POS - Billing
        </h1>
        <p className="text-muted-foreground">Fast, smart, and efficient point of sale.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary"/> Add Products to Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeInput onProductSearch={handleProductSearch} />
            </CardContent>
          </Card>
          
          <CartDisplay 
            cartItems={cartItems} 
            onRemoveItem={handleRemoveItem} 
            onUpdateQuantity={handleUpdateQuantity} 
            currencySymbol={currencySymbol}
          />
        </div>

        <div className="space-y-6">
          <SmartSuggestions cartItemNames={cartItemNames} />
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-6 w-6 text-primary"/> Finalize Sale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input 
                  id="customerName" 
                  placeholder="e.g., John Doe" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Credit/Debit Card</SelectItem>
                    <SelectItem value="Digital Wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <Button onClick={handleGenerateInvoice} className="w-full h-12 text-lg" disabled={cartItems.length === 0}>
                Generate Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {currentInvoice && (
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {currentInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={currentInvoice} /> {/* Currency symbol now comes from context within InvoiceView */}
            <DialogFooter className="sm:justify-between gap-2 print-hide">
               <Button type="button" variant="outline" onClick={() => {
                 toast({ title: "WhatsApp Share Simulated", description: "Invoice would be shared via WhatsApp."});
               }}>
                Share via WhatsApp (Simulated)
              </Button>
              <div className="flex gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
                <Button type="button" onClick={handleFinalizeSale}>Finalize Sale & Print</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
