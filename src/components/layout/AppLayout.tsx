
"use client"; 
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
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // Added for logout redirection

const CustomSidebarHeader = () => {
  const { shopName, shopLogoUrl, isSettingsLoaded } = useSettings();

  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center gap-2">
        {isSettingsLoaded && shopLogoUrl ? (
          <Image 
            src={shopLogoUrl} 
            alt={`${shopName || 'Shop'} Logo`} 
            width={32} 
            height={32} 
            className="rounded-sm object-contain"
            data-ai-hint="shop logo"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop if placeholder also fails
              target.src = 'https://placehold.co/32x32.png/E3F2FD/212121?text=Logo'; // Fallback placeholder
            }}
          />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.027a.75.75 0 00-.516.678v10.19c0 .37.232.694.583.844l8.256 3.538a.75.75 0 00.592 0l8.256-3.538a.75.75 0 00.583-.844V6.705a.75.75 0 00-.516-.678L12.378 1.602zM12 7.5a.75.75 0 01.75.75v3.75H16.5a.75.75 0 010 1.5h-3.75V18a.75.75 0 01-1.5 0v-4.5H7.5a.75.75 0 010-1.5h3.75V8.25A.75.75 0 0112 7.5z" />
          </svg>
        )}
        <h1 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
          {isSettingsLoaded ? (shopName || 'SwiftSale POS') : 'Loading...'}
        </h1>
      </div>
    </SidebarHeader>
  );
};

const CustomSidebarFooter = () => {
  const { userName, isSettingsLoaded } = useSettings();
  const { toast } = useToast(); 
  const router = useRouter(); // Initialize router

  const displayUserName = isSettingsLoaded ? (userName || "User") : "Loading...";
  const avatarFallback = isSettingsLoaded ? (userName?.[0]?.toUpperCase() || 'U') : "L";

  const handleLogout = () => {
    // Clear all relevant localStorage items
    localStorage.removeItem('appSettings');
    localStorage.removeItem('appProducts');
    localStorage.removeItem('appServices');
    localStorage.removeItem('isAuthenticated'); // Clear simulated auth flag
    // Potentially clear other localStorage items if your app uses more

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });

    // Redirect to login page
    router.push('/login');
  };

  return (
    <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
       <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-start w-full gap-2 p-2 group-data-[collapsible=icon]:justify-center">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://placehold.co/40x40.png/7B1FA2/FFFFFF?text=User" alt={displayUserName} data-ai-hint="user avatar"/>
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <span className="group-data-[collapsible=icon]:hidden">{displayUserName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile" passHref>
              <DropdownMenuItem>
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/settings" passHref>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </SidebarFooter>
  );
};


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
