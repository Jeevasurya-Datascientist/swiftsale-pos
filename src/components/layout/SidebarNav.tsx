
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Removed useEffect import as it's no longer used for auto-closing
import { Home, Package, FileText, Settings, ConciergeBell, BarChart3 } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar, 
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
  const { isMobile, setOpenMobile } = useSidebar(); // Removed openMobile as it's not directly used here anymore

  // Removed useEffect hook that was previously auto-closing the sidebar on pathname change.
  // The closing logic is now handled directly by the onClick in SidebarMenuButton.

  return (
    <SidebarMenu className="p-2">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false); // Close mobile sidebar when a nav item is clicked
                }
              }}
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
