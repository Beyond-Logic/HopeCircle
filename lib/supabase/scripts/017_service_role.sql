-- Create a function that can bypass RLS for notifications
CREATE OR REPLACE FUNCTION create_notification_safe(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_related_entity_type VARCHAR(50),
  p_related_entity_id UUID
) RETURNS void AS $$
BEGIN
  -- Use SECURITY DEFINER to run with function owner's privileges
  INSERT INTO public.notifications (
    user_id, type, title, message, related_entity_type, related_entity_id
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_related_entity_type, p_related_entity_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Then modify your trigger function to use this secure function:
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
DECLARE
  -- [Keep all your variable declarations]
BEGIN
  -- [Keep all your logic to determine notification details]
  
  -- Instead of direct INSERT, use the secure function
  IF recipient_id IS NOT NULL AND recipient_id != (SELECT id FROM users WHERE id = (SELECT auth.uid())) THEN
    PERFORM create_notification_safe(
      recipient_id, 
      notification_type, 
      notification_title, 
      notification_message, 
      related_type, 
      related_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;