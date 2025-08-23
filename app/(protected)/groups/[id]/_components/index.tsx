/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CreatePostForm } from "@/components/create-post-form";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, MapPin, Heart, Settings, Share } from "lucide-react";

// Mock group data
const mockGroupData = {
  "nigeria-warriors": {
    id: "nigeria-warriors",
    name: "Nigeria Warriors",
    description:
      "Connect with fellow sickle cell warriors across Nigeria. Share experiences, support, and local resources. This is a safe space for Nigerian warriors to discuss local healthcare challenges, share success stories, and support each other through difficult times.",
    type: "country",
    memberCount: 1247,
    isJoined: true,
    createdAt: new Date("2023-06-15"),
    image: "/placeholder.svg?height=300&width=800",
    rules: [
      "Be respectful and supportive to all members",
      "Share experiences and resources relevant to Nigeria",
      "No spam or promotional content",
      "Respect privacy and confidentiality",
    ],
    moderators: ["Amara Johnson", "Kemi Adebayo"],
  },
};

// Mock posts for the group
const mockGroupPosts = [
  {
    id: "group-post-1",
    author: {
      id: "user1",
      name: "Amara Johnson",
      genotype: "SS",
      country: "Nigeria",
      avatar: null,
      username: "amara_johnson",
    },
    content:
      "Just wanted to share that Lagos University Teaching Hospital now has a dedicated sickle cell clinic with shorter wait times! Has anyone else tried it?",
    image: null,
    createdAt: new Date("2024-01-15T14:30:00Z"),
    updatedAt: new Date("2024-01-15T09:00:00Z"),
    likes: 18,
    comments: 7,
    isLiked: false,
    groupId: "nigeria-warriors",
    post_likes: [], // Add this property as required by Post type
  },
  {
    id: "group-post-2",
    author: {
      id: "user4",
      name: "Kemi Adebayo",
      genotype: "SC",
      country: "Nigeria",
      avatar: null,
      username: "kemi_abebayo",
    },
    content:
      "Sharing my experience with the new hydroxyurea program in Abuja. The process was smooth and the medication is helping a lot. Happy to answer questions!",
    image: null,
    createdAt: new Date("2024-01-14T11:20:00Z"),
    updatedAt: new Date("2024-01-15T09:00:00Z"),
    likes: 24,
    comments: 12,
    isLiked: true,
    groupId: "nigeria-warriors",
    post_likes: [], // Add this property as required by Post type
  },
];

export function GroupDetail() {
  const params = useParams();
  const groupId = params.id as string;
  const [posts, setPosts] = useState(mockGroupPosts);
  const [isJoined, setIsJoined] = useState(true);

  // Get group data (in real app, this would be fetched from API)
  const group = mockGroupData[groupId as keyof typeof mockGroupData];

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNewPost = (newPost: any) => {
    setPosts([{ ...newPost, groupId }, ...posts]);
  };

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

  const handleJoinGroup = () => {
    setIsJoined(!isJoined);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/groups">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Groups
        </Button>
      </Link>

      {/* Group Header */}
      <Card>
        <div className="aspect-[3/1] relative">
          <img
            src={group.image || "/placeholder.svg"}
            alt={group.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute top-4 right-4">
            <Badge variant={group.type === "country" ? "default" : "secondary"}>
              {group.type === "country" ? (
                <MapPin className="w-3 h-3 mr-1" />
              ) : (
                <Heart className="w-3 h-3 mr-1" />
              )}
              {group.type === "country" ? "Country" : "Theme"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground text-xs mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{group.memberCount.toLocaleString()} members</span>
                </div>
                <span>Created {group.createdAt.toLocaleDateString()}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {group.description}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isJoined ? "outline" : "default"}
                onClick={handleJoinGroup}
              >
                {isJoined ? "Leave Group" : "Join Group"}
              </Button>
              <Button variant="outline" size="icon">
                <Share className="w-4 h-4" />
              </Button>
              {isJoined && (
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Content */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {isJoined && <CreatePostForm onPostCreated={handleNewPost} />}

          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>

          <div className="text-center py-8">
            <Button variant="outline">Load More Posts</Button>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Group Rules</h3>
              <ul className="space-y-2">
                {group.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-semibold">
                      {index + 1}.
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Moderators</h3>
              <div className="space-y-2">
                {group.moderators.map((moderator, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-semibold">
                        {moderator.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{moderator}</span>
                    <Badge variant="outline" className="text-xs">
                      Moderator
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mock member list */}
                {[
                  { name: "Amara Johnson", genotype: "SS", joinedDays: 2 },
                  { name: "Kemi Adebayo", genotype: "SC", joinedDays: 5 },
                  { name: "Tunde Okafor", genotype: "SS", joinedDays: 8 },
                  { name: "Fatima Hassan", genotype: "AS", joinedDays: 12 },
                ].map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-secondary-foreground font-semibold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.genotype} • Joined {member.joinedDays} days ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline">View All Members</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
