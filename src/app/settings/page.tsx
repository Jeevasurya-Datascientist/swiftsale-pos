
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
import { Settings as SettingsIcon, Save, User } from 'lucide-react';
import { useEffect } from 'react';

const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  shopLogoUrl: z.string().url("Must be a valid URL for the logo, or leave empty.").or(z.literal('')).optional(),
  shopAddress: z.string().min(1, "Shop address is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required").max(5),
  userName: z.string().min(2, "User name must be at least 2 characters.").max(50).or(z.literal('')).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { shopName, shopLogoUrl, shopAddress, currencySymbol, userName, updateSettings, isSettingsLoaded } = useSettings();
  const { toast } = useToast();

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName,
      shopLogoUrl,
      shopAddress,
      currencySymbol,
      userName,
    }
  });

  useEffect(() => {
    if (isSettingsLoaded) {
      reset({
        shopName,
        shopLogoUrl,
        shopAddress,
        currencySymbol,
        userName,
      });
    }
  }, [isSettingsLoaded, shopName, shopLogoUrl, shopAddress, currencySymbol, userName, reset]);


  const onSubmit = (data: SettingsFormValues) => {
    updateSettings(data);
    toast({
      title: 'Settings Saved',
      description: 'Your application settings have been updated.',
    });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Shop Configuration</CardTitle>
            <CardDescription>Update your shop's information. These details will appear on invoices and other parts of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <Label htmlFor="shopLogoUrl">Shop Logo URL (Optional)</Label>
                <Controller
                  name="shopLogoUrl"
                  control={control}
                  render={({ field }) => <Input id="shopLogoUrl" {...field} placeholder="https://example.com/logo.png" />}
                />
                 <p className="text-xs text-muted-foreground mt-1">Recommended: Square or landscape transparent PNG. Use https://placehold.co for placeholders.</p>
                {errors.shopLogoUrl && <p className="text-sm text-destructive mt-1">{errors.shopLogoUrl.message}</p>}
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
              
              <div>
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Controller
                  name="currencySymbol"
                  control={control}
                  render={({ field }) => <Input id="currencySymbol" {...field} placeholder="$" className="w-24" />}
                />
                {errors.currencySymbol && <p className="text-sm text-destructive mt-1">{errors.currencySymbol.message}</p>}
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={!isDirty}>
                <Save className="w-5 h-5 mr-2" /> Save All Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your personal display name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               <div>
                <Label htmlFor="userName">Your Name</Label>
                <Controller
                  name="userName"
                  control={control}
                  render={({ field }) => <Input id="userName" {...field} placeholder="e.g., Alex Smith" />}
                />
                {errors.userName && <p className="text-sm text-destructive mt-1">{errors.userName.message}</p>}
              </div>
               <Button type="submit" className="w-full h-12 text-lg" disabled={!isDirty}>
                <Save className="w-5 h-5 mr-2" /> Save All Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
