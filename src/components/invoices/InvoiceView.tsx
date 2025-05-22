
"use client";

import type { Invoice, CartItem } from '@/lib/types';
import { useSettings } from '@/context/SettingsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';
import { Package, ConciergeBell, AlertTriangle, CheckCircle2, Phone, MessageSquareText } from 'lucide-react';

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
    <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto invoice-view-print-root">
      <div className="text-center mb-6 print-header-section">
        {shopLogoUrl && (
          <Image
            src={shopLogoUrl}
            alt={`${displayShopName} Logo`}
            width={80}
            height={80}
            className="rounded-sm object-contain mb-2 print-logo" // Removed mx-auto
            data-ai-hint="shop logo"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <h1 className="text-xl font-bold print-shop-details-name uppercase">{displayShopName}</h1>
        <h2 className="text-2xl font-bold text-primary print-main-title">INVOICE</h2>
        <p className="text-muted-foreground print-invoice-meta">Inv #: {invoice.invoiceNumber}</p>
        <p className="text-muted-foreground print-invoice-meta">Date: {format(new Date(invoice.date), 'dd/MM/yy HH:mm')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm print-address-grid">
        <div className="print-billed-to">
          <h3 className="font-semibold mb-1 print-section-title">Billed To:</h3>
          <p className="print-customer-details-name">{invoice.customerName}</p>
          {invoice.customerPhoneNumber && <p className="print-customer-details-phone">Phone: {invoice.customerPhoneNumber}</p>}
        </div>
        <div className="text-right print-from-address">
          <h3 className="font-semibold mb-1 print-section-title">From:</h3>
          <p className="font-bold print-shop-details-name-alt">{displayShopName}</p>
          {shopAddress.split('\n').map((line, index) => ( 
            <p key={index} className="print-shop-details-line">{line.trim()}</p>
          ))}
        </div>
      </div>

      <Separator className="print-separator" />

      <h3 className="font-semibold mt-4 mb-2 print-section-title print-items-title">Items:</h3>
      <Table className="print-items-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] print-col-image">Img</TableHead>
            <TableHead className="print-col-item">Item</TableHead>
            <TableHead className="text-center print-col-qty">Qty</TableHead>
            <TableHead className="text-right print-col-price">Price</TableHead>
            <TableHead className="text-right print-col-total">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.items.map((item: CartItem) => (
            <TableRow key={item.id}>
              <TableCell className="print-col-image">
                <Image
                  src={item.imageUrl || `https://placehold.co/40x40.png`}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="rounded-sm object-cover"
                  data-ai-hint={item.dataAiHint || item.name.split(" ").slice(0,2).join(" ")}
                />
              </TableCell>
              <TableCell className="print-item-details-cell">
                <div className="flex items-center gap-1 print-item-name-wrapper">
                    {item.name}
                    {item.type === 'product' ?
                        <Package size={14} className="text-muted-foreground print-hide-icon" title="Product"/> :
                        <ConciergeBell size={14} className="text-muted-foreground print-hide-icon" title="Service"/>
                    }
                </div>
                {item.type === 'product' && item.barcode && <div className="text-xs text-muted-foreground print-item-code">Code: {item.barcode}</div>}
                {item.type === 'service' && item.serviceCode && <div className="text-xs text-muted-foreground print-item-code">Code: {item.serviceCode}</div>}
                {item.type === 'service' && item.itemSpecificPhoneNumber && (
                  <div className="text-xs text-muted-foreground print-item-phone flex items-center gap-1">
                    <Phone size={10} className="print-hide-icon"/> Contact: {item.itemSpecificPhoneNumber}
                  </div>
                )}
                {item.type === 'service' && item.itemSpecificNote && (
                  <div className="text-xs text-muted-foreground print-item-note flex items-start gap-1 mt-0.5">
                    <MessageSquareText size={10} className="print-hide-icon mt-0.5 flex-shrink-0"/>
                    <span className="whitespace-pre-wrap">Note: {item.itemSpecificNote}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center print-table-cell print-qty-cell">{item.quantity}</TableCell>
              <TableCell className="text-right print-table-cell print-price-cell">{currencySymbol}{item.price.toFixed(2)}</TableCell> 
              <TableCell className="text-right print-table-cell print-total-cell">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</TableCell> 
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="print-summary-footer">
          <TableRow>
            <TableCell colSpan={3} className="print-footer-colspan-adjust"/>
            <TableCell className="text-right font-medium print-summary-label">Subtotal:</TableCell>
            <TableCell className="text-right print-summary-value">{currencySymbol}{invoice.subTotal.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} className="print-footer-colspan-adjust"/>
            <TableCell className="text-right font-medium print-summary-label">GST ({displayGstRatePercentage}%):</TableCell>
            <TableCell className="text-right print-summary-value">{currencySymbol}{invoice.gstAmount.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow className="font-bold text-lg">
            <TableCell colSpan={3} className="print-footer-colspan-adjust"/>
            <TableCell className="text-right print-summary-label">Total Amount:</TableCell>
            <TableCell className="text-right print-summary-value">{currencySymbol}{invoice.totalAmount.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} className="print-footer-colspan-adjust"/>
            <TableCell className="text-right font-medium print-summary-label">Amount Received:</TableCell>
            <TableCell className="text-right print-summary-value">{currencySymbol}{displayAmountReceived.toFixed(2)}</TableCell>
          </TableRow>
          {displayBalanceAmount !== 0 && ( 
            <TableRow className={`${displayBalanceAmount < 0 ? "text-destructive print-destructive-text" : "print-positive-balance-text"}`}>
              <TableCell colSpan={3} className="print-footer-colspan-adjust"/>
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

      <div className="mt-6 text-sm print-final-details">
        <p><span className="font-semibold">Payment Method:</span> {invoice.paymentMethod}</p>
        <div className="mt-1 flex items-center print-status-line">
          <span className="font-semibold mr-1">Status:</span>
          <Badge variant={invoice.status === 'Paid' ? 'default' : 'destructive'} className="print-status-badge">
              {invoice.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 mr-1 print-hide-icon" /> : <AlertTriangle className="w-3 h-3 mr-1 print-hide-icon" />}
              {invoice.status}
          </Badge>
        </div>
        <p className="mt-4 text-xs text-muted-foreground print-thankyou-message">Thank you for your business!</p>
      </div>
       <style jsx global>{`
        @media print {
          body, html {
            background-color: #fff !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body > *:not(.invoice-view-dialog-content):not(script):not(style) {
            display: none !important;
          }
          
          .invoice-view-dialog-content {
              display: block !important; 
              position: static !important;
              width: 100% !important;
              height: auto !important;
              max-width: none !important;
              max-height: none !important;
              overflow: visible !important;
              transform: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              background: transparent !important; 
              left: unset !important; 
              top: unset !important;
              z-index: auto !important; 
          }
          .invoice-view-dialog-content > button[aria-label="Close"] { 
            display: none !important;
          }

          [data-radix-dialog-overlay],
          [data-radix-alert-dialog-overlay],
          [role="alertdialog"], 
          .print-hide,
          .print-hide-icon { 
            display: none !important; 
          }
          
          .invoice-view-print-root {
            background-color: #fff !important;
            color: #000 !important;
            box-sizing: border-box;
            margin: 0 auto; 
            position: static !important; 
            width: 100%; 
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }

          /* A4 Specific Styles */
          body.print-mode-a4 @page {
            size: A4 portrait;
            margin: 10mm; 
          }
          body.print-mode-a4 .invoice-view-print-root {
            font-family: Arial, Helvetica, sans-serif !important;
            /* width: 180mm !important; /* 210mm - 2*15mm margin - Let it be 100% of @page content box */
            width: 100% !important;
            padding: 0 !important;
          }
          body.print-mode-a4 .print-header-section { text-align: left !important; margin-bottom: 6mm !important; }
          body.print-mode-a4 .print-logo { 
            display: block !important; 
            max-height: 20mm !important; 
            width: auto !important; /* Let height dictate width based on aspect ratio */
            max-width: 50mm !important; /* Prevent overly wide logos */
            margin-bottom: 4mm !important; 
            margin-left: 0 !important; /* Align to left */
            margin-right: auto !important; 
          }
          body.print-mode-a4 .print-shop-details-name { font-size: 14pt !important; margin-bottom: 2mm; text-align: center !important; }
          body.print-mode-a4 .print-main-title { font-size: 18pt !important; margin-bottom: 2mm; text-align: center !important; }
          body.print-mode-a4 .print-invoice-meta { font-size: 10pt !important; line-height: 1.3; margin-bottom: 1mm; text-align: center !important; }
          
          body.print-mode-a4 .print-address-grid { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8mm !important; font-size: 10pt;}
          body.print-mode-a4 .print-address-grid > div { width: 48%; }
          body.print-mode-a4 .print-from-address { text-align: right !important; }
          body.print-mode-a4 .print-section-title { font-size: 11pt !important; margin-bottom: 2mm; font-weight: bold; }
          body.print-mode-a4 .print-items-title { text-align: left; margin-bottom: 1mm !important; } 
          body.print-mode-a4 .print-items-table { width: 100%; border-collapse: collapse; margin-bottom: 5mm; }
          body.print-mode-a4 .print-items-table th, 
          body.print-mode-a4 .print-items-table td { font-size: 9pt !important; padding: 2mm 1.5mm !important; border: 1px solid #ccc !important; vertical-align: top; }
          body.print-mode-a4 .print-items-table th { background-color: #f0f0f0 !important; text-align: left; font-weight: bold;}
          body.print-mode-a4 .print-col-image { display: table-cell !important; width: 15mm !important; text-align: center;}
          body.print-mode-a4 .print-col-image img { max-width: 100%; height: auto; }
          body.print-mode-a4 .print-item-details-cell { width: auto; }
          body.print-mode-a4 .print-col-qty { width: 10%; text-align: center !important;}
          body.print-mode-a4 .print-col-price, body.print-mode-a4 .print-col-total { width: 18%; text-align: right !important;}
          body.print-mode-a4 .print-summary-footer td { font-size: 10pt !important; padding: 1.5mm !important; }
          body.print-mode-a4 .print-summary-footer .font-bold { font-size: 11pt !important; }
          body.print-mode-a4 .print-final-details { font-size: 10pt !important; margin-top: 8mm !important; }
          body.print-mode-a4 .print-status-badge { font-size: 10pt !important; padding: 2px 6px !important; }
          body.print-mode-a4 .print-thankyou-message { text-align: center; margin-top: 10mm !important; font-size: 10pt;}
          body.print-mode-a4 .print-hide-icon { display: inline-block !important; } 


          /* Thermal Specific Styles (e.g., 58mm paper width) */
          body.print-mode-thermal @page {
            size: 58mm auto; 
            margin: 1.5mm; 
          }
          body.print-mode-thermal .invoice-view-print-root {
            font-family: 'Courier New', Courier, monospace !important;
            width: 55mm !important; 
            padding: 0 !important;
            box-sizing: border-box;
            font-size: 8pt !important;
            line-height: 1.2 !important;
            color: black !important;
          }
          body.print-mode-thermal .print-logo { display: none !important; } 
          body.print-mode-thermal .print-header-section, 
          body.print-mode-thermal .print-from-address,
          body.print-mode-thermal .print-final-details,
          body.print-mode-thermal .print-thankyou-message { 
            text-align: center !important; 
            margin-bottom: 2mm !important;
          }
          body.print-mode-thermal .print-shop-details-name { font-size: 10pt !important; font-weight: bold !important; margin-bottom: 1mm !important; text-transform: uppercase; text-align: center !important;}
          body.print-mode-thermal .print-main-title { font-size: 9pt !important; font-weight: bold !important; margin-bottom: 1mm; border-top: 1px solid black !important; border-bottom: 1px solid black !important; padding: 0.5mm 0; text-align: center !important;}
          body.print-mode-thermal .print-invoice-meta { font-size: 7pt !important; line-height: 1.1; margin-bottom: 0.2mm; text-align: center !important;}
          
          body.print-mode-thermal .print-address-grid { display: block; margin-bottom: 2mm !important; border-top: 1px dashed black; padding-top: 1mm;}
          body.print-mode-thermal .print-address-grid > div { width: 100% !important; text-align: left !important; font-size: 7pt !important; line-height: 1.2; margin-bottom: 0.5mm;}
          body.print-mode-thermal .print-billed-to { margin-bottom: 1mm; text-align: left !important; }
          body.print-mode-thermal .print-from-address .print-shop-details-name-alt { font-weight: normal !important; }
          body.print-mode-thermal .print-from-address .print-shop-details-line { margin: 0; text-align: center !important; }
          body.print-mode-thermal .print-section-title { font-size: 8pt !important; font-weight: bold !important; margin-bottom: 0.5mm; text-align: left; }
          body.print-mode-thermal .print-items-title { text-align: left; border-top: 1px dashed black; padding-top: 1mm; } 
          
          body.print-mode-thermal .print-items-table { width: 100% !important; border-collapse: collapse; table-layout: fixed; margin-top: 0.5mm; border-top: 1px solid black !important; border-bottom: 1px solid black !important;}
          body.print-mode-thermal .print-items-table th, body.print-mode-thermal .print-items-table td {
            font-size: 7pt !important;
            padding: 0.5mm 0.3mm !important; 
            vertical-align: top;
            border: none !important;
            overflow-wrap: break-word; 
            word-break: break-all; 
          }
          body.print-mode-thermal .print-items-table th { border-bottom: 1px solid black !important; font-weight: bold; text-transform: uppercase;}
          body.print-mode-thermal .print-col-image { display: none !important; }
          body.print-mode-thermal .print-hide-icon { display: none !important; } 
          body.print-mode-thermal .print-item-details-cell { text-align: left !important; width: 50% !important; } 
          body.print-mode-thermal .print-col-qty { text-align: center !important; width: 10% !important; }
          body.print-mode-thermal .print-col-price { text-align: right !important; white-space: nowrap; width: 20% !important;}
          body.print-mode-thermal .print-col-total { text-align: right !important; white-space: nowrap; width: 20% !important;}
          body.print-mode-thermal .print-item-code, body.print-mode-thermal .print-item-phone, body.print-mode-thermal .print-item-note { font-size: 6pt !important; }
          
          body.print-mode-thermal .print-summary-footer { margin-top: 1.5mm; }
          body.print-mode-thermal .print-summary-footer td { font-size: 7pt !important; padding: 0.3mm !important;}
          body.print-mode-thermal .print-summary-footer tr:first-child td { padding-top: 1mm !important; border-top: 1px dashed black !important; }
          body.print-mode-thermal .print-summary-footer .print-footer-colspan-adjust { display: none !important; } 
          body.print-mode-thermal .print-summary-footer .print-summary-label { text-align: left !important; padding-left: 0 !important; font-weight: normal !important; width: 60% !important; }
          body.print-mode-thermal .print-summary-footer .print-summary-value { text-align: right !important; padding-right: 0 !important; font-weight: bold !important; width: 40% !important; white-space: nowrap;}
          body.print-mode-thermal .print-summary-footer tr.font-bold .print-summary-label,
          body.print-mode-thermal .print-summary-footer tr.font-bold .print-summary-value { font-size: 8pt !important; font-weight: bold !important; }


          body.print-mode-thermal .print-final-details { font-size: 7pt !important; margin-top: 2mm !important; text-align: center !important;}
          body.print-mode-thermal .print-final-details p { margin-bottom: 0.3mm;}
          body.print-mode-thermal .print-thankyou-message { margin-top: 2mm !important; font-size: 8pt !important; font-weight: bold; border-top: 1px solid black !important; padding-top: 1mm; text-align: center !important;}
          body.print-mode-thermal .print-status-badge {
            display: inline-block; 
            font-size: 7pt !important;
            padding: 0.5mm 1mm !important;
            border: 1px solid black !important;
            background: white !important; 
            color: black !important;
          }
          body.print-mode-thermal .print-separator { display: none !important; }
        }
      `}</style>
    </div>
  );
}

