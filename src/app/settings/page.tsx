
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/context/SettingsContext';
import type { AppSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save, UploadCloud, Percent } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  shopLogoUrl: z.string().optional(), 
  shopAddress: z.string().min(1, "Shop address is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required").max(5),
  userName: z.string().min(2, "User name must be at least 2 characters.").max(50).or(z.literal('')).optional(),
  gstRate: z.coerce.number().min(0, "GST rate cannot be negative.").max(100, "GST rate seems too high."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { shopName, shopLogoUrl, shopAddress, currencySymbol, userName, gstRate, updateSettings, isSettingsLoaded } = useSettings();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isDirty }, setValue, watch } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName,
      shopLogoUrl,
      shopAddress,
      currencySymbol,
      userName,
      gstRate,
    }
  });

  const currentShopLogoUrl = watch('shopLogoUrl');

  useEffect(() => {
    if (isSettingsLoaded) {
      const initialValues: SettingsFormValues = {
        shopName: shopName || '',
        shopLogoUrl: shopLogoUrl || '',
        shopAddress: shopAddress || '',
        currencySymbol: currencySymbol || '₹',
        userName: userName || '',
        gstRate: typeof gstRate === 'number' ? gstRate : 5, // Default to 5 if not set or invalid
      };
      reset(initialValues);
      setLogoPreview(shopLogoUrl || null);
    }
  }, [isSettingsLoaded, shopName, shopLogoUrl, shopAddress, currencySymbol, userName, gstRate, reset]);

  useEffect(() => {
    setLogoPreview(currentShopLogoUrl || null);
  }, [currentShopLogoUrl]);


  const onSubmit = (data: SettingsFormValues) => {
    updateSettings(data);
    toast({
      title: 'Settings Saved',
      description: 'Your application settings have been updated.',
    });
    reset(data); // Reset form with new data to clear isDirty state
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setValue('shopLogoUrl', dataUrl, { shouldDirty: true });
        setLogoPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (!isSettingsLoaded) {
    return (
      <div className="container mx-auto py-4">
        <div className="flex justify-center items-center h-64">
          <SettingsIcon className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-xl">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary flex items-center gap-2">
          <SettingsIcon className="h-10 w-10" /> Application Settings
        </h1>
        <p className="text-muted-foreground">Manage your shop details, user profile, and application preferences.</p>
      </header>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Shop Configuration</CardTitle>
            <CardDescription>Update your shop's information. These details will appear on invoices and other parts of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div>
                <Label htmlFor="shopName">Shop Name</Label>
                <Controller
                  name="shopName"
                  control={control}
                  render={({ field }) => <Input id="shopName" {...field} placeholder="Your Shop Awesome" />}
                />
                {errors.shopName && <p className="text-sm text-destructive mt-1">{errors.shopName.message}</p>}
              </div>

              <div>
                <Label htmlFor="shopLogoUrl">Shop Logo</Label>
                <div className="mt-1 flex items-center gap-4">
                  {logoPreview && (
                    <Image
                      src={logoPreview}
                      alt="Shop Logo Preview"
                      width={64}
                      height={64}
                      className="rounded-md object-contain border"
                      onError={() => setLogoPreview(null)} 
                    />
                  )}
                  <div className="flex-grow">
                    <Controller
                      name="shopLogoUrl"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="shopLogoUrlInput" 
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Enter image URL or upload"
                        />
                      )}
                    />
                     {errors.shopLogoUrl && <p className="text-sm text-destructive mt-1">{errors.shopLogoUrl.message}</p>}
                  </div>
                  <Button type="button" variant="outline" asChild className="relative">
                    <div>
                      <UploadCloud className="w-4 h-4 mr-2" /> Upload
                      <input 
                        type="file" 
                        id="logoUpload"
                        accept="image/*" 
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       />
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Enter a URL or upload an image (PNG, JPG, GIF). Recommended: Square or landscape transparent PNG. Using https://placehold.co for placeholders is also an option.</p>
              </div>

              <div>
                <Label htmlFor="shopAddress">Shop Address</Label>
                <Controller
                  name="shopAddress"
                  control={control}
                  render={({ field }) => <Textarea id="shopAddress" {...field} placeholder="123 Main Street, Anytown, USA 12345" />}
                />
                {errors.shopAddress && <p className="text-sm text-destructive mt-1">{errors.shopAddress.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Controller
                    name="currencySymbol"
                    control={control}
                    render={({ field }) => <Input id="currencySymbol" {...field} placeholder="₹" className="w-24" />}
                  />
                  {errors.currencySymbol && <p className="text-sm text-destructive mt-1">{errors.currencySymbol.message}</p>}
                </div>
                <div>
                    <Label htmlFor="gstRate" className="flex items-center">
                        GST Rate <Percent className="w-3 h-3 ml-1 text-muted-foreground" />
                    </Label>
                    <Controller
                        name="gstRate"
                        control={control}
                        render={({ field }) => <Input id="gstRate" type="number" {...field} placeholder="e.g., 5 for 5%" className="w-32" />}
                    />
                    {errors.gstRate && <p className="text-sm text-destructive mt-1">{errors.gstRate.message}</p>}
                </div>
              </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your personal display name.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
               <div>
                <Label htmlFor="userName">Your Name</Label>
                <Controller
                  name="userName"
                  control={control}
                  render={({ field }) => <Input id="userName" {...field} placeholder="e.g., Alex Smith" />}
                />
                {errors.userName && <p className="text-sm text-destructive mt-1">{errors.userName.message}</p>}
              </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button type="submit" className="h-12 text-lg px-8" disabled={!isDirty}>
                <Save className="w-5 h-5 mr-2" /> Save All Settings
            </Button>
        </div>
      </form>
    </div>
  );
}
