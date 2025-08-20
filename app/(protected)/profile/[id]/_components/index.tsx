"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, MessageCircle, Settings, User } from "lucide-react";

// Mock user data
const mockUserData = {
  me: {
    id: "me",
    name: "John Doe",
    email: "john@example.com",
    genotype: "SS",
    country: "Nigeria",
    bio: "Living with sickle cell and sharing my journey. Advocate for better healthcare access in Nigeria.",
    avatar: null,
    joinedAt: new Date("2023-08-15"),
    postsCount: 24,
    groupsCount: 5,
    isCurrentUser: true,
  },
  user1: {
    id: "user1",
    name: "Amara Johnson",
    email: "amara@example.com",
    genotype: "SS",
    country: "Nigeria",
    bio: "Sickle cell warrior, healthcare advocate, and community builder. Passionate about supporting fellow warriors.",
    avatar: null,
    joinedAt: new Date("2023-06-10"),
    postsCount: 18,
    groupsCount: 3,
    isCurrentUser: false,
  },
};

// Mock user posts
const mockUserPosts = [
  {
    id: "user-post-1",
    author: {
      id: "user1",
      name: "Amara Johnson",
      genotype: "SS",
      country: "Nigeria",
      avatar: null,
    },
    content:
      "Just had my monthly check-up and my hemoglobin levels are stable! Feeling grateful for this community's support during my tough days.",
    image: null,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    likes: 24,
    comments: 8,
    isLiked: false,
  },
];

// Mock user groups
const mockUserGroups = [
  { id: "nigeria-warriors", name: "Nigeria Warriors", memberCount: 1247 },
  { id: "young-warriors", name: "Young Warriors (18-30)", memberCount: 743 },
  { id: "pain-management", name: "Pain Management Tips", memberCount: 1834 },
];

export function Profile() {
  const params = useParams();
  const userId = params.id as string;
  const [posts, setPosts] = useState(mockUserPosts);
  const [currentUserData, setCurrentUserData] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hopecircle_user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const user =
    userId === "me" && currentUserData
      ? {
          ...mockUserData.me,
          name: currentUserData.name || mockUserData.me.name,
          bio: currentUserData.bio || mockUserData.me.bio,
          genotype: currentUserData.genotype || mockUserData.me.genotype,
          country: currentUserData.country || mockUserData.me.country,
          avatar: currentUserData.avatar || mockUserData.me.avatar,
        }
      : mockUserData[userId as keyof typeof mockUserData];

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Link href="/feed">
          <Button>Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={user.avatar || "/placeholder.svg?height=96&width=96"}
                alt={user.name}
              />
              <AvatarFallback className="text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                    <Badge variant="secondary">{user.genotype}</Badge>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {typeof user.country === "string" &&
                        user.country.length <= 3
                          ? user.country.charAt(0).toUpperCase() +
                            user.country.slice(1)
                          : user.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {user.joinedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  {user.bio && (
                    <p className="text-muted-foreground leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {user.isCurrentUser ? (
                    <Button asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline">Follow</Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.postsCount}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.groupsCount}</div>
                  <div className="text-sm text-muted-foreground">Groups</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {user.isCurrentUser
                    ? "Share your first post with the community!"
                    : "This user hasn't posted yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockUserGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.memberCount.toLocaleString()} members
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/groups/${group.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About {user.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Genotype</h4>
                <Badge variant="secondary">{user.genotype}</Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <p className="text-muted-foreground">
                  {typeof user.country === "string" && user.country.length <= 3
                    ? user.country.charAt(0).toUpperCase() +
                      user.country.slice(1)
                    : user.country}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Member Since</h4>
                <p className="text-muted-foreground">
                  {user.joinedAt.toLocaleDateString()}
                </p>
              </div>
              {user.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
