"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, Send, User } from "lucide-react";

interface CreatePostFormData {
  content: string;
  image?: FileList;
}

interface CreatePostFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPostCreated: (post: any) => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormData>();

  const onSubmit = async (data: CreatePostFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement post creation logic
      const newPost = {
        id: Date.now().toString(),
        author: {
          id: "current-user",
          name: "John Doe", // Replace with actual user data
          genotype: "SS",
          country: "Nigeria",
          avatar: null,
        },
        content: data.content,
        image: imagePreview,
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        isLiked: false,
      };

      onPostCreated(newPost);
      reset();
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex-1">
              <Textarea
                {...register("content", {
                  required: "Please write something to share",
                  minLength: {
                    value: 10,
                    message: "Post must be at least 10 characters",
                  },
                })}
                placeholder="Share your thoughts, experiences, or encouragement with the community..."
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full h-auto rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setImagePreview(null)}
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" variant="ghost" size="sm" asChild>
                  <span>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Photo
                  </span>
                </Button>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                {...register("image")}
                onChange={handleImageChange}
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
