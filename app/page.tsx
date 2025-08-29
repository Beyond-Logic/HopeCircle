import AuthLayout from "./(auth)/layout";
import { Login } from "./(auth)/login/_components";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HopeCircle - Login or Signup",
  description:
    "Join HopeCircle, a supportive community where people connect through shared experiences, offer emotional support, and find hope together.",
  keywords:
    "support community, emotional support, hope, mental health, wellness, connection, social network",
  openGraph: {
    title: "HopeCircle - A Supportive Community",
    description:
      "Join HopeCircle, a supportive community where people connect through shared experiences and find hope together.",
    url: "https://hopecircle.com",
    siteName: "HopeCircle",
    images: [
      {
        url: "https://res.cloudinary.com/beyondlogic/image/upload/v1756500297/HopeCircleLogoMain_ue9h3j.png",
        width: 1200,
        height: 630,
        alt: "HopeCircle - A Supportive Community",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HopeCircle - A Supportive Community",
    description:
      "Join HopeCircle, a supportive community where people connect through shared experiences and find hope together.",
    images: [
      "https://res.cloudinary.com/beyondlogic/image/upload/v1756500297/HopeCircleLogoMain_ue9h3j.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <AuthLayout>
      <Login />
    </AuthLayout>
  );
}
