"use client";

import { useState, useEffect } from "react";

import { CreatePostForm } from "@/components/create-post-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, Clock, Users, UserPlus } from "lucide-react";
import { useGetPosts } from "@/hooks/react-query/use-posts-service";
import { PostCard } from "@/components/post-card";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";

export function Feed() {
  const {
    data: postsData,
    refetch,
    isLoading,
  } = useGetPosts({ page: 0, limit: 10 });
  const [posts, setPosts] = useState<typeof postsData>([]);
  const [activeTab, setActiveTab] = useState("recent");
  const { data: user } = useCurrentUserProfile();

  const currentUserId = user?.user.id as string;
  console.log("Current User ID in feed:", currentUserId, postsData);

  // console.log("Fetched posts:", postsData);

  // Update posts when data from backend changes
  useEffect(() => {
    if (postsData) {
      // Map backend post structure to front-end PostCard props if needed

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedPosts = postsData.map((post: any) => ({
        id: post.id,
        author: {
          id: post.author.id,
          name: `${post.author.first_name} ${post.author.last_name}`,
          genotype: post.author.genotype,
          country: post.author.country,
          avatar: post.author.avatar_url || null,
          username: post.author.username,
        },
        content: post.content,
        images: post.images || [],
        group: post.group ? { id: post.group.id, name: post.group.name } : null,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        likes: post.post_likes.length || 0,
        post_likes: post.post_likes || [],
        comments: post.comments?.[0]?.count || 0,
        postTags: post.post_tags || [],
      }));
      setPosts(formattedPosts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postsData]);

  const handlePost = () => {
    refetch();
  };

  const getFilteredPosts = () => {
    let filteredPosts = posts;

    switch (activeTab) {
      case "my-groups":
        filteredPosts = posts?.filter((post) => post.group); // adjust if you track user's joined groups
        break;
      case "following":
        filteredPosts = posts?.filter((post) => post.author.id); // adjust if you track user's following
        break;
      case "popular":
        filteredPosts = posts && [...posts].sort((a, b) => b.likes - a.likes);
        break;
      default: // recent
        filteredPosts = [...(posts ?? [])].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return filteredPosts;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                Welcome to your community feed!
              </h2>
              <p className="text-muted-foreground text-sm">
                Share your journey and connect with fellow warriors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Post Form */}
      <CreatePostForm onPostCreated={handlePost} />

      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger
            value="recent"
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Recent</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger
            value="my-groups"
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">My Groups</span>
            <span className="sm:hidden">Groups</span>
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Following</span>
            <span className="sm:hidden">Follow</span>
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="flex items-center gap-2 text-xs md:text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        {["recent", "my-groups", "following", "popular"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onEdit={handlePost} />
              ))
            ) : isLoading ? (
              ""
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No posts to show yet.</p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Load More */}
      <div className="text-center py-8">
        <Button variant="outline">Load More Posts</Button>
      </div>
    </div>
  );
}
