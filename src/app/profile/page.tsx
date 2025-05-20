
"use client";

import { useSettings } from '@/context/SettingsContext';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Edit, Building, MapPin, Mail, Globe, Settings as SettingsIcon } from 'lucide-react';

export default function ProfilePage() {
  const { shopName, shopLogoUrl, shopAddress, userName, isSettingsLoaded } = useSettings();

  if (!isSettingsLoaded) {
    return (
      <div className="container mx-auto py-4 flex justify-center items-center h-screen">
        <UserCircle className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-xl">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {shopLogoUrl ? (
            <Image
              src={shopLogoUrl}
              alt={`${shopName || 'Shop'} Logo`}
              width={64}
              height={64}
              className="rounded-md object-contain border"
              data-ai-hint="shop logo"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
             <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                <Building className="w-8 h-8 text-muted-foreground" />
             </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-primary">{shopName || 'Your Shop'}</h1>
            <p className="text-muted-foreground">Profile & Shop Information (Read-Only)</p>
          </div>
        </div>
        <Link href="/settings" passHref>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" /> Edit Settings
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCircle className="text-primary" /> User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Your Name</Label>
              <p className="text-lg font-medium">{userName || 'Not Set'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email Address</Label>
              <p className="text-lg font-medium text-muted-foreground italic">(Email not configured)</p>
            </div>
             <div>
              <Label className="text-sm text-muted-foreground">Role</Label>
              <p className="text-lg font-medium">Administrator</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="text-primary" /> Shop Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">Shop Name</Label>
              <p className="text-lg font-medium">{shopName || 'Not Set'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={14}/> Shop Address</Label>
              <p className="text-md whitespace-pre-line">{shopAddress || 'Not Set'}</p>
            </div>
             <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-1"><Globe size={14}/> Website</Label>
              <p className="text-md text-muted-foreground italic">(Website not configured)</p>
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            To update any of this information, please go to the <Link href="/settings" className="text-primary hover:underline">Settings page</Link>.
          </p>
        </div>
    </div>
  );
}

    