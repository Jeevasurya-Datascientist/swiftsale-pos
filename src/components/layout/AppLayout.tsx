
"use client"; // Required for useSettings hook
import type React from 'react';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Settings, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CustomSidebarHeader = () => {
  const { shopName, shopLogoUrl, isSettingsLoaded } = useSettings();

  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center gap-2">
        {isSettingsLoaded && shopLogoUrl ? (
          <Image 
            src={shopLogoUrl} 
            alt={`${shopName} Logo`} 
            width={32} 
            height={32} 
            className="rounded-sm object-contain"
            data-ai-hint="shop logo"
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.027a.75.75 0 00-.516.678v10.19c0 .37.232.694.583.844l8.256 3.538a.75.75 0 00.592 0l8.256-3.538a.75.75 0 00.583-.844V6.705a.75.75 0 00-.516-.678L12.378 1.602zM12 7.5a.75.75 0 01.75.75v3.75H16.5a.75.75 0 010 1.5h-3.75V18a.75.75 0 01-1.5 0v-4.5H7.5a.75.75 0 010-1.5h3.75V8.25A.75.75 0 0112 7.5z" />
          </svg>
        )}
        <h1 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
          {isSettingsLoaded ? shopName : 'Loading...'}
        </h1>
      </div>
    </SidebarHeader>
  );
};

const CustomSidebarFooter = () => (
  <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center justify-start w-full gap-2 p-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar"/>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="group-data-[collapsible=icon]:hidden">User Name</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserCircle className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  </SidebarFooter>
);


export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <CustomSidebarHeader />
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <CustomSidebarFooter />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b">
          <SidebarTrigger className="md:hidden" /> {/* Only show on mobile */}
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 sm:w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <p className="font-medium">No new notifications</p>
                  <p className="text-xs text-muted-foreground">Your notification feed is currently empty.</p>
                </DropdownMenuItem>
                {/* 
                  // Example of a future notification item:
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-3">
                    <div className="flex flex-col">
                      <p className="font-medium text-sm">Low Stock Alert: Fresh Milk 1L</p>
                      <p className="text-xs text-muted-foreground">Only 5 units left in stock.</p>
                    </div>
                  </DropdownMenuItem>
                */}
              </DropdownMenuContent>
            </DropdownMenu>
            <SidebarTrigger className="hidden md:flex"/> {/* Show on desktop */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
