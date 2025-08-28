"use client";

import type React from "react";

import { AuthProvider} from "@/context/authContext";
import AppLayout from "@/components/layouts/app-layout";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/layouts/react-query-provider";
import { Suspense } from "react";


interface AppLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: AppLayoutProps) {

  return (
    <AuthProvider>
      <ReactQueryProvider>
        <Suspense>
          <AppLayout>{children}</AppLayout>
        </Suspense>
        <Toaster richColors position="bottom-center" />
      </ReactQueryProvider>
    </AuthProvider>
  );
}
