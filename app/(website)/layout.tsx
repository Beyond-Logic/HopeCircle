import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";


export default async function WebsiteSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}
