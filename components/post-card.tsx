/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  ImageIcon,
  Globe,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { usePostImages } from "@/hooks/react-query/use-post-images";
import { postService } from "@/lib/supabase/service/post-service";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useUserFollowers } from "@/hooks/react-query/use-get-user-followers";
import { useAddComment } from "@/hooks/react-query/use-add-comment";
import { useComments } from "@/hooks/react-query/use-comments";
import {
  useLikeComment,
  useUnlikeComment,
} from "@/hooks/react-query/use-like-comment";
import { useUpdateComment } from "@/hooks/react-query/use-update-comment";
import { useLikePost, useUnlikePost } from "@/hooks/react-query/use-like-post";

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    genotype: string;
    country: string;
    avatar: string | null;
    username: string;
  };
  content: string;
  images?: string[];
  group?: {
    id: string;
    name: string;
  } | null;
  taggedUsers?: Array<{ id: string; name: string }>;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  post_likes: Array<{ user_id: string }>;
  postTags?: Array<{ tagged_user: { id: string; username: string } }>;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onEdit?: (postId: string, newContent: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onLike, onEdit, onDelete }: PostCardProps) {
  const { data: user } = useCurrentUserProfile();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showAllImages, setShowAllImages] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    post.group?.id || "your-timeline"
  );

  // Add these with your other state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [taggedUsers, setTaggedUsers] = useState<
    Array<{ id: string; username: string }>
  >([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: addComment, isPending } = useAddComment();

  const {
    data: commentsData,
    error,
    isLoading: isCommentLoading,
  } = useComments(post.id);

  const comments = commentsData?.data || [];

  const currentUserId = user?.user.id || "";

  const isPostLiked = !!post.post_likes?.find(
    (like) => like.user_id === currentUserId
  );

  console.log("currentUserId", currentUserId, post);

  const canEdit = post.author.id === currentUserId;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 🔑 Convert storage keys → signed URLs
  const { data, refetch } = usePostImages(post.images);
  const imageUrls = data;

  // console.log("post", post);

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
      addComment(
        {
          postId: post.id,
          authorId: user?.user.id as string,
          content: commentText,
        },
        {
          onSuccess: () => {
            setCommentText(""); // reset input after success
          },
          onError: (err) => {
            toast.error(`Failed to add comment: ${err.message}`);
          },
        }
      );
    }
  };

  const openImageCarousel = (index = 0) => {
    setCurrentImageIndex(index);
    setShowAllImages(true);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : (imageUrls?.length ?? 0) - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev < (imageUrls?.length ?? 0) - 1 ? prev + 1 : 0
    );
  };

  const removeExistingImage = (key: string) => {
    setRemovedImages((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const renderImageGrid = () => {
    if (!post.images || post.images.length === 0) return null;

    const images = imageUrls;
    const imageCount = images?.length;

    if (imageCount === 1) {
      return (
        <img
          src={(images && images[0]) || "/placeholder.svg"}
          alt="Post image"
          className="mt-3 max-w-full h-auto rounded-lg border cursor-pointer"
          onClick={() => openImageCarousel(0)}
        />
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {images?.map((image, index) => (
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
            src={(images && images[0]) || "/placeholder.svg"}
            alt="Post image 1"
            className="w-full h-48 object-cover rounded-lg border cursor-pointer"
            onClick={() => openImageCarousel(0)}
          />
          <div className="grid grid-rows-2 gap-2">
            {images?.slice(1, 3).map((image, index) => (
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
        {images?.slice(0, 4).map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image || "/placeholder.svg"}
              alt={`Post image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border cursor-pointer"
              onClick={() => openImageCarousel(index)}
            />
            {index === 3 && imageCount && imageCount > 4 && (
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

  const { mutate: likeMutate } = useLikeComment();
  const { mutate: unlikeMutate } = useUnlikeComment();

  // Keys that remain after "remove" clicks (preserve original order)
  const existingKeys = useMemo(
    () => (post.images || []).filter((k) => !removedImages.includes(k)),
    [post.images, removedImages]
  );

  // Map each storage key to its signed URL (built from original order)
  const urlByKey = useMemo(() => {
    const m = new Map<string, string | null>();
    (post.images || []).forEach((k, idx) => {
      m.set(k, imageUrls?.[idx] ?? null);
    });
    return m;
  }, [post.images, imageUrls]);

  const handleCommentLike = (commentId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeMutate({ commentId, userId: currentUserId });
    } else {
      likeMutate({ commentId, userId: currentUserId });
    }
  };

  const { mutate: postLikeMutate } = useLikePost();
  const { mutate: postUnlikeMutate } = useUnlikePost();

  const handleLike = () => {
    if (isPostLiked) {
      postUnlikeMutate({ postId: post.id, userId: currentUserId });
    } else {
      postLikeMutate({ postId: post.id, userId: currentUserId });
    }
  };

  const handleEditPost = async () => {
    setIsLoading(true);
    try {
      // keep remaining existing images in original order
      const updatedImages = [...existingKeys];

      // upload new images (max 1MB already enforced)
      for (let i = 0; i < newImages.length; i++) {
        const key = await postService.uploadPostImage(newImages[i], post.id, i);
        updatedImages.push(key);
      }

      const updates = {
        content: contentValue.trim(),
        images: updatedImages,
        group_id: selectedGroupId !== "your-timeline" ? selectedGroupId : null,
        // tags later
      };

      const { data, error } = await postService.updatePost(post.id, updates);
      if (error) throw error;

      onEdit?.(post.id, data); // ensure parent updates `post.images`
      setIsEditing(false);
      setNewImages([]);
      setRemovedImages([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setContent(post.content);
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

  const { mutate: updateCommentMut, isPending: isCommentUpdatePending } =
    useUpdateComment();

  const saveCommentEdit = (id: string) => {
    if (!editCommentText.trim()) return;

    updateCommentMut(
      { id, content: editCommentText },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditCommentText("");
        },
      }
    );
  };

  const { mutate: createCommentMut, isPending: isReplying } = useAddComment();

  const handleReplySubmit = (commentId: string) => {
    if (!replyText.trim()) return;

    createCommentMut(
      {
        postId: post.id,
        authorId: currentUserId, // make sure you pass the logged-in user id
        content: replyText,
        parentCommentId: commentId,
      },
      {
        onSuccess: () => {
          setReplyingToId(null);
          setReplyText("");
        },
      }
    );
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const userGroups = [
    { id: "nigeria-warriors", name: "Nigeria Warriors" },
    { id: "caregivers-support", name: "Caregivers Support" },
    { id: "young-adults", name: "Young Adults with SCD" },
    { id: "healthcare-pros", name: "Healthcare Professionals" },
  ];

  const { data: followed } = useUserFollowers(user?.user.id);

  const followedUsers = followed || [];

  const [content, setContent] = useState(post.content || "");
  const contentValue = content;

  useEffect(() => {
    setTaggedUsers(
      post.postTags
        ? post.postTags
            .map((item) => {
              if (!item.tagged_user?.id || !item.tagged_user?.username)
                return null;
              return {
                id: item.tagged_user.id,
                username: item.tagged_user.username,
              };
            })
            .filter(
              (user): user is { id: string; username: string } => user !== null
            )
        : []
    );
  }, [post.postTags]);

  const handleContentChange = (value: string) => {
    setContent(value);

    const atIndex = value.lastIndexOf("@");
    if (atIndex !== -1) {
      const query = value.slice(atIndex + 1);
      if (query.length > 0 && !query.includes(" ")) {
        setTagQuery(query);
        setShowTagSuggestions(true);
      } else {
        setShowTagSuggestions(false);
      }
    } else {
      setShowTagSuggestions(false);
    }
  };

  const selectUserForTag = (user: { id: string; username: string }) => {
    const atIndex = contentValue.lastIndexOf("@");
    const beforeAt = contentValue.slice(0, atIndex);
    const afterQuery = contentValue.slice(atIndex + tagQuery.length + 1);

    const newContent = `${beforeAt}@${user.username} ${afterQuery}`;
    setContent(newContent);

    if (!taggedUsers.find((u) => u.id === user.id)) {
      setTaggedUsers((prev) => [...prev, user]);
    }

    setShowTagSuggestions(false);
    setTagQuery("");
  };

  const removeTaggedUser = (userId: string) => {
    setTaggedUsers((prev) => prev.filter((u) => u.id !== userId));
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
                  href={`/profile/${post.author.username}`}
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
                    {post.updatedAt &&
                      formatDistanceToNow(post.updatedAt, { addSuffix: true })}
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
                {!post.group?.id && userGroups.length > 1 && (
                  <div className="space-y-2">
                    {/* <label className="text-sm font-medium text-muted-foreground">
                                Post to:
                              </label> */}
                    <Select
                      value={selectedGroupId}
                      onValueChange={setSelectedGroupId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select where to post (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="your-timeline">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Select community
                          </div>
                        </SelectItem>
                        {userGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {group.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex-1 relative flex flex-col gap-4">
                  <Textarea
                    value={contentValue}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  {showTagSuggestions && (
                    <div className="absolute top-full left-0 right-0 bg-background border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {followedUsers
                        .filter((user) =>
                          user.username
                            .toLowerCase()
                            .includes(tagQuery.toLowerCase())
                        )
                        .map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
                            onClick={() => selectUserForTag(user)}
                          >
                            <AtSign className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-xs text-muted-foreground">
                                {user.genotype} • {user.country}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                  {taggedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">
                        Tagged:
                      </span>
                      {taggedUsers.map((user) => (
                        <Badge
                          key={user.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <AtSign className="w-3 h-3" />
                          {user.username}
                          <button
                            title="remove tag"
                            type="button"
                            onClick={() => removeTaggedUser(user.id)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Image Upload + Preview */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleImageButtonClick}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Photos ({existingKeys.length + newImages.length}/6)
                      </Button>
                    </label>
                    <input
                      ref={fileInputRef}
                      title="Upload Images (max 1MB each)"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const valid = files.filter(
                          (f) => f.size <= 1024 * 1024
                        );
                        if (valid.length !== files.length) {
                          toast.error(
                            "Some images were larger than 1MB and skipped."
                          );
                        }
                        setNewImages((prev) => [...prev, ...valid]);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Existing images */}
                    {existingKeys.map((key) => (
                      <div key={key} className="relative">
                        <img
                          src={urlByKey.get(key) || "/placeholder.svg"}
                          alt="Existing"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeExistingImage(key)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}

                    {/* New images */}
                    {newImages.map((file, i) => (
                      <div key={i} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeNewImage(i)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleEditPost}
                    disabled={isLoading}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : <>Save</>}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap line-clamp-5">
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

            {!isEditing && renderImageGrid()}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike()}
                className={isPostLiked ? "text-accent hover:text-white" : "hover:text-white"}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${
                    isPostLiked ? "fill-current" : ""
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
                      disabled={isPending || !commentText.trim()}
                    >
                      {isPending ? "Commenting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => {
                  const isLiked =
                    comment.likes?.some(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (like: any) => like.user.id === currentUserId
                    ) || false;

                  const likes_count = comment.likes?.length || 0;
                  const canEditComment = comment.author.id === currentUserId;

                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {/* Edit mode */}
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                              className="min-h-[60px] resize-none"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={
                                  isCommentUpdatePending ||
                                  !editCommentText.trim()
                                }
                                onClick={() => saveCommentEdit(comment?.id)}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                {isCommentUpdatePending ? "Saving..." : "Save"}
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
                          <div className="bg-muted rounded-lg p-3 pt-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {comment.author.first_name}{" "}
                                {comment.author.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  comment.updated_at
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCommentLike(comment.id, isLiked)
                            }
                            className={`text-xs h-auto !p-1 ${
                              isLiked
                                ? "text-accent hover:text-white"
                                : "hover:text-white"
                            }`}
                          >
                            <Heart
                              className={`w-3 h-3 mr-1 ${
                                isLiked ? "fill-current" : ""
                              }`}
                            />
                            Like <span className="ml-1">{likes_count}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto !p-1"
                            onClick={() =>
                              setReplyingToId(
                                replyingToId === comment.id ? null : comment.id
                              )
                            }
                          >
                            Reply
                          </Button>

                          {canEditComment && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-auto !p-1"
                              onClick={() =>
                                startEditingComment(comment.id, comment.content)
                              }
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>

                        {/* Reply box */}
                        {replyingToId === comment.id && (
                          <div className="mt-2 ml-8">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="min-h-[50px] resize-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                disabled={isReplying || !replyText.trim()}
                                onClick={() => handleReplySubmit(comment.id)}
                              >
                                {isReplying ? "Replying..." : "Reply"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingToId(null);
                                  setReplyText("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies?.length > 0 && (
                          <div className="mt-3 ml-8 space-y-3">
                            {
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              comment.replies.map((reply: any) => {
                                const isReplyLiked =
                                  reply.likes?.some(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (like: any) =>
                                      like.user.id === currentUserId
                                  ) || false;

                                const replyLikesCount =
                                  reply.likes?.length || 0;
                                const canEditReply =
                                  reply.author.id === currentUserId;

                                return (
                                  <div key={reply.id} className="flex gap-3">
                                    <Avatar className="w-6 h-6 flex-shrink-0">
                                      <AvatarFallback>
                                        <User className="w-3 h-3" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      {/* Edit mode for reply */}
                                      {editingCommentId === reply.id ? (
                                        <div className="space-y-2">
                                          <Textarea
                                            value={editCommentText}
                                            onChange={(e) =>
                                              setEditCommentText(e.target.value)
                                            }
                                            className="min-h-[50px] resize-none"
                                          />
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              disabled={
                                                isCommentUpdatePending ||
                                                !editCommentText.trim()
                                              }
                                              onClick={() =>
                                                saveCommentEdit(reply.id)
                                              }
                                            >
                                              <Check className="w-3 h-3 mr-1" />
                                              {isCommentUpdatePending
                                                ? "Saving..."
                                                : "Save"}
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
                                        <div className="bg-muted rounded-lg p-2">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-xs">
                                              {reply.author.first_name}{" "}
                                              {reply.author.last_name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                              {new Date(
                                                reply.updated_at
                                              ).toLocaleTimeString()}
                                            </span>
                                          </div>
                                          <p className="text-xs">
                                            {reply.content}
                                          </p>
                                        </div>
                                      )}

                                      {/* Reply actions */}
                                      <div className="flex items-center gap-3 mt-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleCommentLike(
                                              reply.id,
                                              isReplyLiked
                                            )
                                          }
                                          className={`text-[10px] h-auto !p-1 ${
                                            isReplyLiked
                                              ? "text-accent hover:text-white"
                                              : "hover:text-white"
                                          }`}
                                        >
                                          <Heart
                                            className={`w-3 h-3 mr-1 ${
                                              isReplyLiked ? "fill-current" : ""
                                            }`}
                                          />
                                          Like{" "}
                                          <span className="ml-1">
                                            {replyLikesCount}
                                          </span>
                                        </Button>

                                        {canEditReply && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] h-auto !p-1"
                                            onClick={() =>
                                              startEditingComment(
                                                reply.id,
                                                reply.content
                                              )
                                            }
                                          >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Edit
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Gallery Modal */}
      {showAllImages && imageUrls && imageUrls.length > 0 && (
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
              {currentImageIndex + 1} of {imageUrls.length}
            </div>

            {/* Previous Button */}
            {imageUrls.length > 1 && (
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
                src={imageUrls[currentImageIndex] || "/placeholder.svg"}
                alt={`Post image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Next Button */}
            {imageUrls.length > 1 && (
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
            {imageUrls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {imageUrls.map((_, index) => (
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
