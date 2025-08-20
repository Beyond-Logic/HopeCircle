"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, User, Eye, EyeOff } from "lucide-react";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  genotype: string;
  country: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      bio: "Living with sickle cell and sharing my journey. Advocate for better healthcare access in Nigeria.",
      genotype: "SS",
      country: "nigeria",
    },
  });

  const passwordForm = useForm<PasswordFormData>();

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("hopecircle_user") || "{}"
      );
      const updatedUser = {
        ...currentUser,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        genotype: data.genotype,
        country: data.country,
        avatar: profilePreview || currentUser.avatar,
      };
      localStorage.setItem("hopecircle_user", JSON.stringify(updatedUser));

      console.log("Profile update:", data);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      if (data.currentPassword !== "password123") {
        throw new Error("Current password is incorrect");
      }

      // TODO: Implement actual password change logic
      console.log("Password change:", data);
      setSuccessMessage("Password changed successfully!");
      passwordForm.reset();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Password change error:", error);
      setSuccessMessage("Error: Current password is incorrect");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const genotypes = [
    { value: "SS", label: "SS - Sickle Cell Anemia" },
    { value: "SC", label: "SC - Sickle Cell Disease" },
    { value: "AS", label: "AS - Sickle Cell Trait" },
    { value: "AA", label: "AA - Normal" },
    { value: "other", label: "Other" },
  ];

  const countries = [
    { value: "nigeria", label: "Nigeria" },
    { value: "usa", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ghana", label: "Ghana" },
    { value: "kenya", label: "Kenya" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

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
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={
                          profilePreview ||
                          "/placeholder.svg?height=96&width=96"
                        }
                      />
                      <AvatarFallback>
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor="profilePicture"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Photo
                    </Label>
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
                      {...profileForm.register("firstName", {
                        required: "First name is required",
                      })}
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {profileForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...profileForm.register("lastName", {
                        required: "Last name is required",
                      })}
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {profileForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
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
                <div>
                  <Label htmlFor="genotype">Genotype</Label>
                  <Select
                    onValueChange={(value) =>
                      profileForm.setValue("genotype", value)
                    }
                    defaultValue={profileForm.getValues("genotype")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your genotype" />
                    </SelectTrigger>
                    <SelectContent>
                      {genotypes.map((genotype) => (
                        <SelectItem key={genotype.value} value={genotype.value}>
                          {genotype.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    onValueChange={(value) =>
                      profileForm.setValue("country", value)
                    }
                    defaultValue={profileForm.getValues("country")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isLoading}>
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
                {/* Current Password */}
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      {...passwordForm.register("currentPassword", {
                        required: "Current password is required",
                      })}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

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
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
