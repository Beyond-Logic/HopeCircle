/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Heart,
  Trash2Icon,
  ImageIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useGetGroupById } from "@/hooks/react-query/use-group-by-id";
import { useUpdateGroup } from "@/hooks/react-query/use-update-group";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";

interface UpdateGroupFormData {
  name: string;
  description: string;
  type: "country" | "theme" | undefined;
  image_url?: string;
}

export function GroupSettings() {
  const { data } = useCurrentUserProfile();
  const params = useParams();
  const router = useRouter();
  const groupId = params.slug as string;

  const { data: group, isLoading } = useGetGroupById(groupId);
  const { mutate: updateGroup, isPending } = useUpdateGroup();

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEditable = group?.creator?.id === data?.user.id;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty },
    trigger,
  } = useForm<UpdateGroupFormData>({
    defaultValues: {
      name: "",
      description: "",
      type: undefined,
    },
  });

  // when resetting
  useEffect(() => {
    if (group) {
      reset(
        {
          name: group.name,
          description: group.description,
          type: (group.type as "country" | "theme") ?? undefined,
        },
        { keepDirty: false } // reset clears dirty state
      );
      setPreview(group?.image_url || null);
    }
  }, [group, reset, setValue]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("File size cannot exceed 1MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // ✅ mark form dirty
    setValue("image_url", "changed", { shouldDirty: true });
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setSelectedFile(null);

    // ✅ mark form dirty
    setValue("image_url", undefined, { shouldDirty: true });
  };

  const onSubmit = async (data: UpdateGroupFormData) => {
    // ✅ validate required fields before submit
    const valid = await trigger(["name", "description", "type"]);
    if (!valid) return;

    updateGroup(
      {
        groupId,
        updates: {
          ...data,
          type: data.type || undefined,
          image_url: selectedFile || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Group updated!");
        },
        onError: (err) => toast.error((err as Error).message),
      }
    );
  };

  const handleUnpublish = () => {
    updateGroup(
      { groupId, updates: { status: "inactive" } },
      {
        onSuccess: () => toast.success("Group unpublished."),
      }
    );
  };

  const handleRepublish = () => {
    updateGroup(
      { groupId, updates: { status: "active" } },
      {
        onSuccess: () => toast.success("Group republished!"),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ✅ Go back */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/groups/${groupId}`)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Group
        </Button>
      </div>

      <h1 className="text-xl font-bold">Group Settings</h1>

      <Card className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label>Group Name</Label>
            <Input
              {...register("name", {
                required: "Group name is required",
                minLength: { value: 3, message: "At least 3 characters" },
              })}
              disabled={!isEditable}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 20, message: "At least 20 characters" },
              })}
              disabled={!isEditable}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Group Type</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "Please select a group type" }}
              defaultValue={group?.type ?? undefined}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    const typedValue = value as "country" | "theme";
                    field.onChange(typedValue);
                    setValue("type", typedValue, { shouldDirty: true });
                  }}
                  value={field.value ?? undefined}
                  disabled={!isEditable}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="country">
                      <MapPin className="w-4 h-4 mr-2" /> Country
                    </SelectItem>
                    <SelectItem value="theme">
                      <Heart className="w-4 h-4 mr-2" /> Theme
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Group Banner</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-[200px] object-cover rounded"
                  />
                  {isEditable && (
                    <button
                      title="Remove Image"
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                    >
                      <Trash2Icon className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
              ) : (
                isEditable && (
                  <label className="cursor-pointer">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-2 text-muted-foreground text-[15px]">
                      <ImageIcon className="w-12 h-12" />
                      <p>Click to upload a banner image</p>
                    </div>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Save */}
          {isEditable && (
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              className="w-full"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </form>
      </Card>

      {/* Publish Controls */}
      <Card className="p-4">
        {group?.status === "active" ? (
          <>
            <h2 className="text-lg font-semibold">Unpublish Group</h2>
            <p className="text-muted-foreground">
              This will make the group inaccessible.
            </p>
            {isEditable && (
              <Button
                onClick={handleUnpublish}
                variant="destructive"
                disabled={isPending}
              >
                Unpublish Group
              </Button>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Republish Group</h2>
            <p className="text-muted-foreground">
              This will make the group accessible again.
            </p>
            {isEditable && (
              <Button
                onClick={handleRepublish}
                variant="default"
                disabled={isPending}
              >
                Republish Group
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
