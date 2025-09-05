-- Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN show_real_name boolean NOT NULL DEFAULT true,
ADD COLUMN name_change_count integer NOT NULL DEFAULT 0,
ADD COLUMN last_name_change timestamp with time zone NULL,
ADD COLUMN username_change_count integer NOT NULL DEFAULT 0,
ADD COLUMN last_username_change timestamp with time zone NULL;

-- Create username history table for audit trail
CREATE TABLE public.username_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  old_username character varying(50) NOT NULL,
  new_username character varying(50) NOT NULL,
  changed_at timestamp with time zone DEFAULT now(),
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create reserved usernames table
CREATE TABLE public.reserved_usernames (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username character varying(50) NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reserved_until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reserved_usernames_username_key UNIQUE (username)
);

-- Create indexes
CREATE INDEX idx_username_history_user_id ON public.username_history(user_id);
CREATE INDEX idx_username_history_old_username ON public.username_history(old_username);
CREATE INDEX idx_reserved_usernames_username ON public.reserved_usernames(username);
CREATE INDEX idx_reserved_usernames_reserved_until ON public.reserved_usernames(reserved_until);

CREATE INDEX IF NOT EXISTS idx_users_name_change_count ON public.users USING btree (name_change_count);
CREATE INDEX IF NOT EXISTS idx_users_username_change_count ON public.users USING btree (username_change_count);
CREATE INDEX IF NOT EXISTS idx_users_last_name_change ON public.users USING btree (last_name_change);
CREATE INDEX IF NOT EXISTS idx_users_last_username_change ON public.users USING btree (last_username_change);