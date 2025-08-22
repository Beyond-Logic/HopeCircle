"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, CheckCircle, XCircle } from "lucide-react";
import { authService } from "@/lib/supabase/service/auth-service";

export function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if user is already authenticated after email verification
        const { user, error: userError } = await authService.getCurrentUser();

        if (userError) {
          setError("Failed to verify email. Please try again.");
          return;
        }

        if (user && user.email_confirmed_at) {
          setIsVerified(true);
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setError(
            "Email verification failed. Please check your email and try again."
          );
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setError("An unexpected error occurred during verification.");
      } finally {
        setIsLoading(false);
      }
    };

    handleEmailVerification();
  }, [router, searchParams]);

  if (isLoading) {
    return (
    
        <div className="flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary-foreground animate-pulse" />
              </div>
              <CardTitle className="text-2xl">Verifying Email...</CardTitle>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </CardHeader>
          </Card>
        </div>
 
    );
  }

  return (

      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              {isVerified ? (
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              ) : (
                <XCircle className="w-6 h-6 text-primary-foreground" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isVerified ? "Email Verified!" : "Verification Failed"}
            </CardTitle>
            <p className="text-muted-foreground">
              {isVerified
                ? "Your email has been successfully verified. You can now sign in to your account."
                : "We couldn't verify your email address. Please try again or contact support."}
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button onClick={() => router.push("/login")} className="w-full">
                {isVerified ? "Continue to Login" : "Go to Login"}
              </Button>

              {!isVerified && (
                <Button
                  variant="outline"
                  onClick={() => router.push("/signup")}
                  className="w-full"
                >
                  Try Signing Up Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  
  );
}
