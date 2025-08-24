/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Send, User, X, Users, AtSign, Globe } from "lucide-react";
import { postService } from "@/lib/supabase/service/post-service";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { useUserFollowing } from "@/hooks/react-query/use-get-user-followers";

interface CreatePostFormData {
  content: string;
  images?: FileList;
  groupId?: string;
}

interface CreatePostFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPostCreated: (post: any) => void;
  groupId?: string;
  profilePreview?: string;
  groupName?: string;
}

export function CreatePostForm({
  onPostCreated,
  profilePreview,
  groupId,
}: // groupName,
CreatePostFormProps) {
  const { data: user, refetch } = useCurrentUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groupId || "your-timeline"
  );
  const [taggedUsers, setTaggedUsers] = useState<
    Array<{
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    }>
  >([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagQuery, setTagQuery] = useState("");

  const userGroups = [
    { id: "nigeria-warriors", name: "Nigeria Warriors" },
    { id: "caregivers-support", name: "Caregivers Support" },
    { id: "young-adults", name: "Young Adults with SCD" },
    { id: "healthcare-pros", name: "Healthcare Professionals" },
  ];

  const { data } = useUserFollowing(user?.user.id);

  const followedUsers = data || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostFormData>();

  const contentValue = watch("content", "");

  const handleContentChange = (value: string) => {
    setValue("content", value);

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

  const selectUserForTag = (user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  }) => {
    const atIndex = contentValue.lastIndexOf("@");
    const beforeAt = contentValue.slice(0, atIndex);
    const afterQuery = contentValue.slice(atIndex + tagQuery.length + 1);

    const newContent = `${beforeAt}@${user.first_name} ${user.last_name} ${afterQuery}`;
    setValue("content", newContent);

    if (!taggedUsers.find((u) => u.id === user.id)) {
      setTaggedUsers((prev) => [...prev, user]);
    }

    setShowTagSuggestions(false);
    setTagQuery("");
  };

  const removeTaggedUser = (userId: string) => {
    setTaggedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const onSubmit = async (data: CreatePostFormData) => {
    setIsLoading(true);

    try {
      const currentUserId = user?.user.id || "";

      // 1. First, create a post without images (to get postId)
      const { data: createdPost, error: postError } =
        await postService.createPost({
          content: data.content,
          author_id: currentUserId,
          group_id:
            selectedGroupId !== "your-timeline" ? selectedGroupId : undefined,
        });

      if (postError || !createdPost) {
        console.error("Error creating post:", postError);
        return;
      }

      // 2. Upload images to storage
      const uploadedKeys: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileKey = await postService.uploadPostImage(
          selectedFiles[i],
          createdPost.id,
          i
        );
        uploadedKeys.push(fileKey);
      }

      // 3. Update post with uploaded image keys
      if (uploadedKeys.length > 0) {
        await postService.updatePost(createdPost.id, { images: uploadedKeys });
      }

      // 4. Add post tags if any
      if (taggedUsers.length > 0) {
        const taggedIds = taggedUsers.map((u) => u.id);
        await postService.addPostTags(createdPost.id, taggedIds);
      }

      // 5. Refetch the full post
      const { data: fullPost } = await postService.updatePost(
        createdPost.id,
        {}
      );

      // 6. Notify parent
      onPostCreated(fullPost || createdPost);

      // 7. Reset
      reset();
      setImagePreviews([]);
      setSelectedFiles([]);
      setSelectedGroupId("");
      setTaggedUsers([]);
      setShowTagSuggestions(false);
      setTagQuery("");
      refetch();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 1024 * 1024) {
        alert(`${file.name} exceeds 1MB and was skipped.`);
        return;
      }
      if (selectedFiles.length + newFiles.length >= 6) {
        alert("You can only upload up to 6 images.");
        return;
      }

      newFiles.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 6));
          setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 6));
        }
      };
      reader.readAsDataURL(file);
    });

    // allow re-selecting same file
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="!p-4">
      <CardContent className="!p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* {(groupName || selectedGroupId) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
              <Users className="w-4 h-4" />
              <span>Posting in</span>
              <span className="font-medium text-primary">
                {groupName ||
                  userGroups.find((g) => g.id === selectedGroupId)?.name}
              </span>
            </div>
          )} */}

          <div className="flex gap-6">
            <Avatar className="w-10 h-10 flex-shrink-0 mt-2">
              <AvatarImage
                src={profilePreview || `/placeholder.svg?height=40&width=40`}
                alt="Your avatar"
              />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Textarea
                {...register("content", {
                  required: "Please write something to share",
                  minLength: {
                    value: 10,
                    message: "Post must be at least 10 characters",
                  },
                })}
                value={contentValue}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Share your thoughts, experiences, or encouragement with the community... Use @ to tag people you follow"
                // className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
                className="resize-none border-0 p-0 focus-visible:ring-0 text-[15px]"
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {errors.content.message}
                </p>
              )}

              {showTagSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-background border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {followedUsers
                    .filter(
                      (user) =>
                        user.username
                          .toLowerCase()
                          .includes(tagQuery.toLowerCase()) ||
                        user.first_name
                          .toLowerCase()
                          .includes(tagQuery.toLowerCase()) ||
                        user.last_name
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
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.genotype} • {user.country}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {!groupId && userGroups.length > 1 && (
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

          {taggedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Tagged:</span>
              {taggedUsers.map((user) => (
                <Badge
                  key={user.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <AtSign className="w-3 h-3" />
                  {user.first_name} {user.last_name}
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

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="ghost" size="sm" asChild>
                  <span>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photos ({imagePreviews.length}/6)
                  </span>
                </Button>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                {...register("images")}
                onChange={handleImageChange}
                disabled={imagePreviews.length >= 6}

                // reset input if all images removed
              />
            </div>

            <Button type="submit" disabled={isLoading} size="sm">
              {isLoading ? (
                "Posting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
