
"use client";

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ScanLine, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BarcodeInputProps {
  onProductSearch: (searchTerm: string) => void;
}

export function BarcodeInput({ onProductSearch }: BarcodeInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onProductSearch(searchTerm.trim());
      setSearchTerm(''); // Clear after search
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = async () => {
    if (!isCameraOpen) { // Turning camera ON
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
    } else { // Turning camera OFF
      stopCameraStream();
      setIsCameraOpen(false);
    }
  };

  useEffect(() => {
    // Cleanup: stop camera stream when component unmounts or camera is closed
    return () => {
      stopCameraStream();
    };
  }, []);

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Scan barcode or search product by name/code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-12 text-base" 
            aria-label="Product search or barcode input"
          />
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
          {/* TODO: Add actual barcode scanning logic here. This currently only shows the camera feed. */}
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
