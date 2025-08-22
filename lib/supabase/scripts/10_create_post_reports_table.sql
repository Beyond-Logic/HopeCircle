-- Create post_reports table for content moderation

CREATE TABLE IF NOT EXISTS public.post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL CHECK (reason IN (
    'spam', 'harassment', 'inappropriate_content', 'misinformation', 'other'
  )),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique report per user per post
  UNIQUE(post_id, reported_by)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reported_by ON public.post_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON public.post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_reviewed_by ON public.post_reports(reviewed_by);

-- Enable RLS
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can report posts" ON public.post_reports
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports" ON public.post_reports
  FOR SELECT USING (auth.uid() = reported_by);

CREATE POLICY "Admins can view all reports" ON public.post_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND status = 'active'
    )
  );

-- Function to update post report count
CREATE OR REPLACE FUNCTION update_post_report_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET reports_count = reports_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET reports_count = reports_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_post_report_count_insert
  AFTER INSERT ON public.post_reports
  FOR EACH ROW EXECUTE FUNCTION update_post_report_count();

CREATE TRIGGER trigger_update_post_report_count_delete
  AFTER DELETE ON public.post_reports
  FOR EACH ROW EXECUTE FUNCTION update_post_report_count();
