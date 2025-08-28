-- Grant execute permission to authenticated users (or whatever role your triggers run as)
GRANT EXECUTE ON FUNCTION create_notification_safe TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification_safe TO anon;
-- Or if you have a specific role for triggers:
-- GRANT EXECUTE ON FUNCTION create_notification_safe TO your_trigger_role;