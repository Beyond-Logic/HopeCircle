"use client";

import type React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function GroupProtectedLayout({ children }: AppLayoutProps) {
  return <>{children}</>;
}
