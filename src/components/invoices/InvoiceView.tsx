"use client";

import type { Invoice } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Image from 'next/image';

interface InvoiceViewProps {
  invoice: Invoice;
  currencySymbol?: string;
}

export function InvoiceView({ invoice, currencySymbol = '$' }: InvoiceViewProps) {
  return (
    <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
        <p className="text-muted-foreground">Invoice Number: {invoice.invoiceNumber}</p>
        <p className="text-muted-foreground">Date: {format(new Date(invoice.date), 'PPPpp')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <h3 className="font-semibold mb-1">Billed To:</h3>
          <p>{invoice.customerName}</p>
          {/* Add more customer details if available */}
        </div>
        <div className="text-right">
          <h3 className="font-semibold mb-1">From:</h3>
          <p>SwiftSale POS Inc.</p>
          <p>123 Business Rd, Suite 456</p>
          <p>Commercetown, ST 78900</p>
        </div>
      </div>
      
      <Separator />

      <h3 className="font-semibold mt-4 mb-2">Items:</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Img</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Image 
                  src={item.imageUrl || `https://placehold.co/40x40.png`} 
                  alt={item.name} 
                  width={40} 
                  height={40} 
                  className="rounded-sm object-cover"
                  data-ai-hint={item.dataAiHint} 
                />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right">{currencySymbol}{item.price.toFixed(2)}</TableCell>
              <TableCell className="text-right">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} />
            <TableCell className="text-right font-medium">Subtotal:</TableCell>
            <TableCell className="text-right">{currencySymbol}{invoice.subTotal.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} />
            <TableCell className="text-right font-medium">GST ({ (invoice.gstRate * 100).toFixed(0) }%):</TableCell>
            <TableCell className="text-right">{currencySymbol}{invoice.gstAmount.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow className="font-bold text-lg">
            <TableCell colSpan={3} />
            <TableCell className="text-right">Total Amount:</TableCell>
            <TableCell className="text-right">{currencySymbol}{invoice.totalAmount.toFixed(2)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Separator />

      <div className="mt-6 text-sm">
        <p><span className="font-semibold">Payment Method:</span> {invoice.paymentMethod}</p>
        <p className="mt-4 text-xs text-muted-foreground">Thank you for your business!</p>
        {/* Add terms and conditions if needed */}
      </div>
    </div>
  );
}
