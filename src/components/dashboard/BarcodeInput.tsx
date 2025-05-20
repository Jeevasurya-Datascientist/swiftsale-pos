"use client";

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ScanLine } from 'lucide-react';

interface BarcodeInputProps {
  onProductSearch: (searchTerm: string) => void;
}

export function BarcodeInput({ onProductSearch }: BarcodeInputProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onProductSearch(searchTerm.trim());
      setSearchTerm(''); // Clear after search
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Scan barcode or search product by name/code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-20 h-12 text-base"
          aria-label="Product search or barcode input"
        />
      </div>
      {/* This button could trigger camera scanning in a future iteration */}
      <Button type="button" variant="outline" size="icon" className="h-12 w-12" aria-label="Scan with camera (feature upcoming)">
        <ScanLine className="h-6 w-6" />
      </Button>
      <Button type="submit" className="h-12 px-6 text-base">
        Add Item
      </Button>
    </form>
  );
}
