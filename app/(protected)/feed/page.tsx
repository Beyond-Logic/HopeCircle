import React from "react";
import { Feed } from "./_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed | HopeCircle",
};

export default function FeedPage() {
  return <Feed />;
}
