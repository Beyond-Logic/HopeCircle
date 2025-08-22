import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/context/authContext";
import { Suspense } from "react";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Suspense>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-background to-muted">
          {children}
        </div>
      </Suspense>
    </AuthProvider>
  );
}
