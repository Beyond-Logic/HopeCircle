"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, UserCheck, User } from "lucide-react";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { useUserFollowers } from "@/hooks/react-query/use-get-user-followers";
import { useUserFollowing } from "@/hooks/react-query/use-get-user-following";

interface LikeUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string | null;
  genotype: string;
  country: string;
  avatar_preview?: string;
  show_real_name?: boolean;
}

export interface LikeInfo {
  user: LikeUser;
}

interface LikesDisplayProps {
  likes: LikeInfo[];
  postId: string;
}

export function LikesDisplay({ likes }: LikesDisplayProps) {
  const [showLikesModal, setShowLikesModal] = useState(false);
  const { data: currentUser } = useCurrentUserProfile();
  const { data: followers } = useUserFollowers(currentUser?.user.id);
  const { data: following } = useUserFollowing(currentUser?.user.id);

  if (!likes || likes.length === 0) return null;

  // Check if a user is followed by current user
  const isFollowing = (userId: string) => {
    return following?.some((follow) => follow.id === userId) || false;
  };

  // Get current user's likes
  const currentUserLike = likes.find(
    (like) => like?.user?.id === currentUser?.user.id
  );

  // Get other users' likes (excluding current user)
  const otherLikes = likes.filter(
    (like) => like?.user.id !== currentUser?.user?.id
  );

  // Get followed users from other likes
  const followedLikes = otherLikes.filter((like) => isFollowing(like.user.id));

  // Format the like text based on who liked it (Instagram style)
  const getLikeText = () => {
    // Get non-followed users from other likes
    const nonFollowedLikes = otherLikes.filter(
      (like) => !isFollowing(like.user.id)
    );

    const getUserDisplayName = (user: LikeUser) => {
      return user.show_real_name ? user.first_name : user.username;
    };

    if (likes.length === 1) {
      if (currentUserLike) {
        return "You liked this";
      }
      // For single like from someone else
      const singleLike = likes[0];
      if (isFollowing(singleLike.user.id)) {
        return `${getUserDisplayName(singleLike.user)} liked this`;
      }
      // For single like from someone not followed
      return "1 like";
    }

    if (likes.length === 2) {
      if (currentUserLike) {
        // You + 1 other (show name if followed, otherwise just "1 other")
        const otherLike = otherLikes[0];
        if (isFollowing(otherLike.user.id)) {
          return `You and ${getUserDisplayName(otherLike.user)} liked this`;
        }
        return "You and 1 other liked this";
      }
      // Two others (show names if followed, otherwise just "2 others")
      const firstLike = likes[0];
      const secondLike = likes[1];
      const firstFollowed = isFollowing(firstLike.user.id);
      const secondFollowed = isFollowing(secondLike.user.id);

      if (firstFollowed && secondFollowed) {
        return `${getUserDisplayName(firstLike.user)} and ${getUserDisplayName(
          secondLike.user
        )} liked this`;
      } else if (firstFollowed) {
        return `${getUserDisplayName(firstLike.user)} and 1 other liked this`;
      } else if (secondFollowed) {
        return `${getUserDisplayName(secondLike.user)} and 1 other liked this`;
      }
      return "2 others liked this";
    }

    if (likes.length >= 3) {
      if (currentUserLike) {
        // You + others
        if (followedLikes.length === 0) {
          return `You and ${nonFollowedLikes.length} others liked this`;
        }

        const firstFollowed = followedLikes[0];
        if (followedLikes.length === 1) {
          if (nonFollowedLikes.length === 0) {
            return `You and ${getUserDisplayName(
              firstFollowed.user
            )} liked this`;
          }
          return `You, ${getUserDisplayName(firstFollowed.user)} and ${
            nonFollowedLikes.length
          } others liked this`;
        }

        const secondFollowed = followedLikes[1];
        if (nonFollowedLikes.length === 0) {
          return `You, ${getUserDisplayName(
            firstFollowed.user
          )} and ${getUserDisplayName(secondFollowed.user)} liked this`;
        }
        return `You, ${getUserDisplayName(
          firstFollowed.user
        )}, ${getUserDisplayName(secondFollowed.user)} and ${
          nonFollowedLikes.length
        } others liked this`;
      }

      // Only others
      if (followedLikes.length === 0) {
        return `${nonFollowedLikes.length} others liked this`;
      }

      if (followedLikes.length === 1) {
        if (nonFollowedLikes.length === 0) {
          return `${getUserDisplayName(followedLikes[0].user)} liked this`;
        }
        return `${getUserDisplayName(followedLikes[0].user)} and ${
          nonFollowedLikes.length
        } others liked this`;
      }

      if (followedLikes.length === 2) {
        if (nonFollowedLikes.length === 0) {
          return `${getUserDisplayName(
            followedLikes[0].user
          )} and ${getUserDisplayName(followedLikes[1].user)} liked this`;
        }
        return `${getUserDisplayName(
          followedLikes[0].user
        )}, ${getUserDisplayName(followedLikes[1].user)} and ${
          nonFollowedLikes.length
        } others liked this`;
      }

      // More than 2 followed users, show first 2
      if (nonFollowedLikes.length === 0) {
        return `${getUserDisplayName(
          followedLikes[0].user
        )}, ${getUserDisplayName(followedLikes[1].user)} and ${
          followedLikes.length - 2
        } others liked this`;
      }
      return `${getUserDisplayName(
        followedLikes[0].user
      )}, ${getUserDisplayName(followedLikes[1].user)} and ${
        nonFollowedLikes.length
      } others liked this`;
    }

    return "";
  };

  // Check if users follow each other (mutual)
  const isMutualFollow = (userId: string) => {
    const isCurrentUserFollowing = isFollowing(userId);
    const isUserFollowingCurrent =
      followers?.some((follow) => follow.id === userId) || false;
    return isCurrentUserFollowing && isUserFollowingCurrent;
  };

  
  // Get full user name
  const getUserName = (user: LikeUser) => {
    return user.show_real_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.username;
  };

  return (
    <>
      <div
        className="text-xs text-primary mt-2 cursor-pointer hover:underline"
        onClick={() => setShowLikesModal(true)}
      >
        {getLikeText()}
      </div>

      <Dialog open={showLikesModal} onOpenChange={setShowLikesModal}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              {likes.length} {likes.length === 1 ? "Like" : "Likes"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {likes.map((like) => (
              <div
                key={like.user.id}
                className="flex items-center justify-between p-2 py-0 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${like.user.username}`}>
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={
                          like.user.avatar_preview || like.user.avatar_url || ""
                        }
                        alt={getUserName(like.user)}
                      />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${like.user.username}`}
                      className="font-medium hover:underline"
                    >
                      {getUserName(like.user)}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {isMutualFollow(like?.user.id) && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <UserCheck className="w-3 h-3" />
                          Mutual
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {currentUser?.user.id !== like.user.id && (
                  <Link href={`/inbox?message=${like.user.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
