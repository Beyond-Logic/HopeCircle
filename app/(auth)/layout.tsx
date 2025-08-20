import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Suspense } from "react";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        {children}
      </div>
    </Suspense>
  );
}
