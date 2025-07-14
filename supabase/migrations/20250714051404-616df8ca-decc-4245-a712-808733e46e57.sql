-- Create storage buckets for reports
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

-- Create policies for report files
CREATE POLICY "Users can view their own reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "System can create report files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "System can update report files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'reports');

-- Update reports table to support file generation
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Create function to handle report generation requests
CREATE OR REPLACE FUNCTION public.request_report_generation(
  report_name TEXT,
  report_type TEXT,
  parameters JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  report_id UUID;
BEGIN
  INSERT INTO public.reports (
    name,
    type,
    format,
    parameters,
    status,
    generated_by,
    description
  ) VALUES (
    report_name,
    report_type,
    'PDF',
    parameters,
    'queued',
    auth.uid(),
    'Generated report for ' || report_type
  ) RETURNING id INTO report_id;
  
  RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;