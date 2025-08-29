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
  Eye,
  Info,
  MapPin,
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
import ConfirmDeletePostModal from "./ui/confirm-delete-post-modal";
import ConfirmReportModal from "./ui/confirmation-report-post-modal";
import { useSearchParams } from "next/navigation";
import { authService } from "@/lib/supabase/service/auth-service";
import { useUserGroups } from "@/hooks/react-query/use-user-groups";
import {
  useDeleteComment,
  useDeletePost,
  useDeleteReply,
  useUpdatePost,
} from "@/hooks/react-query/use-posts-service";
import { useIsUserInGroup } from "@/hooks/react-query/use-is-user-in-group";
import { PostContent } from "./post-content";
import { useUserFollowing } from "@/hooks/react-query/use-get-user-following";
import { LikeInfo, LikesDisplay } from "./likes-display";

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    genotype: string;
    country: string;
    avatar: string | null;
    username: string;
    avatar_preview: string;
  };
  content: string;
  images?: string[];
  group?: {
    id: string;
    type: "country" | "theme";
    name: string;
  } | null;
  taggedUsers?: Array<{ id: string; name: string }>;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  post_likes: LikeInfo[];
  postTags?: Array<{ tagged_user: { id: string; username: string } }>;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onEdit?: (postId: string, newContent: string) => void;
  onDelete?: (postId: string) => void;
  isSinglePost?: boolean;
  profilePreview?: string;
  groupId?: string;
  isGroup?: boolean;
  isAdmin?: boolean;
}

