import React from "react";
import { VerifyEmail } from "./_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | HopeCircle",
};

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
