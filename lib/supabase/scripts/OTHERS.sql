CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tagged_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_user_id ON public.post_tags(tagged_user_id);




CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);


ALTER TABLE public.posts
  ADD CONSTRAINT posts_author_fkey
  FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


  ALTER TABLE public.post_tags
ADD CONSTRAINT post_tags_tagged_user_fkey
FOREIGN KEY (tagged_user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;


-- make sure comment_likes.user_id references users.id
ALTER TABLE comment_likes
ADD CONSTRAINT fk_comment_likes_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE public.post_tags
ADD CONSTRAINT post_tags_tagged_user_fkey
FOREIGN KEY (tagged_user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;


-- make sure comment_likes.user_id references users.id
ALTER TABLE comment_likes
ADD CONSTRAINT fk_comment_likes_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;


ALTER TABLE public.comments
ALTER COLUMN author_id SET DEFAULT auth.uid();


-- Add reports_count to posts if missing
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS reports_count INTEGER DEFAULT 0;

-- Add reports_count to comments if missing
ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS reports_count INTEGER DEFAULT 0;


ALTER TABLE public.groups
  ADD CONSTRAINT groups_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES public.users(id)
  ON DELETE SET NULL;


  ALTER TABLE public.group_members
  ADD CONSTRAINT fk_group_members_user
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;



ALTER TABLE public.group_members
  ADD CONSTRAINT fk_group_members_user
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

alter table groups add column status text not null default 'active' check (status in ('active', 'inactive'));




DO
$$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(t) || ' CASCADE;';
    END LOOP;
END;
$$;
