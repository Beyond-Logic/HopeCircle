import { SiteFooter } from "@/components/layouts/site-footer";

export default async function WebsiteSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto">{children}</div>
      <SiteFooter />
    </div>
  );
}
