-- Create post_tags table for user mentions in posts

CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tagged_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique tag per user per post
  UNIQUE(post_id, tagged_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tagged_user_id ON public.post_tags(tagged_user_id);

-- Enable RLS
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Only logged-in users can view post tags
CREATE POLICY "Logged-in users can view post tags" ON public.post_tags
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Post authors can tag users" ON public.post_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND author_id = auth.uid()
    )
  );