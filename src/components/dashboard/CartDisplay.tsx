
"use client";

import type { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { X, Plus, Minus, Package, ConciergeBell, Phone, MessageSquareText } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CartDisplayProps {
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onUpdateItemPhoneNumber: (itemId: string, phoneNumber: string) => void;
  onUpdateItemNote: (itemId: string, note: string) => void;
  currencySymbol: string;
  // gstRatePercentage removed, GST is now item specific for products
}

export function CartDisplay({
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateItemPhoneNumber,
  onUpdateItemNote,
  currencySymbol,
  // gstRatePercentage // Removed
}: CartDisplayProps) {
  
  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const totalGstAmount = cartItems.reduce((gstSum, item) => {
    if (item.type === 'product' && typeof item.gstPercentage === 'number' && item.gstPercentage > 0) {
      const itemGst = (item.price * item.quantity * item.gstPercentage) / 100;
      return gstSum + itemGst;
    }
    return gstSum;
  }, 0);
  
  const totalAmount = subTotal + totalGstAmount;

  if (cartItems.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader> <CardTitle>Shopping Cart</CardTitle> </CardHeader>
        <CardContent> <p className="text-muted-foreground text-center py-8">Your cart is empty.</p> </CardContent>
      </Card>
    );
  }

  const handleQuantityInputChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity)) { onUpdateQuantity(itemId, newQuantity); } 
    else if (value === "") { onUpdateQuantity(itemId, 0); }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader> <CardTitle>Shopping Cart</CardTitle> </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] md:h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image src={item.imageUrl || `https://placehold.co/64x64.png`} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.dataAiHint || item.name.split(" ").slice(0,2).join(" ")} />
                  </TableCell>
                  <TableCell className="font-medium align-top">
                    <div className="flex items-center gap-1"> {item.name} {item.type === 'product' ? <Package size={14} className="text-muted-foreground" title="Product"/> : <ConciergeBell size={14} className="text-muted-foreground" title="Service"/> } </div>
                    {item.type === 'product' && item.barcode && <div className="text-xs text-muted-foreground">Code: {item.barcode}</div>}
                    {item.type === 'service' && item.serviceCode && <div className="text-xs text-muted-foreground">Code: {item.serviceCode}</div>}
                    {item.type === 'product' && typeof item.gstPercentage === 'number' && item.gstPercentage > 0 && (
                      <div className="text-xs text-muted-foreground">GST: {item.gstPercentage}%</div>
                    )}
                    {item.type === 'service' && item.itemSpecificPhoneNumber && ( <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"> <Phone size={10} /> {item.itemSpecificPhoneNumber} </div> )}
                    {item.type === 'service' && item.itemSpecificNote && ( <div className="text-xs text-muted-foreground mt-1 flex items-start gap-1"> <MessageSquareText size={10} className="mt-0.5"/> <span className="whitespace-pre-wrap">{item.itemSpecificNote}</span> </div> )}
                  </TableCell>
                  <TableCell className="text-center align-top">
                    <div className="flex items-center justify-center gap-1 pt-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} > <Minus className="h-3 w-3" /> </Button>
                      <Input type="number" value={item.quantity} onChange={(e) => handleQuantityInputChange(item.id, e.target.value)} onBlur={(e) => { if (e.target.value === "" || parseInt(e.target.value, 10) < 1) { onUpdateQuantity(item.id, 1); } }} min="1" max={item.type === 'product' && typeof item.stock === 'number' ? item.stock : undefined} className="h-7 w-12 text-center px-1" />
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} disabled={item.type === 'product' && typeof item.stock === 'number' && item.quantity >= item.stock} > <Plus className="h-3 w-3" /> </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right align-top pt-2.5">{currencySymbol}{item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right align-top pt-2.5">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell className="text-center align-top pt-1.5"> <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} aria-label="Remove item"> <X className="h-4 w-4 text-destructive" /> </Button> </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-6 border-t">
        <div className="flex justify-between w-full text-lg"> <span>Subtotal:</span> <span>{currencySymbol}{subTotal.toFixed(2)}</span> </div>
        <div className="flex justify-between w-full text-md text-muted-foreground"> <span>Total GST:</span> <span>{currencySymbol}{totalGstAmount.toFixed(2)}</span> </div>
        <div className="flex justify-between w-full text-xl font-bold mt-2"> <span>Total:</span> <span>{currencySymbol}{totalAmount.toFixed(2)}</span> </div>
      </CardFooter>
    </Card>
  );
}
