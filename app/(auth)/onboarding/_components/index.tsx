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

interface OnboardingFormData {
  firstName: string;
  lastName: string;
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
    formState: { errors },
  } = useForm<OnboardingFormData>();

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
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
    { value: "jamaica", label: "Jamaica" },
    { value: "brazil", label: "Brazil" },
    { value: "other", label: "Other" },
  ];

  // const roles = [
  //   { value: "patient", label: "Person with Sickle Cell" },
  //   { value: "caregiver", label: "Caregiver/Family Member" },
  //   { value: "healthcare", label: "Healthcare Provider" },
  //   { value: "advocate", label: "Advocate/Supporter" },
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground">
            Help us personalize your HopeCircle experience
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Genotype */}
            <div>
              <Label htmlFor="genotype">Genotype</Label>
              <Select onValueChange={(value) => setValue("genotype", value)}>
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

            {/* Country */}
            <div>
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={(value) => setValue("country", value)}>
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
