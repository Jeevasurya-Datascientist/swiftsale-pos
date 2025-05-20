
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
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
import { FileText, ShoppingBag, Lightbulb, CreditCard, Phone, User, DollarSign, AlertCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Digital Wallet'>('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');

  // Payment specific state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState(''); // MM/YY
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [amountReceived, setAmountReceived] = useState<number | string>('');
  const [balanceAmount, setBalanceAmount] = useState(0);

  const { toast } = useToast();
  const { currencySymbol, isSettingsLoaded } = useSettings();

  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 0.05; // 5% GST
  const gstAmount = subTotal * gstRate;
  const totalAmount = subTotal + gstAmount;

  useEffect(() => {
    if (typeof amountReceived === 'number' && totalAmount > 0) {
      setBalanceAmount(amountReceived - totalAmount);
    } else {
      setBalanceAmount(0);
    }
  }, [amountReceived, totalAmount]);

  const handleAmountReceivedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setAmountReceived('');
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setAmountReceived(numValue);
      }
    }
  };

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

    if (newQuantity <= 0) {
        handleRemoveItem(productId);
        return;
    }

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
    if (!customerName.trim()) {
      toast({ title: "Missing Information", description: "Customer Name is required.", variant: "destructive" });
      return;
    }
    if (!customerPhoneNumber.trim()) {
      toast({ title: "Missing Information", description: "Customer Phone Number is required.", variant: "destructive" });
      return;
    }
    // Basic phone number validation (e.g., at least 10 digits)
    if (!/^\d{10,}$/.test(customerPhoneNumber.replace(/\D/g, ''))) {
        toast({ title: "Invalid Phone Number", description: "Please enter a valid phone number (at least 10 digits).", variant: "destructive" });
        return;
    }

    if (paymentMethod === 'Card') {
      if (!cardNumber.trim() || !/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) {
        toast({ title: "Invalid Card Details", description: "Valid Card Number is required.", variant: "destructive" });
        return;
      }
      if (!cardExpiry.trim() || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
        toast({ title: "Invalid Card Details", description: "Valid Card Expiry (MM/YY) is required.", variant: "destructive" });
        return;
      }
      if (!cardCvv.trim() || !/^\d{3,4}$/.test(cardCvv)) {
        toast({ title: "Invalid Card Details", description: "Valid CVV (3 or 4 digits) is required.", variant: "destructive" });
        return;
      }
    }

    if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !/^[\w.-]+@[\w.-]+$/.test(upiId)) { // Basic UPI ID format check
        toast({ title: "Invalid UPI ID", description: "Valid UPI ID is required (e.g., name@bank).", variant: "destructive" });
        return;
      }
    }
    
    const numericAmountReceived = typeof amountReceived === 'string' ? parseFloat(amountReceived) : amountReceived;
    if (typeof numericAmountReceived !== 'number' || isNaN(numericAmountReceived) || numericAmountReceived < 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid Amount Received.", variant: "destructive" });
        return;
    }
    if (numericAmountReceived < totalAmount) {
        toast({ title: "Insufficient Amount", description: `Amount received (${currencySymbol}${numericAmountReceived.toFixed(2)}) is less than total (${currencySymbol}${totalAmount.toFixed(2)}).`, variant: "destructive" });
        return;
    }


    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerName: customerName,
      customerPhoneNumber: customerPhoneNumber,
      items: cartItems,
      subTotal,
      gstRate,
      gstAmount,
      totalAmount,
      paymentMethod,
      date: new Date().toISOString(),
      amountReceived: numericAmountReceived,
      balanceAmount: numericAmountReceived - totalAmount,
    };
    setCurrentInvoice(newInvoice);
    setIsInvoiceDialogOpen(true); 
  };

  const handleFinalizeSaleAndPrint = () => {
    if (!currentInvoice) return;

    // Simulate payment processing
    let paymentSuccessMessage = `Payment of ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)} via ${paymentMethod} successful.`;
    if (paymentMethod === 'Card') {
      paymentSuccessMessage = `Simulated: Card ending with ${cardNumber.slice(-4)} charged ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}.`;
    } else if (paymentMethod === 'UPI') {
      paymentSuccessMessage = `Simulated: UPI request for ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)} sent to ${upiId}.`;
    } else if (paymentMethod === 'Cash' && currentInvoice.balanceAmount && currentInvoice.balanceAmount > 0) {
        paymentSuccessMessage += ` Change due: ${currencySymbol}${currentInvoice.balanceAmount.toFixed(2)}.`;
    }


    const updatedProducts = products.map(p => {
      const cartItem = cartItems.find(ci => ci.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });
    setProducts(updatedProducts); 

    setCartItems([]);
    setCustomerName('');
    setCustomerPhoneNumber('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setUpiId('');
    setAmountReceived('');
    setBalanceAmount(0);
    
    toast({ title: "Sale Finalized!", description: `Invoice ${currentInvoice?.invoiceNumber} generated. Stock updated. ${paymentSuccessMessage}` });
    
    setTimeout(() => {
        window.print();
    }, 100);
    
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
            <CardContent>
              <ScrollArea className="h-[calc(100vh-28rem)] md:h-auto pr-3"> {/* Added ScrollArea */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName" className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" /> Customer Name <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input 
                      id="customerName" 
                      placeholder="e.g., John Doe" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)} 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhoneNumber" className="flex items-center">
                     <Phone className="h-4 w-4 mr-2 text-muted-foreground" /> Customer Phone <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input 
                      id="customerPhoneNumber" 
                      type="tel"
                      placeholder="e.g., 9876543210" 
                      value={customerPhoneNumber}
                      onChange={(e) => setCustomerPhoneNumber(e.target.value)} 
                      required
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
                        <SelectItem value="Card">Credit/Debit Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Digital Wallet">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === 'Card' && (
                    <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                      <p className="text-sm font-medium text-foreground">Enter Card Details <span className="text-destructive ml-1">*</span></p>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="cardExpiry">Expiry (MM/YY)</Label>
                          <Input id="cardExpiry" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input id="cardCvv" placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} type="password" />
                        </div>
                      </div>
                       <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle size={14}/> Card payment is simulated. No real transaction will occur.</p>
                    </div>
                  )}

                  {paymentMethod === 'UPI' && (
                    <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                      <p className="text-sm font-medium text-foreground">Enter UPI ID <span className="text-destructive ml-1">*</span></p>
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input id="upiId" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                      </div>
                       <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle size={14}/> UPI payment is simulated. No real transaction will occur.</p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="amountReceived" className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" /> Amount Received <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input 
                      id="amountReceived" 
                      type="number"
                      placeholder="0.00" 
                      value={amountReceived}
                      onChange={handleAmountReceivedChange}
                      step="0.01"
                    />
                  </div>

                  {totalAmount > 0 && (typeof amountReceived === 'number' && amountReceived >= totalAmount) && (
                    <div className="text-right text-lg">
                      <p>Total: <span className="font-semibold">{currencySymbol}{totalAmount.toFixed(2)}</span></p>
                      <p>Received: <span className="font-semibold">{currencySymbol}{amountReceived.toFixed(2)}</span></p>
                      <p>Balance/Change: <span className={`font-bold ${balanceAmount < 0 ? 'text-destructive' : 'text-green-600'}`}>{currencySymbol}{balanceAmount.toFixed(2)}</span></p>
                    </div>
                  )}
                  {totalAmount > 0 && (typeof amountReceived === 'number' && amountReceived < totalAmount) && (
                     <p className="text-sm text-destructive text-right">Amount received is less than total.</p>
                  )}

                   <Button onClick={handleGenerateInvoice} className="w-full h-12 text-lg" disabled={cartItems.length === 0}>
                    Generate Invoice
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {currentInvoice && (
        <Dialog open={isInvoiceDialogOpen} onOpenChange={(open) => {
            setIsInvoiceDialogOpen(open);
            if(!open) setCurrentInvoice(null); // Clear current invoice when dialog closes
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Preview - {currentInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={currentInvoice} />
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 print-hide pt-4">
              <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (currentInvoice?.customerPhoneNumber) {
                        const message = `Hello ${currentInvoice.customerName || 'Customer'}, here is your invoice ${currentInvoice.invoiceNumber}. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Amount Paid: ${currencySymbol}${(currentInvoice.amountReceived ?? currentInvoice.totalAmount).toFixed(2)}. ${currentInvoice.balanceAmount && currentInvoice.balanceAmount > 0 ? `Change: ${currencySymbol}${currentInvoice.balanceAmount.toFixed(2)}.` : ''} Thank you for your purchase!`;
                        const whatsappUrl = `https://wa.me/${currentInvoice.customerPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                        // window.open(whatsappUrl, '_blank'); // Uncomment to enable actual WhatsApp redirect
                        toast({ title: "WhatsApp Share Simulated", description: `Would open WhatsApp for ${currentInvoice.customerPhoneNumber}. Message: ${message.substring(0,100)}...` });
                      } else {
                        toast({ title: "WhatsApp Share Failed", description: "Customer phone number not available for WhatsApp.", variant: "destructive" });
                      }
                    }}
                    disabled={!currentInvoice?.customerPhoneNumber}
                  >
                    Share via WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (currentInvoice?.customerPhoneNumber) {
                        toast({ title: "SMS Send Simulated", description: `SMS with invoice ${currentInvoice.invoiceNumber} details would be sent to ${currentInvoice.customerPhoneNumber}.` });
                      } else {
                        toast({ title: "SMS Send Failed", description: "Customer phone number not available for SMS.", variant: "destructive" });
                      }
                    }}
                    disabled={!currentInvoice?.customerPhoneNumber}
                  >
                    Send SMS (Simulated)
                  </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
                <Button type="button" onClick={handleFinalizeSaleAndPrint}>Finalize Sale & Print</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

