
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, MessageSquareText, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceDetailsDialogProps {
  isOpen: boolean;
  serviceName: string;
  defaultPrice: number; // Pass the default price for reference
  onClose: () => void;
  onConfirm: (details: { phoneNumber?: string; note?: string; customPrice?: number }) => void;
}

export function ServiceDetailsDialog({ isOpen, serviceName, defaultPrice, onClose, onConfirm }: ServiceDetailsDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isTNEBService, setIsTNEBService] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const tneb = serviceName.toLowerCase() === 'tneb';
      setIsTNEBService(tneb);
      if (!tneb) {
        setCustomPrice(defaultPrice.toString()); // Pre-fill for non-TNEB, though it won't be used for price override
      } else {
        setCustomPrice(''); // Clear for TNEB, needs manual input
      }
      // Reset other fields when dialog opens
      setPhoneNumber('');
      setNote('');
    }
  }, [isOpen, serviceName, defaultPrice]);

  const handleConfirm = () => {
    let priceToConfirm: number | undefined = undefined;
    if (isTNEBService) {
      const parsedPrice = parseFloat(customPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0 for TNEB service.",
          variant: "destructive",
        });
        return;
      }
      priceToConfirm = parsedPrice;
    }
    onConfirm({ phoneNumber, note, customPrice: priceToConfirm });
    // Reset fields for next time - handled by useEffect on open
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Details for: {serviceName}</DialogTitle>
          <DialogDescription>
            {isTNEBService
              ? "Enter the amount for TNEB service. You can also add an optional phone number or note."
              : "Add an optional phone number or note for this service."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isTNEBService && (
            <div className="space-y-1">
              <Label htmlFor="serviceCustomPrice" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                Service Amount <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="serviceCustomPrice"
                type="number"
                placeholder="Enter amount"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                step="0.01"
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="servicePhoneNumber" className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
              Service Specific Phone (Optional)
            </Label>
            <Input
              id="servicePhoneNumber"
              type="tel"
              placeholder="e.g., 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="serviceNote" className="flex items-center">
              <MessageSquareText className="w-4 h-4 mr-2 text-muted-foreground" />
              Service Note (Optional)
            </Label>
            <Textarea
              id="serviceNote"
              placeholder="e.g., Customer prefers morning slot, specific instructions..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>Add to Cart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
