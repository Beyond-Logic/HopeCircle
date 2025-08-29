"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart } from "lucide-react";
import { authService } from "@/lib/supabase/service/auth-service";
import { useAuth } from "@/context/authContext";
import { CountrySelect } from "@/components/ui/country-select";
import { genotypes } from "@/lib/constants/genotypes";

interface OnboardingFormData {
  username: string;
  first_name: string;
  last_name: string;
  genotype: string;
  country: string;
  role: string;
}

export function Onboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>();

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      if (!user?.id) throw new Error("User not authenticated");

      await authService.upsertUserProfile({
        ...data,
        id: user.id,
        role: "user",
      });

      router.push("/feed");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center space-y-4 px-0">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Complete Your Profile
          </CardTitle>
          <p className="text-muted-foreground">
            Help us personalize your HopeCircle experience
          </p>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                {/* <Label htmlFor="firstName">First Name</Label> */}
                <Input
                  id="firstName"
                  placeholder="First Name"
                  type="text"
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                {/* <Label htmlFor="lastName">Last Name</Label> */}
                <Input
                  id="lastName"
                  placeholder="Last Name"
                  type="text"
                  {...register("last_name", {
                    required: "Last name is required",
                  })}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              {/* <Label htmlFor="username">Username</Label> */}
              <Input
                id="username"
                type="text"
                placeholder="Username"
                {...register("username", {
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
              {errors.username && (
                <p className="text-sm text-destructive mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            {/* Genotype */}
            <div>
              {/* <Label htmlFor="genotype" className="mb-2 ">
                Genotype
              </Label> */}
              <Select onValueChange={(value) => setValue("genotype", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Genotype" />
                </SelectTrigger>
                <SelectContent>
                  {genotypes.map((genotype) => (
                    <SelectItem key={genotype.value} value={genotype.value}>
                      {genotype.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register("genotype", {
                  required: "Please select your genotype",
                })}
              />
              {errors.genotype && (
                <p className="text-sm text-destructive mt-1">
                  {errors.genotype.message}
                </p>
              )}
            </div>
            {/* ✅ Country (with CountrySelect) */}
            <div>
              {/* <Label htmlFor="country">Country</Label> */}
              <CountrySelect
                value={watch("country")}
                onChange={(value) => setValue("country", value)}
                placeholder="Country"
              />
              <input
                type="hidden"
                {...register("country", {
                  required: "Please select your country",
                })}
              />
              {errors.country && (
                <p className="text-sm text-destructive mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Setting Up Profile..." : "Complete Setup"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              You can always update your profile later in settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
