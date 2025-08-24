-- Create comment_reports table for content moderation

CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL CHECK (reason IN (
    'spam', 'harassment', 'inappropriate_content', 'misinformation', 'other'
  )),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique report per user per comment
  UNIQUE(comment_id, reported_by)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON public.comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_reported_by ON public.comment_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON public.comment_reports(status);
CREATE INDEX IF NOT EXISTS idx_comment_reports_reviewed_by ON public.comment_reports(reviewed_by);

-- Enable RLS
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can report comments" ON public.comment_reports
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own comment reports" ON public.comment_reports
  FOR SELECT USING (auth.uid() = reported_by);

CREATE POLICY "Admins can view all comment reports" ON public.comment_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND status = 'active'
    )
  );

-- Function to update comment report count
CREATE OR REPLACE FUNCTION update_comment_report_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments 
    SET reports_count = COALESCE(reports_count, 0) + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments 
    SET reports_count = GREATEST(COALESCE(reports_count, 1) - 1, 0) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_comment_report_count_insert
  AFTER INSERT ON public.comment_reports
  FOR EACH ROW EXECUTE FUNCTION update_comment_report_count();

CREATE TRIGGER trigger_update_comment_report_count_delete
  AFTER DELETE ON public.comment_reports
  FOR EACH ROW EXECUTE FUNCTION update_comment_report_count();
