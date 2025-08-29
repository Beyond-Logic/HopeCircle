"use client";

import { useState, useEffect, use, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  MessageCircle,
  Settings,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import {
  useProfileByUsername,
  useCurrentUserProfile,
} from "@/hooks/react-query/use-auth-service";
import { authService } from "@/lib/supabase/service/auth-service";
import { userService } from "@/lib/supabase/service/users-service";
import { toast } from "sonner";
import { useUserFollowing } from "@/hooks/react-query/use-get-user-following";
import { useUserGroups } from "@/hooks/react-query/use-user-groups";
import { useUserPosts } from "@/hooks/react-query/use-user-posts";
import { useUserFollowers } from "@/hooks/react-query/use-get-user-followers";
import { GroupRoleBadge } from "@/components/group-role-badge";

export function Profile() {
  const params = useParams();
  const { data } = useCurrentUserProfile();

  const user = data?.user;
  const userId = params.id as string;

  const isMe = userId === "me";

  const {
    data: currentUserProfileData,
    isLoading: isLoadingCurrentUser,
    isError: isErrorCurrentUser,
  } = useCurrentUserProfile();
  const {
    data: otherUserProfileData,
    isLoading: isLoadingOtherUser,
    isError: isErrorOtherUser,
  } = useProfileByUsername(userId);

  const profileData = isMe ? currentUserProfileData : otherUserProfileData;
  const isLoading = isMe ? isLoadingCurrentUser : isLoadingOtherUser;
  const isError = isMe ? isErrorCurrentUser : isErrorOtherUser;

  const {
    data: userPosts,
    isLoading: isUserPostsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(profileData?.profile?.id as string, 10);

  const posts = useMemo(() => {
    if (!userPosts?.pages) return [];
    return userPosts.pages.flatMap((page) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      page.data.map((post: any) => ({
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
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        likes: post.post_likes.length || 0,
        post_likes: post.post_likes || [],
        comments: post.comments?.[0]?.count || 0,
        postTags: post.post_tags || [],
      }))
    );
  }, [userPosts?.pages]);

  const postCount = userPosts?.pages?.[0].count ?? 0;

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // State for posts and avatar preview
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const {
    data: userGroups,
    isLoading: isUserGroupsLoading,
    fetchNextPage: fetchNextGroupPage,
    hasNextPage: hasMoreGroups,
    isFetchingNextPage: isFetchingMoreGroups,
  } = useUserGroups(profileData?.user?.id as string, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups: any[] = useMemo(() => {
    if (!userGroups?.pages) return [];
    return userGroups.pages.flatMap((page) => page.data);
  }, [userGroups?.pages]);

  const groupCount = userGroups?.pages?.[0]?.count ?? 0;

  // const error = isMe ? errorCurrentUser : errorOtherUser;

  const { data: followers } = useUserFollowers(user?.id);
  const { data: following, refetch } = useUserFollowing(user?.id);

  const isFollowing = following?.some((f) => f.id === profileData?.profile.id);

  // ---------------------------
  // Set avatar preview when profile loads
  // ---------------------------
  useEffect(() => {
    if (!profileData?.profile?.avatar_url) {
      setProfilePreview(null);
      return;
    }

    authService
      .getAvatarUrl(profileData.profile.avatar_url)
      .then(setProfilePreview);
  }, [profileData]);

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
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ---------------------------
  // Loading & error states
  // ---------------------------
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (isError || !profileData?.profile)
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Link href="/feed">
          <Button>Back to Feed</Button>
        </Link>
      </div>
    );

  const handleFollowUser = async () => {
    if (!user) return;
    setIsFollowLoading(true);
    try {
      await userService.followUser(user.id, profileData.profile.id);
      refetch();
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user. Please try again.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnFollowUser = async () => {
    if (!user) return;
    setIsFollowLoading(true);
    try {
      await userService.unfollowUser(user.id, profileData.profile.id);
      refetch();
    } catch (error) {
      console.error("Error un following user:", error);
      toast.error("Failed to unfollow user. Please try again.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={profilePreview as string}
                alt={profileData.profile.username}
              />
              <AvatarFallback className="text-2xl">
                <UserIcon className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {profileData.profile.first_name}{" "}
                    {profileData.profile.last_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3 text-sm">
                    <Badge variant="outline">
                      {profileData.profile.genotype}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profileData.profile.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Joined{" "}
                        {format(
                          parseISO(profileData.profile.created_at),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                  {profileData.profile.bio && (
                    <p className="text-muted-foreground leading-relaxed text-[15px]">
                      {profileData.profile.bio}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {user?.id === profileData.profile.id ? (
                    <Button asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Link href={`/inbox?message=${profileData.profile.id}`}>
                        <Button>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                      {isFollowing ? (
                        <Button
                          variant="outline"
                          onClick={handleUnFollowUser}
                          disabled={isFollowLoading}
                        >
                          {isFollowLoading ? "Unfollow..." : "Unfollow"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleFollowUser}
                          disabled={isFollowLoading}
                        >
                          {isFollowLoading ? "Following..." : "Follow"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!isUserGroupsLoading && !isUserPostsLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 w-fit">
                  <div className="text-center">
                    <div className="text-xl font-bold">{postCount}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{groupCount}</div>
                    <div className="text-sm text-muted-foreground">Groups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {followers?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Followers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">
                      {following?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Following
                    </div>
                  </div>
                </div>
              )}
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
          {posts &&
            posts.length > 0 &&
            posts.map((post) => <PostCard key={post.id} post={post} />)}

          {isUserPostsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            posts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    {user
                      ? "Share your first post with the community!"
                      : "This user hasn't posted yet."}
                  </p>
                </CardContent>
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
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups &&
              groups.length > 0 &&
              // Sort groups: admin groups first
              [...groups]
                .sort((a, b) => {
                  const aIsAdmin = a.created_by === profileData.user.id ? 1 : 0;
                  const bIsAdmin = b.created_by === profileData.user.id ? 1 : 0;
                  return bIsAdmin - aIsAdmin; // admin first
                })
                .map((group) => {
                  const isAdmin = group.created_by === profileData.user.id;

                  return (
                    <Card key={group.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{group.name}</h3>

                            <p className="text-sm text-muted-foreground">
                              {group.member_count.toLocaleString()} members
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/groups/${group.id}`}>View</Link>
                          </Button>
                        </div>
                        <div className="absolute -top-1 right-0">
                          {isAdmin && (
                            <GroupRoleBadge role="admin" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>

          {isUserGroupsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            groups.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                  <p className="text-muted-foreground">
                    {user
                      ? "Create your first group or join a group!"
                      : "This user hasn't joined or created any group yet."}
                  </p>
                </CardContent>
              </Card>
            )
          )}

          {/* Load More */}
          {hasMoreGroups && (
            <div className="text-center py-8">
              <Button
                variant="outline"
                onClick={() => fetchNextGroupPage()}
                disabled={isFetchingMoreGroups}
              >
                {isFetchingMoreGroups ? "Loading..." : "Load More Groups"}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About {profileData.profile.username}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Genotype</h4>
                <Badge variant="secondary">
                  {profileData.profile.genotype}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <p className="text-muted-foreground text-[15px]">
                  {profileData.profile.country}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Member Since</h4>
                <p className="text-muted-foreground text-[15px]">
                  {format(
                    parseISO(profileData.profile.created_at),
                    "MMMM d, yyyy"
                  )}
                </p>
              </div>
              {profileData.profile.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    {profileData.profile.bio}
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
