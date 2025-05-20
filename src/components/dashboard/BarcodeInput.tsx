
"use client";

import { useState, type FormEvent, useRef, useEffect, ChangeEvent } from 'react';
import type { Product, Service, SearchableItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ScanLine, CameraOff, Package, ConciergeBell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

interface BarcodeInputProps {
  onItemSearch: (itemIdentifier: string, itemType?: 'product' | 'service') => void; 
  searchableItems: SearchableItem[]; 
}

export function BarcodeInput({ onItemSearch, searchableItems }: BarcodeInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const directMatch = searchableItems.find(item =>
        ('barcode' in item && item.barcode.toLowerCase() === inputValue.trim().toLowerCase()) ||
        ('serviceCode' in item && item.serviceCode?.toLowerCase() === inputValue.trim().toLowerCase())
      );
      if (directMatch) {
        onItemSearch(directMatch.id, 'barcode' in directMatch ? 'product' : 'service');
      } else {
        onItemSearch(inputValue.trim()); 
      }
      setInputValue('');
      setIsDropdownVisible(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setInputValue(term);

    if (term.trim() === '') {
      setSearchResults([]);
      setIsDropdownVisible(false);
      return;
    }

    const filtered = searchableItems.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      ('barcode' in item && item.barcode.toLowerCase().includes(term.toLowerCase())) ||
      ('serviceCode' in item && item.serviceCode?.toLowerCase().includes(term.toLowerCase()))
    );
    setSearchResults(filtered);
    setIsDropdownVisible(filtered.length > 0);
  };

  const handleItemSelect = (item: SearchableItem) => {
    const itemType = 'barcode' in item ? 'product' : 'service';
    onItemSearch(item.id, itemType); 
    setInputValue('');
    setSearchResults([]);
    setIsDropdownVisible(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownContainerRef]);

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = async () => {
    if (!isCameraOpen) {
      if (typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOpen(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
        setIsCameraOpen(false);
      }
    } else {
      stopCameraStream();
      setIsCameraOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  return (
    <div className="mb-6 hidden"> {/* This component is now hidden as per new UI request */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-grow" ref={dropdownContainerRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Scan or search item by name/code..."
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => { if (inputValue.trim() && searchResults.length > 0) setIsDropdownVisible(true);}}
            className="pl-10 pr-4 h-12 text-base"
            aria-label="Item search or barcode/service code input"
            autoComplete="off"
          />
          {isDropdownVisible && searchResults.length > 0 && (
            <div
              className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto bg-card border border-border rounded-md shadow-lg"
            >
              <ul className="py-1">
                {searchResults.map(item => (
                  <li
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-3"
                  >
                    <Image
                      src={item.imageUrl || `https://placehold.co/40x40.png`}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded-sm object-cover"
                      data-ai-hint={item.dataAiHint || item.name.split(" ").slice(0,2).join(" ")}
                    />
                    <div className="flex-grow">
                      <div className="font-medium flex items-center gap-1">
                        {item.name}
                        {'barcode' in item ? <Package size={14} className="text-muted-foreground" title="Product"/> : <ConciergeBell size={14} className="text-muted-foreground" title="Service"/>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {'barcode' in item ? `Code: ${item.barcode}` : ('serviceCode' in item && item.serviceCode ? `Code: ${item.serviceCode}` : 'No Code')}
                        {'stock' in item && ` | Stock: ${item.stock}`}
                        {'duration' in item && item.duration && ` | Duration: ${item.duration}`}
                        {` | Price: ${currencySymbol}${item.price}`}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0" aria-label={isCameraOpen ? "Close camera" : "Scan with camera"} onClick={toggleCamera}>
          {isCameraOpen ? <CameraOff className="h-6 w-6" /> : <ScanLine className="h-6 w-6" />}
        </Button>
        <Button type="submit" className="h-12 px-6 text-base shrink-0">
          Add Item
        </Button>
      </form>

      {isCameraOpen && (
        <div className="my-4 p-4 border rounded-md shadow-md bg-card">
          <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Camera preview. Barcode scanning not yet implemented.
          </p>
        </div>
      )}

      {hasCameraPermission === false && !isCameraOpen && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Camera Access Denied/Unavailable</AlertTitle>
          <AlertDescription>
            Camera permission is required to use the barcode scanner feature, or your browser may not support it. Please check your browser settings and permissions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
