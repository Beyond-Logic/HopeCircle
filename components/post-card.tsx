/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    genotype: string;
    country: string;
    avatar: string | null;
  };
  content: string;
  image: string | null;
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = () => {
    if (commentText.trim()) {
      // TODO: Implement comment submission
      console.log("Comment:", commentText);
      setCommentText("");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={
                  post.author.avatar || "/placeholder.svg?height=40&width=40"
                }
                alt={post.author.name}
              />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold hover:underline"
              >
                {post.author.name}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{post.author.genotype}</span>
                <span>•</span>
                <span>{post.author.country}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          {post.image && (
            <img
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              className="mt-3 max-w-full h-auto rounded-lg border"
            />
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={post.isLiked ? "text-accent hover:text-accent" : ""}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`}
              />
              {post.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="Your avatar"
                />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[60px] resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Mock Comments */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        Maria Santos
                      </span>
                      <span className="text-xs text-muted-foreground">
                        2h ago
                      </span>
                    </div>
                    <p className="text-sm">
                      Thank you for sharing this! It's so encouraging to hear
                      positive updates.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-auto p-0"
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Like
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-auto p-0"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