export function PostCard({
  post,
  onEdit,
  onDelete,
  isSinglePost,
  groupId,
  isGroup,
  isAdmin,
}: // profilePreview,
PostCardProps) {
  const { data: user } = useCurrentUserProfile();

  const searchParams = useSearchParams();

  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    authService
      .getAvatarUrl(user?.profile?.avatar_url as string)
      .then(setProfilePreview);
  }, [user?.profile?.avatar_url]);

  const showCommentsSection = searchParams.get("showComments") === "true";

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
    groupId || post.group?.id || "your-timeline"
  );

  // Add these with your other state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [taggedUsers, setTaggedUsers] = useState<
    Array<{ id: string; username: string }>
  >([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const { mutate: addComment, isPending } = useAddComment();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"post" | "comment" | "reply">();
  const [targetId, setTargetId] = useState("");

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const { data: isMember } = useIsUserInGroup(
    post?.group?.id as string,
    user?.user.id as string
  );

  const { data: commentsData } = useComments(post.id);

  const comments = commentsData?.data || [];

  const currentUserId = user?.user.id || "";

  const isPostLiked = !!post.post_likes?.find(
    (like) => like?.user?.id === currentUserId
  );

  const [commentId, setCommentId] = useState("");
  const [replyId, setReplyId] = useState("");

  const canEdit = post.author.id === currentUserId;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 🔑 Convert storage keys → signed URLs
  const { data } = usePostImages(post.images);
  const imageUrls = data;

  useEffect(() => {
    if (showCommentsSection) {
      setShowComments(true);
    }
  }, [showCommentsSection]);

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
          src={images && images[0]}
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
              src={image}
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
            src={images && images[0]}
            alt="Post image 1"
            className="w-full h-48 object-cover rounded-lg border cursor-pointer"
            onClick={() => openImageCarousel(0)}
          />
          <div className="grid grid-rows-2 gap-2">
            {images?.slice(1, 3).map((image, index) => (
              <img
                key={index + 1}
                src={image}
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
              src={image}
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

  const { mutateAsync: updatePost, isPending: isPostUpdatePending } =
    useUpdatePost();

  const handleEditPost = async () => {
    try {
      const updatedImages = [...existingKeys];

      for (let i = 0; i < newImages.length; i++) {
        const key = await postService.uploadPostImage(newImages[i], post.id, i);
        updatedImages.push(key);
      }

      const updates = {
        content: contentValue.trim(),
        images: updatedImages,
        group_id: selectedGroupId !== "your-timeline" ? selectedGroupId : null,
      };

      const { data, error } = await updatePost({ postId: post.id, updates });
      if (error) throw error;

      onEdit?.(post.id, data);
      setIsEditing(false);
      setNewImages([]);
      setRemovedImages([]);
    } catch (err) {
      console.error(err);
      // error toast already handled in hook
    } finally {
    }
  };

  const cancelEdit = () => {
    setContent(post.content);
    setIsEditing(false);
  };

  const { mutate: deletePost, isPending: isDeletePending } = useDeletePost();
  const { mutate: deleteComment, isPending: deletingComment } =
    useDeleteComment();
  const { mutate: deleteReply, isPending: deletingReply } = useDeleteReply();

  const handleDeletePost = () => {
    deletePost(post.id, {
      onSuccess: () => {
        onDelete?.(post.id); // if you want parent state updates too
        setOpen1(false);
      },
    });
  };

  const handleDeleteComment = () => {
    deleteComment(commentId, {
      onSuccess: () => {
        onDelete?.(commentId);
        setOpen2(false);
      },
    });
  };

  const handleDeleteReply = () => {
    deleteReply(replyId, {
      onSuccess: () => {
        onDelete?.(replyId);
        setOpen3(false);
      },
    });
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

  const { data: UserGroups } = useUserGroups(currentUserId, 10, true);

  const userGroups =
    UserGroups?.pages
      ?.flatMap((page) => page.data) // flatten across all pages
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        imageUrl: item.image_url,
        createdAt: item.created_at,
        createdBy: item.created_by,
      })) || [];

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

  const badgeBg =
    post?.group?.type === "country"
      ? "bg-primary/10 text-primary"
      : "bg-secondary/10 text-secondary";

  return (
    <>
      <Card className="text-[15px] border-0 shadow-none">
        <CardContent className="p-4">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.author.username}`}>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={post.author.avatar_preview}
                    alt={post.author.name}
                  />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  href={`/profile/${post.author.username}`}
                  className="font-semibold hover:underline"
                >
                  {post.author.name}
                  {isGroup && isAdmin ? (
                    <Badge className="bg-amber-400 text-black ml-2">
                      Admin
                    </Badge>
                  ) : (
                    ""
                  )}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="hidden">
                    <span>{post.author.genotype}</span>
                    <span>•</span>
                    <span>{post.author.country}</span>
                    <span>•</span>
                  </div>
                  <span>
                    {post.createdAt &&
                      formatDistanceToNow(post.createdAt, { addSuffix: true })}
                  </span>
                </div>
                {post.group && (
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <Link href={`/groups/${post.group.id}`}>
                      <Badge className={`${badgeBg} px-2 py-1 rounded`}>
                        {post?.group.type === "country" ? (
                          <MapPin className="w-3 h-3" />
                        ) : (
                          <Heart className="w-3 h-3" />
                        )}
                        {post?.group.name}
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
                {isSinglePost ? (
                  <></>
                ) : (
                  <Link
                    href={
                      post.group?.id || isGroup
                        ? `/groups/${post?.group?.id || groupId}/post/${
                            post?.id
                          }`
                        : `/post/${post.id}`
                    }
                  >
                    <DropdownMenuItem className="cursor-pointer">
                      <Eye className="w-4 h-4 mr-2" />
                      View Post
                    </DropdownMenuItem>
                  </Link>
                )}
                {canEdit ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setOpen1(true)}
                      className="cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setOpen(true);
                      setType("post");
                      setTargetId(post.id);
                    }}
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                )}

                {/* <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share Post
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-3">
                {!isGroup && userGroups && userGroups.length >= 1 && (
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
                      disabled={existingKeys.length + newImages.length >= 6}
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
                          src={urlByKey.get(key) as string}
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
                    disabled={isPostUpdatePending}
                  >
                    <Check className="w-4 h-4" />
                    {isPostUpdatePending ? "Saving..." : <>Save</>}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <PostContent content={post.content} />
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
              {post?.group?.id && isMember ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike()}
                  className={`hover:bg-transparent ${
                    isPostLiked
                      ? "text-accent hover:text-accent"
                      : "hover:text-accent"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      isPostLiked ? "fill-current" : ""
                    }`}
                  />
                  {post.likes}
                </Button>
              ) : !post.group?.id ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike()}
                  className={`hover:bg-transparent ${
                    isPostLiked
                      ? "text-accent hover:text-accent"
                      : "hover:text-accent"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      isPostLiked ? "fill-current" : ""
                    }`}
                  />
                  {post.likes}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toast("You need to be a group member to react to this post")
                  }
                  className={`hover:bg-transparent ${
                    isPostLiked
                      ? "text-accent hover:text-accent"
                      : "hover:text-accent"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      isPostLiked ? "fill-current" : ""
                    }`}
                  />
                  {post.likes}
                </Button>
              )}
              {isSinglePost ? (
                <Button
                  className="!bg-transparent hover:text-accent"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {post.comments}
                </Button>
              ) : (
                <Link
                  href={
                    post.group?.id || isGroup
                      ? `/groups/${post?.group?.id || groupId}/post/${
                          post?.id
                        }?showComments=true#showComments`
                      : `/post/${post.id}?showComments=true#showComments`
                  }
                  // href={`/post/${post.id}?showComments=true#showComments`}
                >
                  <Button
                    className="!bg-transparent hover:text-accent"
                    variant="ghost"
                    size="sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.comments}
                  </Button>
                </Link>
              )}

              {/* <Button
                variant="ghost"
                size="sm"
                className="!bg-transparent hover:text-accent"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button> */}
            </div>
          </div>

          <LikesDisplay
            likes={(post.post_likes && post.post_likes) || []}
            postId={post.id}
          />

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t space-y-4" id="showComments">
              {/* Add Comment */}
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0 mt-2">
                  <AvatarImage
                    src={profilePreview as string}
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
                    className="min-h-[60px] resize-none text-[15px]"
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

              <div className="space-y-3">
                {comments?.length > 0 ? (
                  comments.map((comment) => {
                    const isLiked =
                      comment.likes?.some(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (like: any) => like.user.id === currentUserId
                      ) || false;

                    const likes_count = comment.likes?.length || 0;
                    const canEditComment = comment.author.id === currentUserId;

                    return (
                      <div key={comment.id} className="flex gap-3 relative">
                        <Link href={`/profile/${comment.author.username}`}>
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage
                              src={comment.author.avatar_preview}
                              alt="Your avatar"
                            />
                            <AvatarFallback>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex items-start justify-between mb-3 w-full">
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
                                    <Check className="w-3 h-3" />
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
                                className={`text-xs h-auto !p-1 hover:bg-transparent ${
                                  isLiked
                                    ? "text-accent hover:text-accent"
                                    : "hover:text-accent"
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
                                className="text-xs h-auto !p-1 hover:bg-transparent hover:text-accent"
                                onClick={() =>
                                  setReplyingToId(
                                    replyingToId === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                              >
                                Reply
                              </Button>
                            </div>

                            <LikesDisplay
                              likes={(comment.likes && comment.likes) || []}
                              postId={comment.id}
                            />

                            {/* Reply box */}
                            {replyingToId === comment.id && (
                              <div className="mt-2 ml-8">
                                <Textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="min-h-[50px] resize-none text-[15px]"
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    disabled={isReplying || !replyText.trim()}
                                    onClick={() =>
                                      handleReplySubmit(comment.id)
                                    }
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
                                      <div
                                        key={reply.id}
                                        className="flex gap-3"
                                      >
                                        <Link
                                          href={`/profile/${reply.author.username}`}
                                        >
                                          <Avatar className="w-6 h-6 flex-shrink-0">
                                            <AvatarImage
                                              src={reply.author.avatar_preview}
                                              alt="Your avatar"
                                            />
                                            <AvatarFallback>
                                              <User className="w-3 h-3" />
                                            </AvatarFallback>
                                          </Avatar>
                                        </Link>

                                        <div className="flex items-start justify-between mb-3 w-full">
                                          <div className="flex-1">
                                            {/* Edit mode for reply */}
                                            {editingCommentId === reply.id ? (
                                              <div className="space-y-2">
                                                <Textarea
                                                  value={editCommentText}
                                                  onChange={(e) =>
                                                    setEditCommentText(
                                                      e.target.value
                                                    )
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
                                                    <Check className="w-3 h-3" />
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
                                                className={`text-[10px] h-auto !p-1 hover:bg-transparent ${
                                                  isReplyLiked
                                                    ? "text-accent hover:text-accent"
                                                    : "hover:text-accent"
                                                }`}
                                              >
                                                <Heart
                                                  className={`w-3 h-3 mr-1 ${
                                                    isReplyLiked
                                                      ? "fill-current"
                                                      : ""
                                                  }`}
                                                />
                                                Like{" "}
                                                <span className="ml-1">
                                                  {replyLikesCount}
                                                </span>
                                              </Button>
                                            </div>

                                            <LikesDisplay
                                              likes={
                                                (reply.likes &&
                                                  reply.likes) ||
                                                []
                                              }
                                              postId={reply.id}
                                            />
                                          </div>
                                          <div>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger
                                                asChild
                                                className="hover:bg-transparent hover:text-accent"
                                              >
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                >
                                                  <MoreHorizontal className="w-2 h-2" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                {canEditReply ? (
                                                  <>
                                                    <DropdownMenuItem
                                                      onClick={() =>
                                                        startEditingComment(
                                                          reply.id,
                                                          reply.content
                                                        )
                                                      }
                                                      className="cursor-pointer text-xs"
                                                    >
                                                      <Edit className="w-4 h-4 mr-2" />
                                                      Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                      onClick={() => {
                                                        setOpen3(true);
                                                        setReplyId(reply.id);
                                                      }}
                                                      className="cursor-pointer text-xs"
                                                    >
                                                      <Trash2 className="w-4 h-4 mr-2" />
                                                      Delete
                                                    </DropdownMenuItem>
                                                  </>
                                                ) : (
                                                  <DropdownMenuItem
                                                    className="cursor-pointer text-xs"
                                                    onClick={() => {
                                                      setOpen(true);
                                                      setType("reply");
                                                      setTargetId(reply.id);
                                                    }}
                                                  >
                                                    <Info className="w-4 h-4 mr-2" />
                                                    Report
                                                  </DropdownMenuItem>
                                                )}

                                                {/* <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share Post
                </DropdownMenuItem> */}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                }
                              </div>
                            )}
                          </div>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                className="hover:bg-transparent hover:text-accent"
                              >
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-2 h-2" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canEditComment ? (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        startEditingComment(
                                          comment.id,
                                          comment.content
                                        )
                                      }
                                      className="cursor-pointer text-xs"
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setOpen2(true);
                                        setCommentId(comment.id);
                                      }}
                                      className="cursor-pointer text-xs"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <DropdownMenuItem
                                    className="cursor-pointer text-xs"
                                    onClick={() => {
                                      setOpen(true);
                                      setType("comment");
                                      setTargetId(comment.id);
                                    }}
                                  >
                                    <Info className="w-4 h-4 mr-2" />
                                    Report
                                  </DropdownMenuItem>
                                )}

                                {/* <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share Post
                </DropdownMenuItem> */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Card className="p-6 text-center border-dashed border-2">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <MessageCircle className="w-6 h-6 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        No comments yet —{" "}
                        <span className="font-medium text-foreground">
                          be the first to share your thoughts.
                        </span>
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Gallery Modal */}
      {showAllImages && imageUrls && imageUrls.length > 0 && (
        <div className="fixed inset-0 bg-black/90 h-full z-50 flex items-center justify-center">
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
            <div className="bg-black bg-opacity-90 flex items-center justify-center">
              <img
                src={imageUrls[currentImageIndex]}
                alt={`Post image ${currentImageIndex + 1}`}
                className="max-w-[100vw] max-h-[90vh] object-contain rounded-lg"
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
      <ConfirmDeletePostModal
        open={open1}
        onOpenChange={setOpen1}
        type="post"
        onConfirm={handleDeletePost}
        loading={isDeletePending}
      />
      <ConfirmDeletePostModal
        open={open2}
        onOpenChange={setOpen2}
        type="comment"
        onConfirm={handleDeleteComment}
        loading={deletingComment}
      />
      <ConfirmDeletePostModal
        open={open3}
        onOpenChange={setOpen3}
        type="reply"
        onConfirm={handleDeleteReply}
        loading={deletingReply}
      />

      <ConfirmReportModal
        open={open}
        onOpenChange={setOpen}
        type={type as "post" | "comment" | "reply"}
        userId={user?.user.id as string}
        targetId={targetId}
      />
    </>
  );
}
