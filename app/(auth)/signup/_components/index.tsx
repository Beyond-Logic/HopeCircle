"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Navigation } from "@/components/navigation";
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
import { Heart, Eye, EyeOff } from "lucide-react";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  genotype: string;
  country: string;
}

export function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement Supabase signup logic
      console.log("Signup data:", data);
      // Redirect to onboarding after successful signup
      // router.push('/onboarding')
    } catch (error) {
      console.error("Signup error:", error);
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
    { value: "other", label: "Other" },
  ];

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Join HopeCircle</CardTitle>
          <p className="text-muted-foreground">
            Create your account to connect with the community
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  placeholder="John"
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
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
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
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
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
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
