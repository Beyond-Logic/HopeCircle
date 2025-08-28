/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Eye, EyeOff, Facebook, Github, Twitter } from "lucide-react";
import { authService } from "@/lib/supabase/service/auth-service";

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const { data: authData, error: signUpError } = await authService.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (authData.user) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <p className="text-muted-foreground">
            We've sent you a verification link. Please check your email and
            click the link to verify your account.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-primary hover:bg-primary/90 h-11 rounded-lg"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-8 md:p-12">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center space-y-4 px-0">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Join HopeCircle</CardTitle>
          <p className="text-muted-foreground">
            Create your account to connect with the community
          </p>
        </CardHeader>

        <CardContent className="px-0">
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-lg">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* <div className="grid grid-cols-3 gap-3 mb-6">
            <Button variant="outline" className="h-10 rounded-lg">
              <Github className="h-4 w-4 mr-2" /> Github
            </Button>
            <Button variant="outline" className="h-10 rounded-lg">
              <Twitter className="h-4 w-4 mr-2" /> Twitter
            </Button>
            <Button variant="outline" className="h-10 rounded-lg">
              <Facebook className="h-4 w-4 mr-2" /> Facebook
            </Button>
          </div> */}

          {/* <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div> */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              {/* <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email
              </Label> */}
              <Input
                id="email"
                type="email"
                className="rounded-lg h-11"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              {/* <Label
                htmlFor="password"
                className="text-sm font-medium mb-2 block"
              >
                Password
              </Label> */}
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="rounded-lg h-11 pr-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  placeholder="Password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent"
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
              {/* <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium mb-2 block"
              >
                Confirm Password
              </Label> */}
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="rounded-lg h-11 pr-10"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  placeholder="Confirm Password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent"
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

            <Button
              type="submit"
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
