
"use client";

import type { Invoice } from '@/lib/types';
import { useSettings } from '@/context/SettingsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Image from 'next/image';

interface InvoiceViewProps {
  invoice: Invoice;
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  const { shopName, shopLogoUrl, shopAddress, currencySymbol, isSettingsLoaded } = useSettings();

  if (!isSettingsLoaded) {
      return <div className="p-2 space-y-4 text-center">Loading invoice details...</div>;
  }

  const displayAmountReceived = typeof invoice.amountReceived === 'number' ? invoice.amountReceived : invoice.totalAmount;
  const displayBalanceAmount = typeof invoice.balanceAmount === 'number' ? invoice.balanceAmount : 0;


  return (
    <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto print-container">
      <div className="text-center mb-6">
        {shopLogoUrl && (
          <Image 
            src={shopLogoUrl} 
            alt={`${shopName} Logo`} 
            width={80} 
            height={80} 
            className="rounded-sm object-contain mx-auto mb-2"
            data-ai-hint="shop logo"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
        <p className="text-muted-foreground">Invoice Number: {invoice.invoiceNumber}</p>
        <p className="text-muted-foreground">Date: {format(new Date(invoice.date), 'PPPpp')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <h3 className="font-semibold mb-1">Billed To:</h3>
          <p>{invoice.customerName}</p>
          {invoice.customerPhoneNumber && <p>Phone: {invoice.customerPhoneNumber}</p>}
        </div>
        <div className="text-right">
          <h3 className="font-semibold mb-1">From:</h3>
          <p className="font-bold">{shopName}</p>
          {shopAddress.split(',').map((line, index) => (
            <p key={index}>{line.trim()}</p>
          ))}
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
                  data-ai-hint={item.dataAiHint || item.name.split(" ").slice(0,2).join(" ")} 
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
          {typeof invoice.amountReceived === 'number' && (
             <TableRow>
              <TableCell colSpan={3} />
              <TableCell className="text-right font-medium">Amount Received:</TableCell>
              <TableCell className="text-right">{currencySymbol}{displayAmountReceived.toFixed(2)}</TableCell>
            </TableRow>
          )}
          {typeof invoice.balanceAmount === 'number' && invoice.balanceAmount > 0 && (
            <TableRow>
              <TableCell colSpan={3} />
              <TableCell className="text-right font-medium">Change Due:</TableCell>
              <TableCell className="text-right">{currencySymbol}{displayBalanceAmount.toFixed(2)}</TableCell>
            </TableRow>
          )}
        </TableFooter>
      </Table>

      <Separator />

      <div className="mt-6 text-sm">
        <p><span className="font-semibold">Payment Method:</span> {invoice.paymentMethod}</p>
        <p className="mt-4 text-xs text-muted-foreground">Thank you for your business!</p>
      </div>
       <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-height: none; 
            overflow: visible; 
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
