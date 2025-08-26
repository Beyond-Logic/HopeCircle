/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { useGetGroupById } from "@/hooks/react-query/use-group-by-id";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function GroupProtectedSettingsLayout({
  children,
}: AppLayoutProps) {
  const { data: user } = useCurrentUserProfile();

  const params = useParams();
  const groupId = params.slug as string;

  const { data: group, isLoading } = useGetGroupById(groupId);
  const canAccess = group?.creator?.id === user?.user.id;

  if (isLoading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!canAccess) {
    return null;
  }
  return <>{children}</>;
}
