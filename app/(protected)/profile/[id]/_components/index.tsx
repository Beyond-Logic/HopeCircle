"use client";

import { useState, useEffect, use } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import {
  useProfileByUsername,
  useCurrentUserProfile,
} from "@/hooks/react-query/use-auth-service";
import { authService } from "@/lib/supabase/service/auth-service";
import { userService } from "@/lib/supabase/service/users-service";
import { toast } from "sonner";
import { useUserFollowing } from "@/hooks/react-query/use-get-user-following";

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
      username: "amara_j",
      avatar_preview: ""
    },
    content:
      "Just had my monthly check-up and my hemoglobin levels are stable! Feeling grateful for this community's support during my tough days.",
    image: null,
    updatedAt: new Date("2024-01-15T10:30:00Z"),
    createdAt: new Date("2024-01-15T09:00:00Z"),
    likes: 24,
    comments: 8,
    isLiked: false,
    post_likes: [], // Add this property to match the Post type
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
  const { user } = useAuth();

  console.log("params id:", userId);

  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // State for posts and avatar preview
  const [posts, setPosts] = useState(mockUserPosts);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // ---------------------------
  // React Query hooks
  // ---------------------------
  const isMe = userId === "me";
  const {
    data: currentUserProfileData,
    isLoading: isLoadingCurrentUser,
    isError: isErrorCurrentUser,
    error: errorCurrentUser,
  } = useCurrentUserProfile();
  const {
    data: otherUserProfileData,
    isLoading: isLoadingOtherUser,
    isError: isErrorOtherUser,
    error: errorOtherUser,
  } = useProfileByUsername(userId);

  const profileData = isMe ? currentUserProfileData : otherUserProfileData;
  const isLoading = isMe ? isLoadingCurrentUser : isLoadingOtherUser;
  const isError = isMe ? isErrorCurrentUser : isErrorOtherUser;
  const error = isMe ? errorCurrentUser : errorOtherUser;

  const { data: following, refetch } = useUserFollowing(user?.id);

  // const { data: followers } = useUserFollowers(user?.id);

  console.log("Profile data:", profileData, error);

  const isFollowing = following?.some((f) => f.id === profileData?.profile.id);

  console.log("Is following:", isFollowing, following);

  // console.log("Followers data:", followers);

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

  // ---------------------------
  // Loading & error states
  // ---------------------------
  if (isLoading) return null;
  if (isError || !profileData?.profile)
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Link href="/feed">
          <Button>Back to Feed</Button>
        </Link>
      </div>
    );

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
                src={profilePreview || "/placeholder.svg?height=96&width=96"}
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
                    <Badge variant="secondary">
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
                      <Button>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
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

              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold">10</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">20</div>
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
                  {user
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
