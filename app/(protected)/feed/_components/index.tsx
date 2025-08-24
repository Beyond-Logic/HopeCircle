"use client";

import { useState, useEffect } from "react";
import { CreatePostForm } from "@/components/create-post-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Clock,
  Users,
  UserPlus,
  Heart,
  Loader2,
  User,
} from "lucide-react";
import { useGetPosts } from "@/hooks/react-query/use-posts-service";
import { PostCard } from "@/components/post-card";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { Textarea } from "@/components/ui/textarea";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@radix-ui/react-avatar";
import { authService } from "@/lib/supabase/service/auth-service";

export function Feed() {
  const [activeTab, setActiveTab] = useState<
    "recent" | "my-groups" | "following" | "popular"
  >("recent");
  const [page, setPage] = useState(0);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { data: user } = useCurrentUserProfile();
  const currentUserId = user?.user.id as string;

  const {
    data: postsData,
    isLoading,
    refetch,
  } = useGetPosts({
    page,
    limit: 10,
    filter: activeTab,
    userId: currentUserId,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    authService
      .getAvatarUrl(user?.profile?.avatar_url as string)
      .then(setProfilePreview);
    
  }, [user?.profile?.avatar_url]);

  // Merge paginated posts
  useEffect(() => {
    if (postsData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = postsData.map((post: any) => ({
        id: post.id,
        author: {
          id: post.author.id,
          name: `${post.author.first_name} ${post.author.last_name}`,
          genotype: post.author.genotype,
          country: post.author.country,
          avatar: post.author.avatar_url || null,
          username: post.author.username,
          avatar_preview: post.author.avatar_preview,
        },
        content: post.content,
        images: post.images || [],
        group: post.group ? { id: post.group.id, name: post.group.name } : null,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        likes: post.likes_count ?? (post.post_likes.length || 0),
        post_likes: post.post_likes || [],
        comments: post.comments?.[0]?.count || 0,
        postTags: post.post_tags || [],
      }));

      if (page === 0) {
        setPosts(formatted); // reset when tab changes
      } else {
        setPosts((prev) => [...prev, ...formatted]);
      }
    }
  }, [postsData, page]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab);
    setPage(0); // reset pagination
  };

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

      {/* Create Post */}
      {!showCreatePost ? (
        <Card
          className="p-4 py-2 cursor-text"
          onClick={() => setShowCreatePost(true)}
        >
          <div className="flex gap-3 items-center">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage
                src={profilePreview || `/placeholder.svg?height=40&width=40`}
                alt="Your avatar"
                className="rounded-full"
              />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Share your thoughts, experiences, or encouragement with the community... Use @ to tag people you follow"
              className="resize-none pointer-events-none"
            />
          </div>
        </Card>
      ) : (
        <CreatePostForm
          onPostCreated={() => {
            refetch();
            setShowCreatePost(false);
          }}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="recent">
            <Clock className="w-4 h-4" /> Recent
          </TabsTrigger>
          <TabsTrigger value="my-groups">
            <Users className="w-4 h-4" /> My Groups
          </TabsTrigger>
          <TabsTrigger value="following">
            <UserPlus className="w-4 h-4" /> Following
          </TabsTrigger>
          <TabsTrigger value="popular">
            <TrendingUp className="w-4 h-4" /> Popular
          </TabsTrigger>
        </TabsList>

        {["recent", "my-groups", "following", "popular"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={refetch as never}
                  onDelete={refetch as never}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No posts to show yet.</p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Load More */}
      {posts && posts.length > 0 && (
        <div className="text-center py-8">
          <Button variant="outline" onClick={handleLoadMore}>
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
}
