/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, ArrowLeft, CheckCircle } from "lucide-react";
import { authService } from "@/lib/supabase/service/auth-service";

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");
    try {
      const { error } = await authService.resetPassword(data.email);

      if (error) {
        throw error;
      }

      setIsEmailSent(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(
        error.message || "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="p-8 md:p-12">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center space-y-4 px-0">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <p className="text-muted-foreground">
              We've sent a password reset link to your email address. Please
              check your inbox and follow the instructions.
            </p>
          </CardHeader>

          <CardContent className="px-0">
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="text-primary hover:underline"
                  type="button"
                >
                  try again
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center space-y-4 px-0">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a reset link
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
                placeholder="Email address"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
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
