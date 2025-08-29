import React from "react";
import { Onboarding } from "./_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | HopeCircle",
};

export default function OnboardingPage() {
  return <Onboarding />;
}
