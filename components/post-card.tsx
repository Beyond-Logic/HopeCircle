/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  User,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Check,
  AtSign,
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
  images?: string[];
  group?: {
    id: string;
    name: string;
  } | null;
  taggedUsers?: Array<{ id: string; name: string }>;
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onEdit?: (postId: string, newContent: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onLike, onEdit, onDelete }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showAllImages, setShowAllImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const currentUserId = "current-user";
  const canEdit = post.author.id === currentUserId;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showAllImages || !post.images) return;

      if (event.key === "Escape") {
        setShowAllImages(false);
      } else if (event.key === "ArrowLeft") {
        setCurrentImageIndex((prev) =>
          prev > 0 ? prev - 1 : post.images!.length - 1
        );
      } else if (event.key === "ArrowRight") {
        setCurrentImageIndex((prev) =>
          prev < post.images!.length - 1 ? prev + 1 : 0
        );
      }
    };

    if (showAllImages) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showAllImages, post.images]);

  const handleComment = () => {
    if (commentText.trim()) {
      // TODO: Implement comment submission
      console.log("Comment:", commentText);
      setCommentText("");
    }
  };

  const openImageCarousel = (index = 0) => {
    setCurrentImageIndex(index);
    setShowAllImages(true);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : post.images!.length - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev < post.images!.length - 1 ? prev + 1 : 0
    );
  };

  const renderImageGrid = () => {
    if (!post.images || post.images.length === 0) return null;

    const images = post.images;
    const imageCount = images.length;

    if (imageCount === 1) {
      return (
        <img
          src={images[0] || "/placeholder.svg"}
          alt="Post image"
          className="mt-3 max-w-full h-auto rounded-lg border cursor-pointer"
          onClick={() => openImageCarousel(0)}
        />
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image || "/placeholder.svg"}
              alt={`Post image ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg border cursor-pointer"
              onClick={() => openImageCarousel(index)}
            />
          ))}
        </div>
      );
    }

    if (imageCount === 3) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <img
            src={images[0] || "/placeholder.svg"}
            alt="Post image 1"
            className="w-full h-48 object-cover rounded-lg border cursor-pointer"
            onClick={() => openImageCarousel(0)}
          />
          <div className="grid grid-rows-2 gap-2">
            {images.slice(1, 3).map((image, index) => (
              <img
                key={index + 1}
                src={image || "/placeholder.svg"}
                alt={`Post image ${index + 2}`}
                className="w-full h-[94px] object-cover rounded-lg border cursor-pointer"
                onClick={() => openImageCarousel(index + 1)}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {images.slice(0, 4).map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image || "/placeholder.svg"}
              alt={`Post image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border cursor-pointer"
              onClick={() => openImageCarousel(index)}
            />
            {index === 3 && imageCount > 4 && (
              <div
                className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => openImageCarousel(3)}
              >
                <span className="text-white font-semibold text-lg">
                  +{imageCount - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleEditPost = () => {
    if (onEdit && editContent.trim() !== post.content) {
      onEdit(post.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  const handleDeletePost = () => {
    if (
      onDelete &&
      window.confirm("Are you sure you want to delete this post?")
    ) {
      onDelete(post.id);
    }
  };

  const startEditingComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
  };

  const saveCommentEdit = () => {
    // TODO: Implement comment edit logic
    console.log("Editing comment:", editingCommentId, editCommentText);
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  return (
    <>
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
                {post.group && (
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <Link href={`/groups/${post.group.id}`}>
                      <Badge
                        variant="secondary"
                        className="text-xs hover:bg-secondary/80"
                      >
                        {post.group.name}
                      </Badge>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeletePost}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEditPost}>
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            )}

            {post.taggedUsers && post.taggedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.taggedUsers.map((user) => (
                  <Link key={user.id} href={`/profile/${user.id}`}>
                    <Badge variant="outline" className="text-xs hover:bg-muted">
                      <AtSign className="w-3 h-3 mr-1" />
                      {user.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {renderImageGrid()}
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
                  className={`w-4 h-4 mr-2 ${
                    post.isLiked ? "fill-current" : ""
                  }`}
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
                    {editingCommentId === "comment-1" ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="min-h-[60px] resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveCommentEdit}>
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelCommentEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
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
                          Thank you for sharing this! It's so encouraging to
                          hear positive updates.
                        </p>
                      </div>
                    )}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-0"
                        onClick={() =>
                          startEditingComment(
                            "comment-1",
                            "Thank you for sharing this! It's so encouraging to hear positive updates."
                          )
                        }
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Gallery Modal */}
      {showAllImages && post.images && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setShowAllImages(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} of {post.images.length}
            </div>

            {/* Previous Button */}
            {post.images.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            {/* Current Image */}
            <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              <img
                src={post.images[currentImageIndex] || "/placeholder.svg"}
                alt={`Post image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Next Button */}
            {post.images.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={goToNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}

            {/* Image Dots Indicator */}
            {post.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {post.images.map((_, index) => (
                  <button
                    title="Select image"
                    type="button"
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
