"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { useGetGroupById } from "@/hooks/react-query/use-group-by-id";
import { useIsUserInGroup } from "@/hooks/react-query/use-is-user-in-group";
import { groupService } from "@/lib/supabase/service/groups-service";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type React from "react";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function GroupProtectedPostLayout({ children }: AppLayoutProps) {
  const { data: user } = useCurrentUserProfile();

  const params = useParams();
  const groupId = params.slug as string;

  const [loading, setIsLoading] = useState(false);

  const {
    data: group,
    isLoading: isGroupLoading,
    error,
  } = useGetGroupById(groupId);
  const { data: isMember, isLoading, refetch } = useIsUserInGroup(
    groupId,
    user?.user.id as string
  );

  const handleJoinGroup = async (groupId: string) => {
    setIsLoading(true);
    try {
      await groupService.joinGroup(groupId, user?.user.id as string);
      refetch()
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isGroupLoading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (error || !group) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Group not found</h1>
        <Link href="/groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
        <h1 className="text-xl font-medium mb-4">
          You need to be a member to see group post
        </h1>
        <Button onClick={() => handleJoinGroup(group.id)}>
          {loading ? "Joining Group" : "Join Group"}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}
