
"use client";

import type { Invoice, CartItem } from '@/lib/types';
import { useSettings } from '@/context/SettingsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';
import { Package, ConciergeBell, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface InvoiceViewProps {
  invoice: Invoice;
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  const { shopName: contextShopName, shopLogoUrl, shopAddress, currencySymbol, isSettingsLoaded } = useSettings();

  if (!isSettingsLoaded && !invoice.shopName) { 
      return <div className="p-2 space-y-4 text-center">Loading invoice details...</div>;
  }

  const displayShopName = invoice.shopName || contextShopName;
  const displayAmountReceived = invoice.amountReceived; 
  const displayBalanceAmount = invoice.balanceAmount; 
  const displayGstRatePercentage = (invoice.gstRate * 100).toFixed(invoice.gstRate * 100 % 1 === 0 ? 0 : 2);


  return (
    <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto print-container">
      <div className="text-center mb-6">
        {shopLogoUrl && ( 
          <Image 
            src={shopLogoUrl} 
            alt={`${displayShopName} Logo`} 
            width={80} 
            height={80} 
            className="rounded-sm object-contain mx-auto mb-2 print-logo"
            data-ai-hint="shop logo"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <h2 className="text-2xl font-bold text-primary print-shop-name">INVOICE</h2>
        <p className="text-muted-foreground print-invoice-details">Invoice Number: {invoice.invoiceNumber}</p>
        <p className="text-muted-foreground print-invoice-details">Date: {format(new Date(invoice.date), 'PPPpp')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm print-grid">
        <div>
          <h3 className="font-semibold mb-1 print-section-title">Billed To:</h3>
          <p className="print-customer-details">{invoice.customerName}</p>
          {invoice.customerPhoneNumber && <p className="print-customer-details">Phone: {invoice.customerPhoneNumber}</p>}
        </div>
        <div className="text-right">
          <h3 className="font-semibold mb-1 print-section-title">From:</h3>
          <p className="font-bold print-shop-details">{displayShopName}</p>
          {shopAddress.split(',').map((line, index) => ( 
            <p key={index} className="print-shop-details">{line.trim()}</p>
          ))}
        </div>
      </div>
      
      <Separator className="print-separator" />

      <h3 className="font-semibold mt-4 mb-2 print-section-title">Items:</h3>
      <Table className="print-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] print-hide-image">Img</TableHead>
            <TableHead className="print-table-head">Item</TableHead>
            <TableHead className="text-center print-table-head">Qty</TableHead>
            <TableHead className="text-right print-table-head">Price</TableHead>
            <TableHead className="text-right print-table-head">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.items.map((item: CartItem) => ( 
            <TableRow key={item.id}>
              <TableCell className="print-hide-image">
                <Image 
                  src={item.imageUrl || `https://placehold.co/40x40.png`} 
                  alt={item.name} 
                  width={40} 
                  height={40} 
                  className="rounded-sm object-cover"
                  data-ai-hint={item.dataAiHint || item.name.split(" ").slice(0,2).join(" ")} 
                />
              </TableCell>
              <TableCell className="print-table-cell">
                <div className="flex items-center gap-1">
                    {item.name}
                    {item.type === 'product' ? 
                        <Package size={14} className="text-muted-foreground print-hide-icon" title="Product"/> : 
                        <ConciergeBell size={14} className="text-muted-foreground print-hide-icon" title="Service"/>
                    }
                </div>
                {item.type === 'product' && item.barcode && <div className="text-xs text-muted-foreground print-item-code">Code: {item.barcode}</div>}
                {item.type === 'service' && item.serviceCode && <div className="text-xs text-muted-foreground print-item-code">Code: {item.serviceCode}</div>}
              </TableCell>
              <TableCell className="text-center print-table-cell">{item.quantity}</TableCell>
              <TableCell className="text-right print-table-cell">{currencySymbol}{item.price.toFixed(2)}</TableCell>
              <TableCell className="text-right print-table-cell">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="print-table-footer">
          <TableRow>
            <TableCell colSpan={3} className="print-hide-image-footer" />
            <TableCell colSpan={2} className="print-show-colspan2-itemsonly"/>
            <TableCell className="text-right font-medium print-summary-label">Subtotal:</TableCell>
            <TableCell className="text-right print-summary-value">{currencySymbol}{invoice.subTotal.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} className="print-hide-image-footer" />
            <TableCell colSpan={2} className="print-show-colspan2-itemsonly"/>
            <TableCell className="text-right font-medium print-summary-label">GST ({displayGstRatePercentage}%):</TableCell>
            <TableCell className="text-right print-summary-value">{currencySymbol}{invoice.gstAmount.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow className="font-bold text-lg">
            <TableCell colSpan={3} className="print-hide-image-footer" />
            <TableCell colSpan={2} className="print-show-colspan2-itemsonly"/>
            <TableCell className="text-right print-summary-label">Total Amount:</TableCell>
            <TableCell className="text-right print-summary-value">{currencySymbol}{invoice.totalAmount.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} className="print-hide-image-footer" />
            <TableCell colSpan={2} className="print-show-colspan2-itemsonly"/>
            <TableCell className="text-right font-medium print-summary-label">Amount Received:</TableCell>
            <TableCell className="text-right print-summary-value">{currencySymbol}{displayAmountReceived.toFixed(2)}</TableCell>
          </TableRow>
          {displayBalanceAmount !== 0 && (
            <TableRow className={`${displayBalanceAmount < 0 ? "text-destructive print-destructive" : "print-positive-balance"}`}>
              <TableCell colSpan={3} className="print-hide-image-footer" />
              <TableCell colSpan={2} className="print-show-colspan2-itemsonly"/>
              <TableCell className="text-right font-medium print-summary-label">
                {displayBalanceAmount > 0 ? "Change Due:" : "Balance Due:"}
              </TableCell>
              <TableCell className="text-right font-semibold print-summary-value">
                {currencySymbol}{Math.abs(displayBalanceAmount).toFixed(2)}
              </TableCell>
            </TableRow>
          )}
        </TableFooter>
      </Table>

      <Separator className="print-separator"/>

      <div className="mt-6 text-sm print-footer-details">
        <p><span className="font-semibold">Payment Method:</span> {invoice.paymentMethod}</p>
        <p className="mt-1"><span className="font-semibold">Status:</span>
        <Badge variant={invoice.status === 'Paid' ? 'default' : 'destructive'} className="ml-2 print-status-badge">
            {invoice.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 mr-1 print-hide-icon" /> : <AlertTriangle className="w-3 h-3 mr-1 print-hide-icon" />}
            {invoice.status}
        </Badge>
        </p>
        <p className="mt-4 text-xs text-muted-foreground print-thankyou">Thank you for your business!</p>
      </div>
       <style jsx global>{`
        @media print {
          /* Common Styles */
          body * {
            visibility: hidden;
            color: #000 !important;
            background-color: transparent !important; /* Ensure no background colors interfere */
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
            overflow: visible !important; /* Ensure full content is printed */
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-hide, .print-hide-icon, .print-hide-image, .print-hide-image-footer {
            display: none !important;
          }
          .print-show-colspan2-itemsonly { 
             display: table-cell !important;
             width: auto !important; 
          }
          .print-table-footer .print-hide-image-footer ~ .print-show-colspan2-itemsonly:not(:nth-child(1)) {
            display: none !important; 
          }
          .print-logo { max-height: 40px !important; width: auto !important; margin-bottom: 5px !important; }
          .print-shop-name { font-size: 14pt !important; font-weight: bold !important; margin-bottom: 2px !important; }
          .print-section-title { font-size: 10pt !important; font-weight: bold !important; margin-bottom: 1px !important; }
          .print-invoice-details, .print-customer-details, .print-shop-details, .print-item-code { font-size: 8pt !important; line-height: 1.2 !important; }
          .print-table { width: 100% !important; margin-bottom: 5px !important; border-collapse: collapse !important; }
          .print-table-head { font-size: 9pt !important; padding: 2px !important; border-bottom: 1px solid #ccc !important; }
          .print-table-cell { font-size: 8pt !important; padding: 2px !important; vertical-align: top !important; }
          .print-table-footer { font-size: 9pt !important; }
          .print-summary-label { padding: 2px !important; text-align: right !important; }
          .print-summary-value { padding: 2px !important; text-align: right !important; }
          .print-separator { margin: 5px 0 !important; border-color: #ccc !important; }
          .print-footer-details { margin-top: 5px !important; font-size: 8pt !important; }
          .print-status-badge { font-size: 8pt !important; padding: 1px 3px !important; }
          .print-thankyou { margin-top: 5px !important; text-align: center !important; font-style: italic !important; }
          .print-destructive { color: #000 !important; }
          .print-grid { grid-template-columns: 1fr !important; text-align: left !important; } 
          .print-grid > div { text-align: left !important; }
          .print-grid > div:nth-child(2) { text-align: left !important; margin-top: 5px; } 

          /* A4 Specific Styles */
          body.print-mode-a4 .print-container {
            font-family: Arial, Helvetica, sans-serif !important;
            padding: 15mm !important; /* Add some padding for A4 */
          }
          body.print-mode-a4 @page {
            size: A4 portrait;
            margin: 10mm; /* Standard A4 margins */
          }
           body.print-mode-a4 .print-logo { max-height: 60px !important; }
           body.print-mode-a4 .print-shop-name { font-size: 18pt !important; }
           body.print-mode-a4 .print-section-title { font-size: 12pt !important; }
           body.print-mode-a4 .print-invoice-details, 
           body.print-mode-a4 .print-customer-details, 
           body.print-mode-a4 .print-shop-details, 
           body.print-mode-a4 .print-item-code { font-size: 10pt !important; }
           body.print-mode-a4 .print-table-head { font-size: 11pt !important; padding: 4px !important; }
           body.print-mode-a4 .print-table-cell { font-size: 10pt !important; padding: 4px !important; }
           body.print-mode-a4 .print-table-footer { font-size: 11pt !important; }
           body.print-mode-a4 .print-hide-image { display: table-cell !important; } /* Show images for A4 */


          /* Thermal Specific Styles */
          body.print-mode-thermal .print-container {
            font-family: 'Courier New', Courier, monospace !important;
            width: 51mm !important; /* Approx 2 inch width */
            padding: 0 !important; /* Minimal padding */
          }
          body.print-mode-thermal @page {
            size: 57mm auto; /* Common thermal paper width */
            margin: 3mm; /* Minimal margins for thermal */
          }
          body.print-mode-thermal .print-logo { max-height: 30px !important; }
          body.print-mode-thermal .print-hide-image, body.print-mode-thermal .print-hide-image-footer {
            display: none !important; /* Hide images for thermal */
          }
          body.print-mode-thermal .print-table-footer td[colspan="3"].print-hide-image-footer {
             display: none !important;
          }
          body.print-mode-thermal .print-table-footer .print-show-colspan2-itemsonly {
            display: table-cell !important;
            text-align: right;
            font-weight: normal;
          }
          body.print-mode-thermal .print-table-footer .print-summary-label {
            text-align: right;
            font-weight: bold;
          }
           body.print-mode-thermal .print-table-footer .print-summary-value {
            text-align: right;
          }

          /* Fallback/Default Print (if no mode class, assume thermal-like as per previous setup) */
          body:not(.print-mode-a4):not(.print-mode-thermal) .print-container {
            font-family: 'Courier New', Courier, monospace !important;
            width: 51mm !important; 
            padding: 0 !important;
          }
          body:not(.print-mode-a4):not(.print-mode-thermal) @page {
            size: 57mm auto; 
            margin: 3mm;
          }
           body:not(.print-mode-a4):not(.print-mode-thermal) .print-hide-image,
           body:not(.print-mode-a4):not(.print-mode-thermal) .print-hide-image-footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

