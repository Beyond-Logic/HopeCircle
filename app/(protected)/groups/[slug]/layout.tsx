/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { useGetGroupById } from "@/hooks/react-query/use-group-by-id";
import { Loader2, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function GroupProtectedLayout({ children }: AppLayoutProps) {
  const { data: user } = useCurrentUserProfile();

  const params = useParams();
  const groupId = params.slug as string;

  const { data: group, isLoading } = useGetGroupById(groupId);

  const canAccess =
    group?.creator?.id === user?.user.id || group?.status === "active";

  if (isLoading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!group) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Group not found</h1>
        <Link href="/groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">{group?.name}</h1>
        <h1 className="text-xl font-medium mb-4">
          You don't have access to this group.
        </h1>
        <Link href={`/groups/${groupId}`}>
          <Button>Go back to groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Show notice if archived but user is the creator */}
      {group?.status === "inactive" && group?.creator?.id === user?.user.id && (
        <div className="mb-4  max-w-2xl w-full mx-auto flex items-center gap-2 rounded-md bg-yellow-100 px-4 py-2 text-yellow-800 text-sm">
          <Info className="h-4 w-4" />
          <span>
            This group has been archived. Only you (the admin) can see it.
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
