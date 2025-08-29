import React from "react";
import { Post } from "./_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post | HopeCircle",
};

export default function PostPage() {
  return <Post />;
}
