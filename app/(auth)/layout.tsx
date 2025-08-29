import { SiteFooter } from "@/components/layouts/site-footer";
import { AuthProvider } from "@/context/authContext";
import { Heart } from "lucide-react";
import { Suspense } from "react";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Suspense>
        <div className="bg-gradient-to-br from-primary/5 via-background to-muted">
          <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
            <div className="grid md:grid-cols-2 w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl bg-card">
              {/* Left side - Brand showcase */}
              <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="max-w-xs text-center space-y-6">
                  <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10" />
                  </div>
                  <h1 className="text-4xl font-bold">HopeCircle</h1>
                  <p className="text-primary-foreground/80">
                    Join our community of hope and support. Share your journey,
                    connect with others, and find inspiration.
                  </p>
                </div>
              </div>
              {/* Right side - Form */}
              {children}
            </div>
          </div>
          <SiteFooter />
        </div>
      </Suspense>
    </AuthProvider>
  );
}
