import { Suspense } from "react";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense>{children}</Suspense>
    </>
  );
}
