-- Create audit status and priority enums
CREATE TYPE public.audit_status AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.audit_priority AS ENUM ('low', 'normal', 'high', 'critical');
CREATE TYPE public.audit_type AS ENUM ('routine', 'compliance', 'incident_followup', 'security', 'maintenance');

-- Create audits table - Main audit records
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audit_type audit_type NOT NULL DEFAULT 'routine',
  status audit_status NOT NULL DEFAULT 'draft',
  priority audit_priority NOT NULL DEFAULT 'normal',
  
  -- Location references
  datacenter_id UUID NOT NULL REFERENCES public.datacenters(id),
  data_hall_id UUID REFERENCES public.data_halls(id),
  cabinet_id UUID REFERENCES public.cabinets(id),
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- in minutes
  
  -- Assignment
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Audit details
  checklist_template TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_issues table - Issues found during audits
CREATE TABLE public.audit_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  
  -- Issue details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  category TEXT NOT NULL, -- 'electrical', 'cooling', 'security', 'safety', 'hardware', 'environmental'
  
  -- Location within audit scope
  location_details TEXT, -- specific location description
  cabinet_id UUID REFERENCES public.cabinets(id),
  unit_identifier TEXT, -- rack unit, device ID, etc.
  
  -- Issue status and resolution
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'deferred'
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Follow-up
  requires_incident BOOLEAN DEFAULT false,
  incident_id UUID REFERENCES public.incidents(id),
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  
  -- Attachments and evidence
  attachments TEXT[],
  photo_urls TEXT[],
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_assignments table - Technician assignments and scheduling
CREATE TABLE public.audit_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  
  -- Assignment details
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'primary', -- 'primary', 'secondary', 'observer', 'specialist'
  
  -- Scheduling
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'assigned', -- 'assigned', 'accepted', 'declined', 'in_progress', 'completed'
  notes TEXT,
  
  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all audit tables
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audits
CREATE POLICY "Users can view audits they are involved in"
ON public.audits
FOR SELECT
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Technicians and managers can create audits"
ON public.audits
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'technician') OR
  public.has_role(auth.uid(), 'manager') OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update audits they are involved in"
ON public.audits
FOR UPDATE
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'manager')
);

-- RLS Policies for audit_issues
CREATE POLICY "Users can view issues for audits they are involved in"
ON public.audit_issues
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.audits 
    WHERE id = audit_id AND (
      auth.uid() = created_by OR 
      auth.uid() = assigned_to OR
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'manager')
    )
  )
);

CREATE POLICY "Users can create issues for audits they are assigned to"
ON public.audit_issues
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.audits 
    WHERE id = audit_id AND (
      auth.uid() = assigned_to OR
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'manager')
    )
  )
);

CREATE POLICY "Users can update issues they created or are assigned to"
ON public.audit_issues
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.audits 
    WHERE id = audit_id AND (
      auth.uid() = assigned_to OR
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'manager')
    )
  )
);

-- RLS Policies for audit_assignments
CREATE POLICY "Users can view assignments they are involved in"
ON public.audit_assignments
FOR SELECT
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = assigned_by OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Managers and admins can create assignments"
ON public.audit_assignments
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'manager') OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their own assignments"
ON public.audit_assignments
FOR UPDATE
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = assigned_by OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'manager')
);

-- Add update triggers
CREATE TRIGGER update_audits_updated_at
  BEFORE UPDATE ON public.audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_issues_updated_at
  BEFORE UPDATE ON public.audit_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_assignments_updated_at
  BEFORE UPDATE ON public.audit_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_audits_datacenter_id ON public.audits(datacenter_id);
CREATE INDEX idx_audits_data_hall_id ON public.audits(data_hall_id);
CREATE INDEX idx_audits_cabinet_id ON public.audits(cabinet_id);
CREATE INDEX idx_audits_assigned_to ON public.audits(assigned_to);
CREATE INDEX idx_audits_status ON public.audits(status);
CREATE INDEX idx_audits_scheduled_date ON public.audits(scheduled_date);

CREATE INDEX idx_audit_issues_audit_id ON public.audit_issues(audit_id);
CREATE INDEX idx_audit_issues_cabinet_id ON public.audit_issues(cabinet_id);
CREATE INDEX idx_audit_issues_severity ON public.audit_issues(severity);
CREATE INDEX idx_audit_issues_status ON public.audit_issues(status);

CREATE INDEX idx_audit_assignments_audit_id ON public.audit_assignments(audit_id);
CREATE INDEX idx_audit_assignments_assigned_to ON public.audit_assignments(assigned_to);
CREATE INDEX idx_audit_assignments_scheduled_start ON public.audit_assignments(scheduled_start);