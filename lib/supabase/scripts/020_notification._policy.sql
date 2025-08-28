-- Allow system to insert notifications (this is needed for the SECURITY DEFINER function to work)
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);


  -- Change ownership to a user with bypass RLS privileges (run as superuser)
ALTER FUNCTION create_notification_safe OWNER TO postgres;
-- Or to your supabase admin user