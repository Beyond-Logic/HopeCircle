-- Add activity tracking columns to groups table
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS activity_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS activity_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();



-- Create function to update activity scores for all groups
CREATE OR REPLACE FUNCTION update_all_group_activity_scores()
RETURNS VOID AS $$
BEGIN
  UPDATE groups g
  SET 
    activity_score = calculate_group_activity_score(g.id),
    activity_updated_at = NOW()
  WHERE g.status = 'active';
END;
$$ LANGUAGE plpgsql;



-- Create trigger to update activity score when posts are modified
CREATE OR REPLACE FUNCTION update_group_activity_on_post_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update activity score when posts are inserted, updated, or deleted
  PERFORM update_all_group_activity_scores();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post changes
CREATE OR REPLACE TRIGGER trigger_update_activity_on_post_change
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_group_activity_on_post_change();

  


-- Create function to calculate group activity score
CREATE OR REPLACE FUNCTION calculate_group_activity_score(group_id UUID)
RETURNS FLOAT AS $$
DECLARE
  post_count INTEGER;
  recent_post_count INTEGER;
  member_count INTEGER;
  activity_score FLOAT;
BEGIN
  -- Get total posts in the group
  SELECT COUNT(*) INTO post_count 
  FROM posts 
  WHERE posts.group_id = calculate_group_activity_score.group_id 
    AND status = 'approved';
  
  -- Get posts from last 30 days
  SELECT COUNT(*) INTO recent_post_count 
  FROM posts 
  WHERE posts.group_id = calculate_group_activity_score.group_id 
    AND status = 'approved'
    AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Get member count
  SELECT member_count INTO member_count 
  FROM groups 
  WHERE id = calculate_group_activity_score.group_id;
  
  -- Calculate weighted score (adjust weights as needed)
  activity_score = 
    (member_count * 0.3) + 
    (post_count * 0.4) + 
    (recent_post_count * 0.7);
  
  RETURN COALESCE(activity_score, 0);
END;
$$ LANGUAGE plpgsql;


