"use client";

/* eslint-disable @next/next/no-img-element */
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CreatePostForm } from "@/components/create-post-form";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, MapPin, Heart, Settings, Share } from "lucide-react";
import { Loader2 } from "lucide-react"; // spinner
import { useGetGroupById } from "@/hooks/react-query/use-group-by-id";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { useIsUserInGroup } from "@/hooks/react-query/use-is-user-in-group";
import { groupService } from "@/lib/supabase/service/groups-service";
import { useGroupPosts } from "@/hooks/react-query/use-group-posts";

export function GroupDetail() {
  const { data: user } = useCurrentUserProfile();

  const params = useParams();
  const groupId = params.id as string;

  const { data: group, isLoading, error, refetch } = useGetGroupById(groupId);
  const { data: isMember, refetch: memberRefetch } = useIsUserInGroup(
    groupId,
    user?.user.id as string
  );

  const [page, setPage] = useState(0);

  const {
    data: postsData,
    // isLoading: isPostLoading,
    // error: isPostError,
    refetch: postRefetch,
  } = useGroupPosts(groupId, page, 10);

  const [defaultTab, setDefaultTab] = useState(isMember ? "posts" : "about");

  useEffect(() => {
    setDefaultTab(isMember ? "posts" : "about");
  }, [isMember]);

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
        likes: post.post_likes.length || 0,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

  // Handle new posts locally
  const handleNewPost = () => {
    postRefetch();
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

  const handleJoinGroup = async (groupId: string) => {
    setIsLoading(true);
    try {
      if (!isMember) {
        await groupService.joinGroup(groupId, user?.user.id as string);
      } else {
        await groupService.leaveGroup(groupId, user?.user.id as string);
      }
      refetch();
      memberRefetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="mb-2">
        <Link href="/groups">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </Link>
      </div>

      {/* Group Header */}
      <Card className="!pt-0">
        <div className="aspect-[12/1] relative">
          <img
            src={group.image_url || "/placeholder.svg"}
            alt={group.name}
            className="w-full h-[200px] object-cover rounded-t-lg"
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

        <CardContent className="p-6 py-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground text-xs mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{group.member_count?.toLocaleString()} members</span>
                </div>
                <span>
                  Created {new Date(group.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {group.description}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isMember ? "outline" : "default"}
                onClick={() => handleJoinGroup(groupId)}
              >
                {isMember
                  ? loading
                    ? "Leaving Group"
                    : "Leave Group"
                  : loading
                  ? "Joining Group"
                  : "Join Group"}
              </Button>
              <Button variant="outline" size="icon">
                <Share className="w-4 h-4" />
              </Button>
              {isMember && (
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Content */}
      <Tabs
        value={defaultTab}
        onValueChange={setDefaultTab}
        className="space-y-6"
      >
        <TabsList>
          {isMember && <TabsTrigger value="posts">Posts</TabsTrigger>}
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {isMember && (
            <CreatePostForm onPostCreated={handleNewPost} groupId={groupId} />
          )}
          {isMember && (
            <div className="space-y-4">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    groupId={groupId}
                    isGroup={true}
                  />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No posts to show yet.</p>
                </Card>
              )}

              {posts && posts.length > 0 && (
                <div className="text-center py-8">
                  <Button variant="outline" onClick={handleLoadMore}>
                    Load More Posts
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardContent className="p-6 py-0">
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p>{group.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardContent className="p-6 py-0">
              <h3 className="text-lg font-semibold mb-4">Recent Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  group.group_members?.map((member: any, index: number) => (
                    <Link href={`/profile/${member.user.username}`} key={index}>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                          <span className="text-secondary-foreground font-semibold">
                            {member.user.first_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {member.user.first_name} {member.user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.user.genotype} • Joined{" "}
                            {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
