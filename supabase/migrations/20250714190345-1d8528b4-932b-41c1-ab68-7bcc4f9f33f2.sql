-- Create auditors table for user profiles
CREATE TABLE public.auditors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create audits table
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  auditor_id UUID NOT NULL REFERENCES public.auditors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create incidents table
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  audit_id UUID REFERENCES public.audits(id) ON DELETE SET NULL,
  auditor_id UUID NOT NULL REFERENCES public.auditors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.auditors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- RLS policies for auditors
CREATE POLICY "Users can view their own auditor profile" ON public.auditors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own auditor profile" ON public.auditors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auditor profile" ON public.auditors
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for audits
CREATE POLICY "Auditors can view their own audits" ON public.audits
  FOR SELECT USING (
    auditor_id IN (SELECT id FROM public.auditors WHERE user_id = auth.uid())
  );

CREATE POLICY "Auditors can create audits" ON public.audits
  FOR INSERT WITH CHECK (
    auditor_id IN (SELECT id FROM public.auditors WHERE user_id = auth.uid())
  );

CREATE POLICY "Auditors can update their own audits" ON public.audits
  FOR UPDATE USING (
    auditor_id IN (SELECT id FROM public.auditors WHERE user_id = auth.uid())
  );

-- RLS policies for incidents
CREATE POLICY "Auditors can view their own incidents" ON public.incidents
  FOR SELECT USING (
    auditor_id IN (SELECT id FROM public.auditors WHERE user_id = auth.uid())
  );

CREATE POLICY "Auditors can create incidents" ON public.incidents
  FOR INSERT WITH CHECK (
    auditor_id IN (SELECT id FROM public.auditors WHERE user_id = auth.uid())
  );

CREATE POLICY "Auditors can update their own incidents" ON public.incidents
  FOR UPDATE USING (
    auditor_id IN (SELECT id FROM public.auditors WHERE user_id = auth.uid())
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_auditors_updated_at
  BEFORE UPDATE ON public.auditors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audits_updated_at
  BEFORE UPDATE ON public.audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create auditor profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.auditors (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'Unknown'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create auditor profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();