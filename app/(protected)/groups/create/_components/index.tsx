/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Heart, Upload, Trash2Icon, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useCreateGroupMutation } from "@/hooks/react-query/use-create-group";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";

interface CreateGroupFormData {
  name: string;
  description: string;
  type: "country" | "theme";
  image?: string;
}

export function CreateGroup() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: user } = useCurrentUserProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateGroupFormData>();

  const groupType = watch("type");

  const { mutate: createGroup, isPending } = useCreateGroupMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File size cannot exceed 1MB");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    e.target.value = ""; // reset input for reselect
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setSelectedFile(null);
    setValue("image", undefined);
  };

  const onSubmit = (data: CreateGroupFormData) => {
    createGroup(
      {
        ...data,
        imageFile: selectedFile || undefined,
        created_by: user?.user.id as string,
      },
      {
        onSuccess: () => {
          toast.success("Group created successfully!");
        },
        onError: (err) => {
          toast.error((err as Error).message || "Failed to create group");
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Create New Group</h1>
        <p className="text-muted-foreground max-w-[500px] w-full">
          Start a new community group to connect with others who share similar
          experiences or locations.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="e.g., Ghana Warriors, Pain Management Tips"
              {...register("name", {
                required: "Group name is required",
                minLength: { value: 3, message: "At least 3 characters" },
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this group is about..."
              rows={3}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 20, message: "At least 20 characters" },
              })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Group Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Group Type</Label>
            <Select
              onValueChange={(value) =>
                setValue("type", value as "country" | "theme")
              }
              value="theme"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select group type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="country">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Country-based
                  </div>
                </SelectItem>
                <SelectItem value="theme">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Theme-based
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">
                Please select a group type
              </p>
            )}
          </div>

          {/* Group Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Group Image (Optional)</Label>
            <div className="flex flex-col items-center gap-3 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {preview ? (
                <div className="">
                  <div className="aspect-[12/1] relative">
                    <img
                      src={preview}
                      alt="Preview"
                      // className="w-32 h-32 object-cover rounded-lg"
                      className="w-full h-[200px] object-cover rounded-t-lg"
                    />
                  </div>

                  <button
                    title="delete"
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-white p-1 rounded-full shadow"
                  >
                    <Trash2Icon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              )}

              <Label
                htmlFor="groupImage"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />{" "}
                {preview ? "Change Image" : "Upload Image"}
              </Label>
              <Input
                id="groupImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
