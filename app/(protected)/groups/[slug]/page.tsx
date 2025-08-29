import React from "react";
import { GroupDetail } from "./_components";
import { Metadata } from "next";
import { getGroupMinimal } from "@/lib/supabase/service/group-service-server";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;

  const { data } = await getGroupMinimal(slug);

  if (!data) {
    return { title: "Group not found - HopeCircle" };
  }

  return {
    title: `${data.name || "Community"} | HopeCircle`,
    description: data.description,
    openGraph: {
      title: `${data.name || "Community"} | HopeCircle`,
      description: data.description,
      // images: data.image_url ? [{ url: data.image_url }] : [],
    },
  };
}

export default function GroupDetailPage() {
  return <GroupDetail />;
}
