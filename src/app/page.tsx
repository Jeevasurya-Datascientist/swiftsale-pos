
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import type { Product, Service, CartItem, Invoice, SearchableItem, ExistingCustomer } from '@/lib/types';
import { mockProducts, mockServices, mockInvoices } from '@/lib/mockData';
import { BarcodeInput } from '@/components/dashboard/BarcodeInput';
import { CartDisplay } from '@/components/dashboard/CartDisplay';
import { SmartSuggestions } from '@/components/dashboard/SmartSuggestions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InvoiceView } from '@/components/invoices/InvoiceView';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShoppingBag, CreditCard, Phone, User, DollarSign, AlertCircle, Users } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchableItems, setSearchableItems] = useState<SearchableItem[]>([]);
  const [existingCustomers, setExistingCustomers] = useState<ExistingCustomer[]>([]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Digital Wallet'>('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [amountReceived, setAmountReceived] = useState<number | string>('');
  const [balanceAmount, setBalanceAmount] = useState(0);

  const { toast } = useToast();
  const { currencySymbol, isSettingsLoaded } = useSettings();

  useEffect(() => {
    if (isSettingsLoaded) {
        const storedProducts = localStorage.getItem('appProducts');
        const finalProducts = storedProducts ? JSON.parse(storedProducts) : mockProducts;
        setProducts(finalProducts);

        const storedServices = localStorage.getItem('appServices');
        const finalServices = storedServices ? JSON.parse(storedServices) : mockServices;
        setServices(finalServices);
        
        setSearchableItems([...finalProducts, ...finalServices]);

        const storedInvoices = localStorage.getItem('appInvoices');
        const allInvoices: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : mockInvoices;
        const uniqueCusts: Record<string, ExistingCustomer> = {};
        allInvoices.forEach(inv => {
            if (inv.customerName) {
                const custId = `${inv.customerName.toLowerCase().replace(/\s/g, '_')}-${(inv.customerPhoneNumber || '').replace(/\D/g, '')}`;
                if (!uniqueCusts[custId]) {
                    uniqueCusts[custId] = { 
                        id: custId,
                        name: inv.customerName, 
                        phoneNumber: inv.customerPhoneNumber || '' 
                    };
                }
            }
        });
        setExistingCustomers(Object.values(uniqueCusts).sort((a,b) => a.name.localeCompare(b.name)));
    }
  }, [isSettingsLoaded]);

   useEffect(() => {
    if (isSettingsLoaded && products.length > 0) { 
        localStorage.setItem('appProducts', JSON.stringify(products));
        setSearchableItems([...products, ...services]); 
    }
  }, [products, services, isSettingsLoaded]); 

  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 0.05; 
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

  const handleItemSearch = (identifier: string, itemTypeFromSearch?: 'product' | 'service') => {
    let foundItem: SearchableItem | undefined;

    if (itemTypeFromSearch) { 
        foundItem = searchableItems.find(item => item.id === identifier);
    } else { 
        foundItem = searchableItems.find(
        (item) =>
            item.name.toLowerCase().includes(identifier.toLowerCase()) ||
            ('barcode' in item && item.barcode.toLowerCase() === identifier.toLowerCase()) ||
            ('serviceCode' in item && item.serviceCode?.toLowerCase() === identifier.toLowerCase())
        );
    }


    if (foundItem) {
      const type: 'product' | 'service' = 'barcode' in foundItem ? 'product' : 'service';

      if (type === 'product') {
        const product = foundItem as Product;
        if (product.stock <= 0) {
          toast({ title: "Out of Stock", description: `${product.name} is currently out of stock.`, variant: "destructive" });
          return;
        }
      }

      setCartItems((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === foundItem!.id);
        if (existingItem) {
          if (type === 'product') {
            const product = foundItem as Product;
            if (existingItem.quantity < product.stock) {
              return prevCart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              );
            } else {
              toast({ title: "Stock Limit Reached", description: `Cannot add more ${product.name}. Max stock available.`, variant: "destructive" });
              return prevCart;
            }
          } else { 
            return prevCart.map((item) =>
              item.id === foundItem!.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
        } else { 
          const cartItemToAdd: CartItem = {
            id: foundItem.id,
            name: foundItem.name,
            price: foundItem.price,
            quantity: 1,
            type: type,
            imageUrl: foundItem.imageUrl,
            dataAiHint: foundItem.dataAiHint,
            category: foundItem.category,
            ...(type === 'product' && { barcode: (foundItem as Product).barcode, stock: (foundItem as Product).stock }),
            ...(type === 'service' && { serviceCode: (foundItem as Service).serviceCode, duration: (foundItem as Service).duration }),
          };
          return [...prevCart, cartItemToAdd];
        }
      });
      toast({ title: "Item Added", description: `${foundItem.name} added to cart.` });
    } else {
      toast({ title: "Item Not Found", description: "No product or service matched your search.", variant: "destructive" });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast({ title: "Item Removed", description: "Item removed from cart." });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const cartItem = cartItems.find(ci => ci.id === itemId);
    if (!cartItem) return;

    if (newQuantity <= 0) {
        handleRemoveItem(itemId);
        return;
    }

    if (cartItem.type === 'product' && typeof cartItem.stock === 'number') {
      if (newQuantity > cartItem.stock) {
        toast({ title: "Stock Limit Exceeded", description: `Only ${cartItem.stock} units of ${cartItem.name} available.`, variant: "destructive" });
        setCartItems((prevCart) =>
          prevCart.map((item) => (item.id === itemId ? { ...item, quantity: cartItem.stock! } : item))
        );
        return;
      }
    }
    setCartItems((prevCart) =>
      prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    return `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
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
      if (!upiId.trim() || !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
        toast({ title: "Invalid UPI ID", description: "Valid UPI ID is required (e.g., name@bank).", variant: "destructive" });
        return;
      }
    }
    
    const numericAmountReceived = typeof amountReceived === 'string' || amountReceived === '' ? parseFloat(amountReceived as string) : amountReceived as number;
    if (typeof numericAmountReceived !== 'number' || isNaN(numericAmountReceived) || numericAmountReceived < 0) {
        toast({ title: "Invalid Amount", description: "Please enter a valid Amount Received.", variant: "destructive" });
        return;
    }
    
    const invoiceStatus = numericAmountReceived >= totalAmount ? 'Paid' : 'Due';

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
      status: invoiceStatus,
    };
    setCurrentInvoice(newInvoice);
    setIsInvoiceDialogOpen(true); 

    if (invoiceStatus === 'Due') {
        toast({ 
            title: "Invoice Generated (Payment Due)", 
            description: `Amount received (${currencySymbol}${numericAmountReceived.toFixed(2)}) is less than total (${currencySymbol}${totalAmount.toFixed(2)}). Invoice status: 'Due'.`, 
            variant: "default", // Changed from destructive to default or warning
            duration: 7000 
        });
    }
  };

  const handleFinalizeSaleAndPrint = () => {
    if (!currentInvoice) return;

    let paymentSuccessMessage = `Payment of ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)} via ${paymentMethod} successful.`;
    if (currentInvoice.status === 'Due') {
        paymentSuccessMessage = `Invoice recorded with Due status. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Amount Paid: ${currencySymbol}${currentInvoice.amountReceived?.toFixed(2)}.`;
    } else if (paymentMethod === 'Card') {
      paymentSuccessMessage = `Simulated: Card ending with ${cardNumber.slice(-4)} charged ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}.`;
    } else if (paymentMethod === 'UPI') {
      paymentSuccessMessage = `Simulated: UPI request for ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)} sent to ${upiId}.`;
    } else if (paymentMethod === 'Cash' && currentInvoice.balanceAmount && currentInvoice.balanceAmount > 0) {
        paymentSuccessMessage += ` Change due: ${currencySymbol}${currentInvoice.balanceAmount.toFixed(2)}.`;
    }

    if (currentInvoice.status === 'Paid') {
        const updatedStockProducts = products.map(p => {
        const cartItem = cartItems.find(ci => ci.id === p.id && ci.type === 'product');
        if (cartItem) {
            return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
        });
        setProducts(updatedStockProducts); 
    }
    
    const storedAppInvoices = localStorage.getItem('appInvoices');
    const allAppInvoices: Invoice[] = storedAppInvoices ? JSON.parse(storedAppInvoices) : [];
    allAppInvoices.unshift(currentInvoice);
    localStorage.setItem('appInvoices', JSON.stringify(allAppInvoices));

    setCartItems([]);
    setCustomerName('');
    setCustomerPhoneNumber('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setUpiId('');
    setAmountReceived('');
    setBalanceAmount(0);
    
    toast({ 
        title: currentInvoice.status === 'Paid' ? "Sale Finalized!" : "Invoice Saved (Payment Due)", 
        description: `${paymentSuccessMessage} ${currentInvoice.status === 'Paid' ? 'Stock updated.' : 'Stock not updated.'}`
    });
    
    setTimeout(() => {
        window.print();
    }, 100);
    setCurrentInvoice(null); // Close dialog after print
    setIsInvoiceDialogOpen(false);
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
              <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary"/> Add Items to Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeInput 
                onItemSearch={handleItemSearch} 
                searchableItems={searchableItems}
              />
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
              <ScrollArea className="h-[calc(100vh-28rem)] md:h-auto pr-3">
                <div className="space-y-4">
                <div>
                    <Label htmlFor="existingCustomer" className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" /> Select Existing Customer (Optional)
                    </Label>
                    <Select
                        onValueChange={(value) => {
                        if (value === "new_customer_option") {
                            setCustomerName('');
                            setCustomerPhoneNumber('');
                        } else {
                            const selectedCust = existingCustomers.find(c => c.id === value);
                            if (selectedCust) {
                            setCustomerName(selectedCust.name);
                            setCustomerPhoneNumber(selectedCust.phoneNumber);
                            }
                        }
                        }}
                        value={existingCustomers.find(c=> c.name === customerName && c.phoneNumber === customerPhoneNumber)?.id || "new_customer_option" }
                    >
                        <SelectTrigger id="existingCustomer">
                        <SelectValue placeholder="Search or select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="new_customer_option">-- Add New Customer --</SelectItem>
                        {existingCustomers.map(cust => (
                            <SelectItem key={cust.id} value={cust.id}>
                            {cust.name} {cust.phoneNumber && `(${cust.phoneNumber})`}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>

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

                  {totalAmount > 0 && (
                    <div className="text-right text-lg mt-2 space-y-1">
                      <p>Total: <span className="font-semibold">{currencySymbol}{totalAmount.toFixed(2)}</span></p>
                      {typeof amountReceived === 'number' && amountReceived > 0 &&
                        <p>Received: <span className="font-semibold">{currencySymbol}{Number(amountReceived).toFixed(2)}</span></p>
                      }
                      {typeof amountReceived === 'number' && balanceAmount >= 0 &&
                        <p>Change: <span className="font-bold text-green-600">{currencySymbol}{balanceAmount.toFixed(2)}</span></p>
                      }
                       {typeof amountReceived === 'number' && amountReceived < totalAmount && totalAmount > 0 &&
                        <p className="text-sm text-destructive font-semibold">Balance Due: {currencySymbol}{(totalAmount - amountReceived).toFixed(2)}</p>
                      }
                    </div>
                  )}


                   <Button onClick={handleGenerateInvoice} className="w-full h-12 text-lg mt-4" disabled={cartItems.length === 0}>
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
              <DialogTitle>Invoice Preview - {currentInvoice.invoiceNumber} ({currentInvoice.status || 'N/A'})</DialogTitle>
            </DialogHeader>
            <InvoiceView invoice={currentInvoice} />
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2 print-hide pt-4">
              <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (currentInvoice?.customerPhoneNumber) {
                        const message = `Hello ${currentInvoice.customerName || 'Customer'}, here is your invoice ${currentInvoice.invoiceNumber}. Status: ${currentInvoice.status}. Total: ${currencySymbol}${currentInvoice.totalAmount.toFixed(2)}. Amount Paid: ${currencySymbol}${(currentInvoice.amountReceived ?? 0).toFixed(2)}. ${currentInvoice.status === 'Due' && currentInvoice.amountReceived !== undefined ? `Balance Due: ${currencySymbol}${(currentInvoice.totalAmount - currentInvoice.amountReceived).toFixed(2)}.` : (currentInvoice.balanceAmount && currentInvoice.balanceAmount > 0 ? `Change: ${currencySymbol}${currentInvoice.balanceAmount.toFixed(2)}.` : '')} Thank you for your purchase!`;
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
                <Button type="button" onClick={handleFinalizeSaleAndPrint}>
                    {currentInvoice.status === 'Due' ? 'Save Due Invoice & Print' : 'Finalize Sale & Print'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
