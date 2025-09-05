-- Create name history table
CREATE TABLE public.name_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  old_first_name character varying(100) NOT NULL,
  new_first_name character varying(100) NOT NULL,
  old_last_name character varying(100) NOT NULL,
  new_last_name character varying(100) NOT NULL,
  changed_at timestamp with time zone DEFAULT now(),
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_name_history_user_id ON public.name_history(user_id);
CREATE INDEX idx_name_history_changed_at ON public.name_history(changed_at);


-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_name_history_user_id ON public.name_history(user_id);
CREATE INDEX IF NOT EXISTS idx_name_history_changed_at ON public.name_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_username_history_changed_at ON public.username_history(changed_at);