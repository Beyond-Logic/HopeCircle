/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
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
import { useUpdateGroupMutation } from "@/hooks/react-query/use-update-group"; // 👈 use the new hook
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";
import { useDeleteGroupImage } from "@/hooks/react-query/use-delete-group-image";

interface UpdateGroupFormData {
  name: string;
  description: string;
  type: "country" | "theme" | undefined;
}

export function GroupSettings() {
  const { data } = useCurrentUserProfile();
  const params = useParams();
  const router = useRouter();
  const groupId = params.slug as string;

  const { data: group, isLoading } = useGetGroupById(groupId);
  const { mutate: updateGroup, isPending } = useUpdateGroupMutation(); // 👈 use new mutation

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEditable = group?.creator?.id === data?.user.id;

  type UpdateGroupFormInputs = UpdateGroupFormData;

  // 2) Add an "initial" snapshot of the group
  const [initial, setInitial] = useState<{
    name: string;
    description: string;
    type: "country" | "theme" | undefined;
    image_url: string | null;
  } | null>(null);

  // 3) useForm without imageChanged and without relying on isDirty
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
    trigger,
    watch,
  } = useForm<UpdateGroupFormInputs>({
    defaultValues: { name: "", description: "", type: undefined },
  });

  const { mutate: deleteGroupImage, isPending: isDeleting } =
    useDeleteGroupImage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!group) return;

    const snap = {
      name: group.name ?? "",
      description: group.description ?? "",
      type: (group.type as "country" | "theme" | undefined) ?? undefined,
      image_url: group.image_url ?? null,
    };
    setInitial(snap);

    reset(
      { name: snap.name, description: snap.description, type: snap.type },
      { keepDirty: false }
    );

    setPreview(snap.image_url || null);
    setSelectedFile(null);
  }, [group, reset]);

  // 5) Compute hasChanges instead of using isDirty
  const values = watch();
  const imageChanged =
    !!selectedFile || (!!initial?.image_url && preview === null);

  const hasChanges =
    !!initial &&
    ((values.name ?? "") !== initial.name ||
      (values.description ?? "") !== initial.description ||
      (values.type ?? undefined) !== initial.type ||
      imageChanged);

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
  };

  const handleRemoveImage = () => {
    if (selectedFile) {
      // just undo local selection
      setSelectedFile(null);
      setPreview(initial?.image_url ?? null); // back to original state
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // deleting an existing backend image
    if (group?.image_url) {
      deleteGroupImage(
        {
          groupId,
          fileName: group.image_url.replace(/^.*\/group-images\//, ""),
        },
        {
          onSuccess: () => {
            toast.success("Image deleted successfully!");
            setPreview(null);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            // after react-query refetch, useEffect above will reset initial snapshot
          },
          onError: (err) => toast.error((err as Error).message),
        }
      );
    }
  };

  const onSubmit = async (formData: UpdateGroupFormData) => {
    const valid = await trigger(["name", "description", "type"]);
    if (!valid) return;

    updateGroup(
      {
        groupId,
        updates: {
          ...formData,
          type: formData.type || undefined,
          imageFile: selectedFile || undefined, // 👈 just pass file
        },
      },
      {
        onSuccess: () => toast.success("Group updated!"),
        onError: (err) => toast.error((err as Error).message),
      }
    );
  };

  const handleUnpublish = () => {
    updateGroup(
      { groupId, updates: { status: "inactive" } },
      { onSuccess: () => toast.success("Group unpublished.") }
    );
  };

  const handleRepublish = () => {
    updateGroup(
      { groupId, updates: { status: "active" } },
      { onSuccess: () => toast.success("Group republished!") }
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
                      disabled={isDeleting}
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
                      ref={fileInputRef}
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
              disabled={isPending || !hasChanges}
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
