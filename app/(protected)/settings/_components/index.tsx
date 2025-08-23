"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, User, Eye, EyeOff, Trash2Icon } from "lucide-react";
import { genotypes } from "@/lib/constants/genotypes";
import { CountrySelect } from "@/components/ui/country-select";
import { authService } from "@/lib/supabase/service/auth-service";
import { toast } from "sonner";
import { useCurrentUserProfile } from "@/hooks/react-query/use-auth-service";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  username: string;
  genotype: string;
  country: string;
  avatar_url: string | null;
  bio: string | null;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    data: currentUserProfileData,
    isLoading: isLoadingCurrentUser,
    refetch,
  } = useCurrentUserProfile();

  const profile = currentUserProfileData?.profile;

  const user = currentUserProfileData?.user;
  const loading = isLoadingCurrentUser || !profile;

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
      genotype: profile?.genotype ?? undefined, // ✅ undefined for empty
      country: profile?.country ?? undefined,
      avatar_url: profile?.avatar_url || null,
    },
  });

  const { reset } = profileForm;

  // Populate form when profile is loaded
  useEffect(() => {
    if (profile?.avatar_url) {
      // Generate signed URL for display
      authService.getAvatarUrl(profile.avatar_url).then(setProfilePreview);
    } else {
      setProfilePreview(null);
    }

    // Reset form values
    reset({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
      genotype: profile?.genotype ?? undefined, // ✅ undefined for empty
      country: profile?.country ?? undefined,
      avatar_url: profile?.avatar_url || null,
    });
  }, [profile, profileForm, reset]);

  const passwordForm = useForm<PasswordFormData>();

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      if (!user?.id) throw new Error("User not authenticated");

      let avatarUrl = data.avatar_url;

      if (selectedFile) {
        const fileKey = await authService.uploadAvatar(selectedFile, user.id);
        const signedUrl = await authService.getAvatarUrl(fileKey);
        setProfilePreview(signedUrl);
        avatarUrl = fileKey;
        setSelectedFile(null); // clear after upload
      }

      // Upsert user profile with the uploaded avatar URL
      await authService.upsertUserProfile({
        ...data,
        id: user.id,
        bio: data.bio ?? undefined,
        genotype: data.genotype,
        country: data.country,
        avatar_url: avatarUrl ?? undefined,
      });

      console.log("Profile update:", { ...data, avatar_url: avatarUrl });
      toast.success("Profile updated successfully!");
      refetch();
      // Reset form dirty state and avatar changed flag
      profileForm.reset({ ...data, avatar_url: avatarUrl });
      setAvatarChanged(false); // ✅ avatar change has been saved
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error((error as Error).message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("User not authenticated");

      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const { data: result, error } = await authService.updatePassword(
        data.newPassword
      );

      console.log("Password update result:", result);

      if (error) {
        throw error;
      }

      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch (error) {
      console.error("Password change error:", error);
      toast.error((error as Error).message || `Unable to change password`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File size cannot exceed 1MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result as string);
      setAvatarChanged(true);
      setSelectedFile(file); // ✅ store selected file
    };
    reader.readAsDataURL(file);

    event.target.value = ""; // keep for re-selecting same file
  };

  const handleRemoveLocalAvatar = () => {
    setProfilePreview(null);
    setAvatarChanged(false);
    profileForm.setValue("avatar_url", null);
  };

  const handleDeleteAvatar = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      if (!profile?.avatar_url) throw new Error("No avatar to delete");

      const { error } = await authService.deleteAvatar(
        profile.avatar_url,
        user.id
      );

      if (error) throw error;

      setProfilePreview(null);
      profileForm.setValue("avatar_url", null);
      refetch();
      toast.success("Avatar deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Failed to delete avatar");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                {/* Profile Picture */}
                <div className="text-center">
                  <Label htmlFor="profilePicture" className="block mb-2">
                    Profile Picture
                  </Label>
                  <div className="flex flex-col items-center space-y-4">
                    {/* Only render Avatar when state is ready */}
                    {profilePreview !== null ? (
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profilePreview} />
                        <AvatarFallback>
                          <User className="w-12 h-12" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {loading ? null : (
                      <div className="flex space-x-2">
                        {/* Upload / Change */}
                        <Label
                          htmlFor="profilePicture"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {profilePreview ? "Change Photo" : "Upload Photo"}
                        </Label>

                        {/* Local preview remove (only if local preview exists and avatar not yet uploaded) */}
                        {profilePreview && !profile?.avatar_url && (
                          <button
                            type="button"
                            title="Remove Photo"
                            onClick={handleRemoveLocalAvatar}
                            disabled={isLoading}
                            className="p-2 border rounded-md hover:bg-red-100"
                          >
                            <Trash2Icon />
                          </button>
                        )}

                        {/* Backend delete (only if avatar exists in Supabase) */}
                        {profile?.avatar_url && (
                          <button
                            type="button"
                            title="Delete from Backend"
                            onClick={handleDeleteAvatar}
                            disabled={isLoading}
                            className="p-2 border rounded-md hover:bg-red-100"
                          >
                            <Trash2Icon />
                          </button>
                        )}
                      </div>
                    )}

                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                    />
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...profileForm.register("first_name", {
                        required: "First name is required",
                      })}
                    />
                    {profileForm.formState.errors.first_name && (
                      <p className="text-sm text-destructive mt-1">
                        {profileForm.formState.errors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...profileForm.register("last_name", {
                        required: "Last name is required",
                      })}
                    />
                    {profileForm.formState.errors.last_name && (
                      <p className="text-sm text-destructive mt-1">
                        {profileForm.formState.errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    // placeholder="Username"
                    {...profileForm.register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message:
                          "Username can only contain letters, numbers, and underscores",
                      },
                    })}
                  />
                  {profileForm.formState.errors.username && (
                    <p className="text-sm text-destructive mt-1">
                      {profileForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...profileForm.register("bio")}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                {/* Genotype */}
                <Controller
                  name="genotype"
                  control={profileForm.control}
                  defaultValue={profile?.genotype ?? undefined} // ✅ important
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your genotype" />
                      </SelectTrigger>
                      <SelectContent>
                        {genotypes.map((genotype) => (
                          <SelectItem
                            key={genotype.value}
                            value={genotype.value}
                          >
                            {genotype.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {/* Country */}
                {/* ✅ Country (with CountrySelect) */}
                <div>
                  <Label htmlFor="country">Country</Label>
                  <CountrySelect
                    value={profileForm.watch("country")}
                    onChange={(value) =>
                      profileForm.setValue("country", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <input
                    type="hidden"
                    {...profileForm.register("country", {
                      required: "Please select your country",
                    })}
                  />
                  {profileForm.formState.errors.country && (
                    <p className="text-sm text-destructive mt-1">
                      {profileForm.formState.errors.country.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    (!profileForm.formState.isDirty && !avatarChanged)
                  }
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                {/* New Password */}
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...passwordForm.register("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...passwordForm.register("confirmPassword", {
                        required: "Please confirm your new password",
                        validate: (value) =>
                          value === passwordForm.watch("newPassword") ||
                          "Passwords do not match",
                      })}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Changing Password..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
