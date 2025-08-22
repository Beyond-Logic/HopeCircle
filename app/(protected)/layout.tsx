"use client";

import type React from "react";

import { AuthProvider} from "@/context/authContext";
import AppLayout from "@/components/layout/app-layout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: AppLayoutProps) {

  return (
    <AuthProvider>
     <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
