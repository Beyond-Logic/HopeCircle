"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status with Supabase
    const checkAuth = async () => {
      try {
        const authStatus = localStorage.getItem("hopecircle_auth");
        const isLoggedIn = authStatus === "true";

        setIsAuthenticated(isLoggedIn);

        if (requireAuth && !isLoggedIn) {
          router.push("/login");
          return;
        }

        if (!requireAuth && isLoggedIn) {
          router.push("/feed");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (requireAuth) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
