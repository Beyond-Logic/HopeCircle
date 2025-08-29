import React from "react";
import { Groups } from "./_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Communities | HopeCircle",
};

export default function GroupsPage() {
  return <Groups />;
}
