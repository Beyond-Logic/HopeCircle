/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, MapPin, Heart, Plus } from "lucide-react";
import { CreateGroupModal } from "./create-group-modal";

// Mock data for groups
const initialMockGroups = [
  {
    id: "nigeria-warriors",
    name: "Nigeria Warriors",
    description:
      "Connect with fellow sickle cell warriors across Nigeria. Share experiences, support, and local resources.",
    type: "country" as const,
    memberCount: 1247,
    isJoined: true,
    recentActivity: "2 hours ago",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "caregivers-support",
    name: "Caregivers Support",
    description:
      "A safe space for parents, family members, and friends supporting loved ones with sickle cell disease.",
    type: "theme" as const,
    memberCount: 892,
    isJoined: false,
    recentActivity: "4 hours ago",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "usa-community",
    name: "USA Community",
    description:
      "Sickle cell warriors and supporters across the United States sharing resources and experiences.",
    type: "country" as const,
    memberCount: 2156,
    isJoined: true,
    recentActivity: "1 hour ago",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "pain-management",
    name: "Pain Management Tips",
    description:
      "Share and discover effective pain management strategies, techniques, and experiences.",
    type: "theme" as const,
    memberCount: 1834,
    isJoined: false,
    recentActivity: "30 minutes ago",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "uk-support",
    name: "UK Support Network",
    description:
      "United Kingdom sickle cell community for sharing NHS experiences and local support.",
    type: "country" as const,
    memberCount: 567,
    isJoined: false,
    recentActivity: "6 hours ago",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "young-warriors",
    name: "Young Warriors (18-30)",
    description:
      "A space for young adults navigating sickle cell disease, career, relationships, and independence.",
    type: "theme" as const,
    memberCount: 743,
    isJoined: true,
    recentActivity: "3 hours ago",
    image: "/placeholder.svg?height=200&width=300",
  },
];

export  function Groups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState(initialMockGroups);
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleJoinGroup = (groupId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              isJoined: !group.isJoined,
              memberCount: group.isJoined
                ? group.memberCount - 1
                : group.memberCount + 1,
            }
          : group
      )
    );
  };

  const handleCreateGroup = (groupData: {
    name: string;
    description: string;
    type: "country" | "theme";
  }) => {
    const newGroup = {
      id: groupData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      name: groupData.name,
      description: groupData.description,
      type: groupData.type,
      memberCount: 1, // Creator is the first member
      isJoined: true, // Creator automatically joins
      recentActivity: "Just now",
      image: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(
        groupData.name + " community"
      )}`,
    };

    setGroups([newGroup, ...groups]);
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "joined" && group.isJoined) ||
      (activeTab === "country" && group.type === "country") ||
      (activeTab === "theme" && group.type === "theme");
    return matchesSearch && matchesTab;
  });

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
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="country">By Country</TabsTrigger>
          <TabsTrigger value="theme">By Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <GroupGrid groups={filteredGroups} onJoinGroup={handleJoinGroup} />
        </TabsContent>

        <TabsContent value="joined" className="mt-6">
          <GroupGrid groups={filteredGroups} onJoinGroup={handleJoinGroup} />
        </TabsContent>

        <TabsContent value="country" className="mt-6">
          <GroupGrid groups={filteredGroups} onJoinGroup={handleJoinGroup} />
        </TabsContent>

        <TabsContent value="theme" className="mt-6">
          <GroupGrid groups={filteredGroups} onJoinGroup={handleJoinGroup} />
        </TabsContent>
      </Tabs>

      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}

interface GroupGridProps {
  groups: typeof initialMockGroups;
  onJoinGroup: (groupId: string) => void;
}

function GroupGrid({ groups, onJoinGroup }: GroupGridProps) {
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
      {groups.map((group) => (
        <Card
          key={group.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="aspect-video relative">
            <img
              src={group.image || "/placeholder.svg"}
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
                <span>{group.memberCount.toLocaleString()} members</span>
              </div>
              <span>Active {group.recentActivity}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant={group.isJoined ? "outline" : "default"}
                size="sm"
                className="flex-1"
                onClick={() => onJoinGroup(group.id)}
              >
                {group.isJoined ? "Leave" : "Join"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/groups/${group.id}`}>View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
