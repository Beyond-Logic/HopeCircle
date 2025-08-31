"use client";

import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { useGetPostById } from "@/hooks/react-query/use-posts-service";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export function Post() {
  const params = useParams();
  const postId = params.id as string;

  const {
    data: postsData,
    isLoading,
    isError,
    refetch,
  } = useGetPostById(postId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, setPost] = useState<any>();

  // Merge paginated posts
  useEffect(() => {
    if (postsData) {
      const formatted = {
        id: postsData?.id,
        author: {
          id: postsData.author.id,
          name: `${postsData.author.first_name} ${postsData.author.last_name}`,
          genotype: postsData.author.genotype,
          country: postsData.author.country,
          avatar: postsData.author.avatar_url || null,
          username: postsData.author.username,
          avatar_preview: postsData.author.avatar_preview,
        },
        content: postsData.content,
        images: postsData.images || [],
        group: postsData.group
          ? { id: postsData.group.id, name: postsData.group.name }
          : null,
        createdAt: postsData.created_at,
        updatedAt: postsData.updated_at,
        likes: postsData.post_likes.length || 0,
        post_likes: postsData.post_likes || [],
        comments: postsData.comments?.[0]?.count || 0,
        postTags: postsData.post_tags || [],
      };
      setPost(formatted);
    }
  }, [postsData]);

  // ---------------------------
  // Loading & error states
  // ---------------------------
  if (isLoading)
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (isError || !postsData)
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link href="/groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="mb-2">
        <Link href={`/groups/${post?.group?.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {post?.group?.name}
          </Button>
        </Link>
      </div>
      {post && (
        <PostCard
          key={post?.id}
          post={post}
          onEdit={refetch as never}
          onDelete={refetch as never}
          isSinglePost
          isGroup={true}
        />
      )}
    </div>
  );
}
