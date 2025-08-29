import React from "react";
import { Profile } from "./_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | HopeCircle",
};

export default function ProfilePage() {
  return <Profile />;
}
