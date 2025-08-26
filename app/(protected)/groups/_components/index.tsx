/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  MapPin,
  Heart,
  Plus,
  Loader2,
  Eye,
  LogOut,
  ListRestart,
} from "lucide-react";
import { useGroups } from "@/hooks/react-query/use-groups";
import { groupService } from "@/lib/supabase/service/groups-service";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";

export function Groups() {
  const { data: user } = useCurrentUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "joined" | "country" | "theme"
  >("all");

  const type = activeTab as "joined" | "country" | "theme";
  // ✅ type filter

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGroups(10, type, searchQuery, user?.user.id as string);

  const groups = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null);

    console.log("groups", groups);


  const handleJoinGroup = async (groupId: string) => {
    if (!user?.user.id) return;

    const group = groups.find((g) => g.id === groupId);
    const isMember =
      group?.group_members?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (member: any) => member.user?.id === user.user.id
      ) || false;

    setLoadingGroupId(groupId);

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
      setLoadingGroupId(null);
    }
  };

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

      <>
        {/* Search */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ListRestart
            className="cursor-pointer"
            onClick={() => {
              setActiveTab("all");
              setSearchQuery("");
            }}
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

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TabsContent value={activeTab} className="mt-6">
              <GroupGrid
                groups={groups}
                onJoinGroup={handleJoinGroup}
                loadingGroupId={loadingGroupId as string}
                userId={user?.user.id as string}
                isLoading={isLoading}
                setActiveTab={setActiveTab}
                setSearchQuery={setSearchQuery}
              />
            </TabsContent>
          )}
        </Tabs>

        {hasNextPage && (
          <div className="text-center py-8">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load More Groups"}
            </Button>
          </div>
        )}
      </>
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
  loadingGroupId: string;
  userId: string;
  isLoading: boolean;
  setActiveTab: (tab: "all" | "joined" | "country" | "theme") => void;
  setSearchQuery: (query: string) => void;
}

function GroupGrid({
  groups,
  onJoinGroup,
  loadingGroupId,
  userId,
  isLoading,
  setActiveTab,
  setSearchQuery,
}: GroupGridProps) {
  if (groups.length === 0 && !isLoading) {
    return (
      <div className="text-center flex flex-col justify-center items-center py-12">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No groups found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or browse different categories.
        </p>
        <div className="mt-3">
          <ListRestart
            className="cursor-pointer"
            onClick={() => {
              setActiveTab("all");
              setSearchQuery("");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => {
        const isJoined = group.group_members?.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (member: any) => member.user?.id === userId
        );

        // Assign a background color based on group type
        const bgColor =
          group.type === "country" ? "bg-blue-500" : "bg-pink-500"; // you can add more types/colors

        return (
          <Card
            key={group.id}
            className="overflow-hidden hover:shadow-lg transition-shadow !pt-0"
          >
            <div className="aspect-video h-[200px] relative flex items-center justify-center">
              {group.image_url ? (
                <img
                  src={group.image_url}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-[200px] l ${bgColor} flex items-center justify-center`}
                >
                  <span className="text-white font-semibold text-lg">
                    {/* {group.name.charAt(0)} */}
                  </span>
                </div>
              )}

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
                <span>Active</span>
              </div>

              <div className="flex gap-2">
                {isJoined ? (
                  <>
                    {/* Main Enter button */}

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 hover:bg-primary"
                      asChild
                    >
                      <Link href={`/groups/${group.id}`}>Enter</Link>
                    </Button>

                    {/* Small Leave icon */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onJoinGroup(group.id)}
                      disabled={loadingGroupId === group.id}
                    >
                      {loadingGroupId === group.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="flex w-full gap-2">
                    <Button
                      size="sm"
                      className="w-full flex-1"
                      onClick={() => onJoinGroup(group.id)}
                      disabled={loadingGroupId === group.id}
                    >
                      {loadingGroupId === group.id ? "Joining..." : "Join"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-transparent hover:text-primary"
                      asChild
                    >
                      <Link href={`/groups/${group.id}`}>
                        <Eye />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
