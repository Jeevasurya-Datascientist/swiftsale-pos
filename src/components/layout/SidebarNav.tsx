
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react'; // Import useEffect
import { Home, Package, FileText, Settings, ConciergeBell, BarChart3 } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Billing', icon: Home },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/services', label: 'Services', icon: ConciergeBell },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile, openMobile } = useSidebar(); // Get sidebar context

  // Effect to close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMobile, openMobile, setOpenMobile]); // Added openMobile to dependency array


  return (
    <SidebarMenu className="p-2">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              // onClick is not strictly needed here as useEffect handles it based on pathname change,
              // but can be kept if direct action on click is preferred for some reason (e.g., immediate visual feedback).
              // onClick={() => {
              //   if (isMobile) {
              //     setOpenMobile(false);
              //   }
              // }}
              isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
              className={cn(
                "w-full justify-start",
                 (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              )}
              tooltip={{ children: item.label, side: "right", align: "center" }}
            >
              <a>
                <item.icon className="w-5 h-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
