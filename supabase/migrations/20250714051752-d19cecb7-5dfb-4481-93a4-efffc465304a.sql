-- Enable realtime for key tables
ALTER TABLE public.audits REPLICA IDENTITY FULL;
ALTER TABLE public.audit_issues REPLICA IDENTITY FULL;
ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.reports REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.audits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;

-- Create function to send notifications for audit assignments
CREATE OR REPLACE FUNCTION public.notify_audit_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the assigned user
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    severity,
    metadata
  ) VALUES (
    NEW.assigned_to,
    'audit_assignment',
    'New Audit Assignment',
    'You have been assigned to audit: ' || (SELECT title FROM audits WHERE id = NEW.audit_id),
    '/audits/' || NEW.audit_id,
    'medium',
    jsonb_build_object(
      'audit_id', NEW.audit_id,
      'assignment_id', NEW.id,
      'assigned_by', NEW.assigned_by,
      'scheduled_date', NEW.scheduled_start
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit assignment notifications
CREATE TRIGGER audit_assignment_notification_trigger
  AFTER INSERT ON public.audit_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_audit_assignment();

-- Create function to notify on critical incidents
CREATE OR REPLACE FUNCTION public.notify_critical_incident()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for critical/high priority incidents
  IF NEW.priority IN ('critical', 'high') THEN
    -- Get all managers and admins to notify
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      severity,
      metadata
    )
    SELECT 
      ur.user_id,
      'critical_incident',
      'Critical Incident Reported',
      'A ' || NEW.priority || ' priority incident has been reported: ' || NEW.title,
      '/incidents/' || NEW.id,
      CASE 
        WHEN NEW.priority = 'critical' THEN 'high'
        ELSE 'medium'
      END,
      jsonb_build_object(
        'incident_id', NEW.id,
        'priority', NEW.priority,
        'severity', NEW.severity,
        'datacenter_id', NEW.datacenter_id
      )
    FROM public.user_roles ur
    WHERE ur.role IN ('manager', 'admin') 
    AND ur.is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for critical incident notifications
CREATE TRIGGER critical_incident_notification_trigger
  AFTER INSERT ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_critical_incident();

-- Create function for daily audit reminders
CREATE OR REPLACE FUNCTION public.send_daily_audit_reminders()
RETURNS void AS $$
BEGIN
  -- Send reminders for audits scheduled for today that haven't started
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    severity,
    metadata
  )
  SELECT 
    aa.assigned_to,
    'audit_reminder',
    'Audit Reminder - Due Today',
    'You have an audit scheduled for today: ' || a.title,
    '/audits/' || a.id,
    'medium',
    jsonb_build_object(
      'audit_id', a.id,
      'assignment_id', aa.id,
      'scheduled_date', aa.scheduled_start,
      'reminder_type', 'daily'
    )
  FROM public.audit_assignments aa
  JOIN public.audits a ON a.id = aa.audit_id
  WHERE DATE(aa.scheduled_start) = CURRENT_DATE
    AND aa.actual_start IS NULL
    AND aa.status = 'assigned'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = aa.assigned_to
        AND n.type = 'audit_reminder'
        AND n.metadata->>'audit_id' = a.id::text
        AND DATE(n.created_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;