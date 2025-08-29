"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/lib/supabase/service/auth-service";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch("password");

  // For password reset, we don't need to verify the code upfront
  // The code verification happens during the actual password update
  useEffect(() => {
    if (!code) {
      setIsTokenValid(false);
    } else {
      setIsTokenValid(true);
    }
    setIsVerifyingToken(false);
  }, [code]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      if (!code) {
        throw new Error("Invalid reset code");
      }

      const supabase = createClient();

      // First, try to update the password directly
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        // If that fails, try the OTP verification approach
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: "recovery",
        });

        if (verifyError) {
          throw new Error(
            "Reset link has expired or is invalid. Please request a new one."
          );
        }

        // If verification succeeds, try updating password again
        const { error: secondUpdateError } = await supabase.auth.updateUser({
          password: data.password,
        });

        if (secondUpdateError) {
          throw secondUpdateError;
        }
      }

      // ✅ LOG THE USER OUT USING YOUR AUTH SERVICE
      const { error: signOutError } = await authService.signOut();

      if (signOutError) {
        console.error("Sign out error:", signOutError);
        // Continue with success flow even if sign out fails
      }

      setIsPasswordReset(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(
        error.message ||
          "Failed to reset password. Please try again or request a new reset link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking code presence
  if (isVerifyingToken) {
    return (
      <div className="p-8 md:p-12">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center space-y-4 px-0">
            <CardTitle className="text-2xl font-bold">
              Verifying Reset Link
            </CardTitle>
            <p className="text-muted-foreground">
              Please wait while we verify your reset link...
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error if no code provided
  if (!code || !isTokenValid) {
    return (
      <div className="p-8 md:p-12">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center space-y-4 px-0">
            <CardTitle className="text-2xl font-bold">
              Invalid Reset Link
            </CardTitle>
            <p className="text-muted-foreground">
              This password reset link is invalid or has expired. Please request
              a new reset link.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state
  if (isPasswordReset) {
    return (
      <div className="p-8 md:p-12">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center space-y-4 px-0">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Password Reset Successful
            </CardTitle>
            <p className="text-muted-foreground">
              Your password has been successfully reset. You will be redirected
              to the login page shortly.
            </p>
          </CardHeader>
          <CardContent className="px-0">
            <Button asChild className="w-full">
              <Link href="/login">Sign In Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <p className="text-muted-foreground">
            Enter your new password below to complete the reset process
          </p>
        </CardHeader>

        <CardContent className="px-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              {/* <Label htmlFor="password">New Password</Label> */}
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
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                    },
                  })}
                  placeholder="New Password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary"
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

            <div>
              {/* <Label htmlFor="confirmPassword">Confirm New Password</Label> */}
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  placeholder="Confirm New Password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary"
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

            <div className="text-sm text-muted-foreground">
              <p className="mb-1">Password requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
