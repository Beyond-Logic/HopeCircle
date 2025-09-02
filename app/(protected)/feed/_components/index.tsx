"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { CreatePostForm } from "@/components/create-post-form";
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
import Link from "next/link";

export function Feed() {
  const [activeTab, setActiveTab] = useState<
    "recent" | "my-groups" | "following" | "popular"
  >("recent");

  const [showCreatePost, setShowCreatePost] = useState(false);
  // const [loading, setLoading] = useState(false);

  const { data: user } = useCurrentUserProfile();
  const currentUserId = user?.user.id as string;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useGetPosts({
    limit: 10,
    filter: activeTab,
    userId: currentUserId,
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    authService
      .getAvatarUrl(user?.profile?.avatar_url as string)
      .then(setProfilePreview);
  }, [user?.profile?.avatar_url]);

  const posts = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages.flatMap((page) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      page.posts.map((post: any) => ({
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
        group: post.group
          ? {
              id: post.group.id,
              name: post.group.name,
              type: post.group.type || "theme",
            }
          : null,
        group_id: post.group_id,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        likes: post.post_likes.length || 0,
        post_likes: post.post_likes || [],
        comments: post.comments?.[0]?.count || 0,
        postTags: post.post_tags || [],
      }))
    );
  }, [data?.pages]);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as typeof activeTab);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 border-0 shadow-none">
        <CardContent className="p-6 py-0">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg">
                Welcome to your community feed!
              </h2>
              <p className="text-muted-foreground text-sm">
                Share your journey and connect with others.
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
              <Link href={`/profile/me`}>
                <AvatarImage
                  src={profilePreview as string}
                  alt="Your avatar"
                  className="rounded-full"
                />
              </Link>

              <Link href={`/profile/me`}>
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Link>
            </Avatar>

            <Textarea
              placeholder="How are you? - Use @ to tag people you follow"
              className="resize-none pointer-events-none text-[15px]"
            />
          </div>
        </Card>
      ) : (
        <CreatePostForm
          profilePreview={profilePreview as string}
          onPostCreated={() => {
            refetch();
            setShowCreatePost(false);
          }}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger
            value="recent"
            className="flex items-center gap-2 text-sm"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">World</span>
            <span className="sm:hidden">World</span>
          </TabsTrigger>
          <TabsTrigger
            value="my-groups"
            className="flex items-center gap-2 text-sm"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Groups</span>
            <span className="sm:hidden">Groups</span>
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="flex items-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Following</span>
            <span className="sm:hidden">Follow</span>
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="flex items-center gap-2 text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        {["recent", "my-groups", "following", "popular"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {posts &&
              posts.length > 0 &&
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={refetch as never}
                  onDelete={refetch as never}
                  isGroup={false}
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        !isLoading &&
        posts?.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No posts to show yet.</p>
          </Card>
        )
      )}
      {/* Load More */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center"
        >
          {isFetchingNextPage && <Loader2 className="animate-spin" />}
        </div>
      )}
    </div>
  );
}
