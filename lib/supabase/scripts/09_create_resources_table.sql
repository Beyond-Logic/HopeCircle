-- Create resources table for educational content

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  author VARCHAR(255) NOT NULL,
  read_time VARCHAR(50) NOT NULL,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  views_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON public.resources(featured);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_published_at ON public.resources(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON public.resources(created_by);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published resources" ON public.resources
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage resources" ON public.resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND status = 'active'
    )
  );
