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
  Home,
  Users,
  Settings,
  LogOut,
  User,
  Inbox,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/authContext";
import { authService } from "@/lib/supabase/service/auth-service";
import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/lib/supabase/service/chat-service";
import { useEffect, useState } from "react";
import NotificationDropdown from "../notification-dropdown";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // 🔔 unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadCount", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await chatService.getUnreadCount(user.id);
      return count;
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // poll every 5s
  });

  const navigation = [
    { name: "Feed", href: "/feed", icon: Home },
    { name: "Discover", href: "/groups", icon: Users },
    { name: "Inbox", href: "/inbox", icon: Inbox },
  ];

  // Update user last active every minute when online
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(() => {
        chatService.updateUserLastActive(user.id);
      }, 60000); // Update every minute

      // Update immediately on mount
      chatService.updateUserLastActive(user.id);

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      authService.signOut();
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    authService
      .getAvatarUrl(profile?.avatar_url as string)
      .then(setProfilePreview);
  }, [profile?.avatar_url]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky px-4 mx-auto top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl ml-0.5">HopeCircle</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.name === "Inbox" && unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-primary/30"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profilePreview as string}
                      alt={profile?.first_name}
                    />
                    <AvatarFallback className="bg-primary/10">
                      <User className="w-5 h-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div></div>

                  {/* {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )} */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-w-[320px] w-full" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profilePreview as string}
                      alt={profile?.first_name}
                    />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium break-all">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="break-all text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile/me"
                    className="flex items-center cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <NotificationDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors rounded-md",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-1 mx-auto" />
                  {item.name === "Inbox" && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
