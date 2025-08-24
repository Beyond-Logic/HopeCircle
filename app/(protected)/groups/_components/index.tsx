/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, MapPin, Heart, Plus, Loader2 } from "lucide-react";
import { useGroups } from "@/hooks/react-query/use-groups";
import { groupService } from "@/lib/supabase/service/groups-service";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";

export function Groups() {
  const { data: user } = useCurrentUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "joined" | "country" | "theme"
  >("all");

  const {
    data: groupsData = [],
    isLoading,
    error,
    refetch,
  } = useGroups(
    activeTab === "country" || activeTab === "theme" ? activeTab : undefined
  );

  // Cast to include group_members property
  const groups = groupsData as Array<{
    id: string;
    name: string;
    description: string;
    type: "country" | "theme";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group_members?: Array<any>;
    image_url?: string;
    creator_id: string;
    created_at: string;
    updated_at: string;
  }>;

  const [loading, setIsLoading] = useState(false);

  const handleJoinGroup = async (groupId: string) => {
    if (!user?.user.id) return;

    const group = groups.find((g) => g.id === groupId);
    const isMember =
      group?.group_members?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (member: any) => member.user?.id === user.user.id
      ) || false;
    setIsLoading(true);
    try {
      if (!isMember) {
        await groupService.joinGroup(groupId, user.user.id);
      } else {
        await groupService.leaveGroup(groupId, user.user.id);
      }
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());

    const isJoined = (group.group_members?.length || 0) > 0;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "joined" && isJoined) ||
      (activeTab === "country" && group.type === "country") ||
      (activeTab === "theme" && group.type === "theme");

    return matchesSearch && matchesTab;
  });

  if (error) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">
            Connect with communities that matter to you
          </p>
        </div>
        <Link href="/groups/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "all" | "joined" | "country" | "theme")
            }
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="joined">Joined</TabsTrigger>
              <TabsTrigger value="country">By Country</TabsTrigger>
              <TabsTrigger value="theme">By Theme</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <GroupGrid
                groups={filteredGroups}
                onJoinGroup={handleJoinGroup}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

interface GroupGridProps {
  groups: Array<{
    id: string;
    name: string;
    description: string;
    type: "country" | "theme";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group_members?: Array<any>;
    image_url?: string;
  }>;
  onJoinGroup: (groupId: string) => void;
  loading: boolean
}

function GroupGrid({ groups, onJoinGroup, loading }: GroupGridProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No groups found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or browse different categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => {
        const isJoined = (group.group_members?.length || 0) > 0;
        return (
          <Card
            key={group.id}
            className="overflow-hidden hover:shadow-lg transition-shadow !pt-0"
          >
            <div className="aspect-video relative">
              <img
                src={group.image_url || "/placeholder.svg"}
                alt={group.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  variant={group.type === "country" ? "default" : "secondary"}
                >
                  {group.type === "country" ? (
                    <MapPin className="w-3 h-3 mr-1" />
                  ) : (
                    <Heart className="w-3 h-3 mr-1" />
                  )}
                  {group.type === "country" ? "Country" : "Theme"}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {(group.group_members?.length || 0).toLocaleString()}{" "}
                    members
                  </span>
                </div>
                <span>
                  Active {/* TODO: calculate recent activity if needed */}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={isJoined ? "outline" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={() => onJoinGroup(group.id)}
                >
                  {isJoined
                    ? loading
                      ? "Leaving"
                      : "Leave"
                    : loading
                    ? "Joining"
                    : "Join"}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/groups/${group.id}`}>View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
