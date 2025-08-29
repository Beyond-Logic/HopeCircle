import React from "react";
import { Post } from "./_components";
import { Metadata } from "next";
import { getPostByIdMinimal } from "@/lib/supabase/service/group-service-server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;

  const { data } = await getPostByIdMinimal(id);

  if (!data) {
    return { title: "Post not found - HopeCircle" };
  }

  return {
    title: `Post in ${data.group.name || "Post"} | HopeCircle`,
    description: data.content,
    openGraph: {
      title: `Post in ${data.group.name || "Post"} | HopeCircle`,
      description: data.content,
    },
  };
}

export default function PostPage() {
  return <Post />;
}
