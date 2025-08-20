"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Settings,
  LogOut,
  User,
  Home,
  Users,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminGuard } from "@/components/admin-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Resources", href: "/resources", icon: BookOpen },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="container mx-auto py-6">{children}</main>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
          <div className="grid grid-cols-3 gap-1 p-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AdminGuard>
  );
}
