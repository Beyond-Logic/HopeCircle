"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin (mock implementation)
    const checkAdminStatus = () => {
      // In a real app, this would check the user's role from authentication
      const userRole = localStorage.getItem("userRole");
      const isUserAdmin = userRole !== "admin";

      setIsAdmin(isUserAdmin);

      if (!isUserAdmin) {
        router.push("/feed");
      }
    };

    checkAdminStatus();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
