-- Add missing RLS policies for auditors table
CREATE POLICY "Users can view their own auditor profile" 
ON public.auditors 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own auditor profile" 
ON public.auditors 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add missing RLS policies for incidents table
CREATE POLICY "Auditors can view their own incidents" 
ON public.incidents 
FOR SELECT 
USING (auditor_id IN ( SELECT auditors.id
   FROM auditors
  WHERE (auditors.user_id = auth.uid())));

CREATE POLICY "Auditors can create incidents" 
ON public.incidents 
FOR INSERT 
WITH CHECK (auditor_id IN ( SELECT auditors.id
   FROM auditors
  WHERE (auditors.user_id = auth.uid())));

CREATE POLICY "Auditors can update their own incidents" 
ON public.incidents 
FOR UPDATE 
USING (auditor_id IN ( SELECT auditors.id
   FROM auditors
  WHERE (auditors.user_id = auth.uid())));

CREATE POLICY "Auditors can delete their own incidents" 
ON public.incidents 
FOR DELETE 
USING (auditor_id IN ( SELECT auditors.id
   FROM auditors
  WHERE (auditors.user_id = auth.uid())));