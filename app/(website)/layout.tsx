import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/context/authContext";


export default async function WebsiteSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        <Navigation />
      </AuthProvider>

      {children}
      <Footer />
    </div>
  );
}
