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

interface CreatePostFormData {
  content: string;
  images?: FileList;
  groupId?: string;
}

interface CreatePostFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPostCreated: (post: any) => void;
  groupId?: string;
  groupName?: string;
}

export function CreatePostForm({
  onPostCreated,
  groupId,
  groupName,
}: CreatePostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groupId || "your-timeline"
  );
  const [taggedUsers, setTaggedUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagQuery, setTagQuery] = useState("");

  const userGroups = [
    { id: "nigeria-warriors", name: "Nigeria Warriors" },
    { id: "caregivers-support", name: "Caregivers Support" },
    { id: "young-adults", name: "Young Adults with SCD" },
    { id: "healthcare-pros", name: "Healthcare Professionals" },
  ];

  const followedUsers = [
    { id: "user1", name: "Maria Santos", genotype: "SC", country: "Brazil" },
    { id: "user2", name: "Ahmed Hassan", genotype: "SS", country: "Egypt" },
    {
      id: "user3",
      name: "Dr. Sarah Johnson",
      genotype: "Caregiver",
      country: "USA",
    },
    { id: "user4", name: "Kwame Asante", genotype: "SS", country: "Ghana" },
    { id: "user5", name: "Fatima Al-Zahra", genotype: "SC", country: "UAE" },
  ];

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

  const selectUserForTag = (user: { id: string; name: string }) => {
    const atIndex = contentValue.lastIndexOf("@");
    const beforeAt = contentValue.slice(0, atIndex);
    const afterQuery = contentValue.slice(atIndex + tagQuery.length + 1);

    const newContent = `${beforeAt}@${user.name} ${afterQuery}`;
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
      const selectedGroup = userGroups.find((g) => g.id === selectedGroupId);

      const newPost = {
        id: Date.now().toString(),
        author: {
          id: "current-user",
          name: "John Doe",
          genotype: "SS",
          country: "Nigeria",
          avatar: null,
        },
        content: data.content,
        images: imagePreviews,
        group: selectedGroup
          ? { id: selectedGroup.id, name: selectedGroup.name }
          : null,
        taggedUsers: taggedUsers,
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        isLiked: false,
      };

      onPostCreated(newPost);
      reset();
      setImagePreviews([]);
      setSelectedGroupId("");
      setTaggedUsers([]);
      setShowTagSuggestions(false);
      setTagQuery("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 6));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage
                src="/placeholder.svg?height=40&width=40"
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
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {errors.content.message}
                </p>
              )}

              {showTagSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-background border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {followedUsers
                    .filter((user) =>
                      user.name.toLowerCase().includes(tagQuery.toLowerCase())
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
                          <div className="font-medium">{user.name}</div>
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
                  {user.name}
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
