
"use client";

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/context/SettingsContext';
import type { AppSettings, TeamMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save, UploadCloud, Users, Shield, PlusCircle, Trash2, Send, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  status: z.enum(['pending', 'invited', 'accepted', 'error']),
});

const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  shopLogoUrl: z.string().optional(),
  shopAddress: z.string().min(1, "Shop address is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required").max(5),
  userName: z.string().min(2, "User name must be at least 2 characters.").max(50).or(z.literal('')).optional(),
  teamPassword: z.string().min(6, "Team password must be at least 6 characters.").optional().or(z.literal('')),
  teamMembers: z.array(teamMemberSchema).optional(),
});

type SettingsFormValues = AppSettings; // Using AppSettings directly as form values type

export default function SettingsPage() {
  const { 
    shopName, shopLogoUrl, shopAddress, currencySymbol, userName, 
    teamPassword, teamMembers = [], // Default teamMembers to empty array
    updateSettings, addTeamMember: contextAddTeamMember, removeTeamMember: contextRemoveTeamMember,
    updateTeamMemberStatus: contextUpdateTeamMemberStatus,
    isSettingsLoaded 
  } = useSettings();
  
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');


  const { control, handleSubmit, reset, formState: { errors, isDirty, dirtyFields }, setValue, watch } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName: '',
      shopLogoUrl: '',
      shopAddress: '',
      currencySymbol: '₹',
      userName: '',
      teamPassword: '',
      teamMembers: [],
    }
  });

  const currentShopLogoUrl = watch('shopLogoUrl');
  const currentTeamMembers = watch('teamMembers'); // Watch teamMembers from form state

  useEffect(() => {
    if (isSettingsLoaded) {
      const initialValues: SettingsFormValues = {
        shopName: shopName || '',
        shopLogoUrl: shopLogoUrl || '',
        shopAddress: shopAddress || '',
        currencySymbol: currencySymbol || '₹',
        userName: userName || '',
        teamPassword: teamPassword || '',
        teamMembers: teamMembers || [],
      };
      reset(initialValues); // Reset form with loaded settings
      setLogoPreview(shopLogoUrl || null);
    }
  }, [isSettingsLoaded, shopName, shopLogoUrl, shopAddress, currencySymbol, userName, teamPassword, teamMembers, reset]);

  useEffect(() => {
    setLogoPreview(currentShopLogoUrl || null);
  }, [currentShopLogoUrl]);

  const onSubmit = (data: SettingsFormValues) => {
    // Filter out the teamMembers from 'data' before calling updateSettings
    // as teamMembers are managed separately by contextAddTeamMember/contextRemoveTeamMember
    const { teamMembers: formTeamMembers, ...settingsToUpdate } = data;
    updateSettings(settingsToUpdate);

    // Persist team members directly if they were part of the form's dirty fields.
    // However, it's better to rely on context functions for member modifications.
    // The current setup updates teamMembers in context via `handleAddMemberToList` and `handleRemoveMemberFromList`
    // which then calls `updateSettings` with the modified `teamMembers` array.

    toast({
      title: 'Settings Saved',
      description: 'Your application settings have been updated.',
    });
    reset(data); // Resets form dirty state
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

  const handleAddMemberToList = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Member name and email are required.' });
      return;
    }
    if (!z.string().email().safeParse(newMemberEmail).success) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid member email format.' });
      return;
    }
    
    contextAddTeamMember({ name: newMemberName, email: newMemberEmail });
    toast({ title: "Member Added to List", description: `${newMemberName} added. Save settings to persist.`});
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleRemoveMemberFromList = (memberId: string) => {
    contextRemoveTeamMember(memberId);
    toast({ title: "Member Removed from List", description: `Member removed. Save settings to persist.`});
  };
  
  const handleSendInvite = (member: TeamMember) => {
    // This is where you would call a Cloud Function in a real implementation
    console.log(`Simulating sending invite to ${member.email}...`);
    contextUpdateTeamMemberStatus(member.id, 'invited'); // Update status in context
    toast({ title: "Invite Sent (Simulated)", description: `An invitation email would be sent to ${member.email}.`});
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
        <p className="text-muted-foreground">Manage your shop details, user profile, team, and application preferences.</p>
      </header>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Shop Configuration Card - Existing */}
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
                      data-ai-hint="shop logo"
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
              </div>
          </CardContent>
        </Card>

        {/* User Profile Card - Existing */}
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

        {/* Team Management Card - New */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="text-primary" /> Team Management</CardTitle>
            <CardDescription>Manage your team members and set a team password for shared access.</CardDescription>
            <div className="mt-2 p-3 border border-amber-500 bg-amber-50 rounded-md text-amber-700 text-xs flex items-start gap-2">
                <AlertTriangle size={28} className="flex-shrink-0"/>
                <span><strong>Feature Under Development:</strong> Team collaboration (invitations, worker access) requires backend setup with Firebase Cloud Functions and Firestore. Changes made here are currently saved to local settings only and are not yet functional for actual team operations.</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="teamPassword">Team Password (min. 6 characters)</Label>
              <Controller
                name="teamPassword"
                control={control}
                render={({ field }) => <Input id="teamPassword" type="password" {...field} placeholder="Set a secure team password" />}
              />
              {errors.teamPassword && <p className="text-sm text-destructive mt-1">{errors.teamPassword.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Workers will use this password to accept invitations.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Add New Team Member</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Member Name"
                  className="flex-1"
                />
                <Input 
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Member Email"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddMemberToList}>
                  <PlusCircle className="w-4 h-4 mr-2" /> Add to List
                </Button>
              </div>
            </div>
            
            {(currentTeamMembers && currentTeamMembers.length > 0) && (
              <div className="space-y-3">
                <h4 className="font-medium">Current Team Members</h4>
                <ul className="space-y-2">
                  {currentTeamMembers.map((member, index) => (
                    <li key={member.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-md gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Badge variant={member.status === 'accepted' ? 'default' : (member.status === 'invited' ? 'secondary' : 'outline')}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </Badge>
                        {member.status === 'pending' && (
                           <Button type="button" variant="outline" size="sm" onClick={() => handleSendInvite(member)}>
                             <Send className="w-3 h-3 mr-1" /> Send Invite
                           </Button>
                        )}
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMemberFromList(member.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button type="submit" className="h-12 text-lg px-8" disabled={!isDirty && !(dirtyFields.teamPassword || dirtyFields.teamMembers)}>
                <Save className="w-5 h-5 mr-2" /> Save All Settings
            </Button>
        </div>
      </form>
    </div>
  );
}
