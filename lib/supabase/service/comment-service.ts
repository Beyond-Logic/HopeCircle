import { createClient } from "../client";

const supabase = createClient();

export const commentService = {
  // Get comments for a post (with author + replies)

  // Get comments for a post (with author, replies, likes + liked users)
  async getCommentsByPost(postId: string) {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
      *,
      author:users!author_id(id, username, first_name, last_name, avatar_url),
      replies:comments!parent_comment_id(
        *,
        author:users!author_id(id, username, first_name, last_name, avatar_url),
        likes:comment_likes(
          user:users(id, username, first_name, last_name, avatar_url)
        )
      ),
      likes:comment_likes(
        user:users(id, username, first_name, last_name, avatar_url)
      )
    `
      )
      .eq("post_id", postId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: true });

    return { data, error };
  },
  // Add new comment (supports replies if parentCommentId provided)
  async addComment(
    postId: string,
    authorId: string,
    content: string,
    parentCommentId?: string
  ) {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: authorId,
        content,
        parent_comment_id: parentCommentId ?? null,
      })
      .select(
        `
        *,
        author:users!author_id(id, username, first_name, last_name, avatar_url)
      `
      )
      .single();

    return { data, error };
  },

  // Update a comment
  async updateComment(commentId: string, content: string) {
    const { data, error } = await supabase
      .from("comments")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .select("*")
      .single();

    return { data, error };
  },

  // Delete a comment
  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    return { error };
  },

  // Delete a reply (just a semantic wrapper around deleteComment)
  async deleteReply(replyId: string) {
    return await this.deleteComment(replyId);
  },

  // Like a comment
  async likeComment(commentId: string, userId: string) {
    // Insert like into join table (if you want separate table for comment_likes)
    const { data, error } = await supabase
      .from("comment_likes")
      .upsert(
        { comment_id: commentId, user_id: userId },
        { onConflict: "comment_id,user_id", ignoreDuplicates: true }
      )
      .select();

    if (error) return { data: null, error };

    // Increment count manually for now
    const { count, error: countError } = await supabase
      .from("comment_likes")
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId);

    if (countError) return { data: null, error: countError };

    return {
      data: { like: data?.[0] || null, totalLikes: count },
      error: null,
    };
  },

  // Unlike a comment
  async unlikeComment(commentId: string, userId: string) {
    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", userId);

    if (error) return { data: null, error };

    const { count, error: countError } = await supabase
      .from("comment_likes")
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId);

    if (countError) return { data: null, error: countError };

    return { data: { totalLikes: count }, error: null };
  },

  // -------------------------
  // Comment Reports
  // -------------------------

  // Report a comment
  async reportComment(
    commentId: string,
    reportedBy: string,
    reason: string,
    description?: string
  ) {
    const { data, error } = await supabase
      .from("comment_reports")
      .insert({
        comment_id: commentId,
        reported_by: reportedBy,
        reason,
        description: description ?? null,
      })
      .select()
      .single();

    return { data, error };
  },

  // Get all reports for admin/moderator
  async getReports(status?: string) {
    let query = supabase
      .from("comment_reports")
      .select(
        `
        *,
        comment:comments(id, content, author_id),
        reporter:users!reported_by(id, username, first_name, last_name, avatar_url)
      `
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get reports submitted by the current user
  async getMyReports(userId: string) {
    const { data, error } = await supabase
      .from("comment_reports")
      .select(
        `
        *,
        comment:comments(id, content, author_id)
      `
      )
      .eq("reported_by", userId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Update report status (admin/moderator only)
  async updateReportStatus(
    reportId: string,
    status: string,
    reviewedBy: string
  ) {
    const { data, error } = await supabase
      .from("comment_reports")
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId)
      .select()
      .single();

    return { data, error };
  },
};
