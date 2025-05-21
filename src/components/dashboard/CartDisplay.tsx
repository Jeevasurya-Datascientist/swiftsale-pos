
"use client";

import type { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { X, Plus, Minus, Package, ConciergeBell } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CartDisplayProps {
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onUpdateItemPhoneNumber: (itemId: string, phoneNumber: string) => void;
  currencySymbol: string;
  gstRatePercentage: number;
}

export function CartDisplay({
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateItemPhoneNumber,
  currencySymbol,
  gstRatePercentage
}: CartDisplayProps) {
  const subTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); // item.price is sellingPrice
  const gstRateDecimal = (gstRatePercentage || 0) / 100;
  const gstAmount = subTotal * gstRateDecimal;
  const totalAmount = subTotal + gstAmount;

  if (cartItems.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Your cart is empty. Add items to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const handleQuantityInputChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity)) {
      onUpdateQuantity(itemId, newQuantity);
    } else if (value === "") {
      // Allow empty input temporarily, could default to 1 on blur or handle as needed
      // For now, let onUpdateQuantity handle it (might remove if quantity becomes < 1)
      onUpdateQuantity(itemId, 0); // Or 1, depending on desired behavior for empty
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Shopping Cart</CardTitle>
      </CardHeader>
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
                    <Image
                      src={item.imageUrl || `https://placehold.co/64x64.png`}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                      data-ai-hint={item.dataAiHint || item.name.split(" ").slice(0,2).join(" ")}
                    />
                  </TableCell>
                  <TableCell className="font-medium align-top">
                    <div className="flex items-center gap-1">
                        {item.name}
                        {item.type === 'product' ?
                            <Package size={14} className="text-muted-foreground" title="Product"/> :
                            <ConciergeBell size={14} className="text-muted-foreground" title="Service"/>
                        }
                    </div>
                    {item.type === 'product' && item.barcode && <div className="text-xs text-muted-foreground">Code: {item.barcode}</div>}
                    {item.type === 'service' && item.serviceCode && <div className="text-xs text-muted-foreground">Code: {item.serviceCode}</div>}
                    {item.type === 'service' && (
                      <div className="mt-1.5">
                        <Input
                          type="tel"
                          placeholder="Service Contact Ph (Opt.)"
                          value={item.itemSpecificPhoneNumber || ''}
                          onChange={(e) => onUpdateItemPhoneNumber(item.id, e.target.value)}
                          className="h-8 text-xs w-full max-w-[180px]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center align-top">
                    <div className="flex items-center justify-center gap-1 pt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                        onBlur={(e) => { // Ensure quantity is at least 1 on blur if field was emptied
                            if (e.target.value === "" || parseInt(e.target.value, 10) < 1) {
                                onUpdateQuantity(item.id, 1);
                            }
                        }}
                        min="1"
                        max={item.type === 'product' && typeof item.stock === 'number' ? item.stock : undefined}
                        className="h-7 w-12 text-center px-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.type === 'product' && typeof item.stock === 'number' && item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right align-top pt-2.5">{currencySymbol}{item.price.toFixed(2)}</TableCell> {/* item.price is sellingPrice */}
                  <TableCell className="text-right align-top pt-2.5">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</TableCell> {/* item.price is sellingPrice */}
                  <TableCell className="text-center align-top pt-1.5">
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} aria-label="Remove item">
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-6 border-t">
        <div className="flex justify-between w-full text-lg">
          <span>Subtotal:</span>
          <span>{currencySymbol}{subTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-full text-md text-muted-foreground">
          <span>GST ({ (gstRatePercentage || 0).toFixed(gstRatePercentage % 1 === 0 ? 0 : 2) }%):</span>
          <span>{currencySymbol}{gstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-full text-xl font-bold mt-2">
          <span>Total:</span>
          <span>{currencySymbol}{totalAmount.toFixed(2)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
