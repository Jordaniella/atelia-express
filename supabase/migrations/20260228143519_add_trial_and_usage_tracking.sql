/*
  # Add Trial Plan and Usage Tracking

  1. Changes to subscriptions table
    - Update plan check constraint to include 'trial'
    - Add `trial_ends_at` column for trial expiration tracking
    - Add `generation_limit` column for content generation limits
    - Add `image_limit` column for image generation limits
  
  2. New Tables
    - `usage_tracking` - Track user's monthly usage
      - `user_id` (uuid, foreign key to auth.users)
      - `month` (text, format: YYYY-MM)
      - `content_generations` (integer, default 0)
      - `image_generations` (integer, default 0)
      - `projects_created` (integer, default 0)
      - `updated_at` (timestamptz)
  
  3. Security
    - Enable RLS on usage_tracking
    - Add policies for users to read/update their own usage
*/

-- Update subscriptions plan constraint
DO $$
BEGIN
  ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('trial', 'starter', 'pro', 'scale'));
END $$;

-- Add trial tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN trial_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'generation_limit'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN generation_limit integer DEFAULT -1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'image_limit'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN image_limit integer DEFAULT -1;
  END IF;
END $$;

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,
  content_generations integer DEFAULT 0,
  image_generations integer DEFAULT 0,
  projects_created integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);

-- Set default limits for existing subscriptions
UPDATE subscriptions
SET 
  generation_limit = CASE 
    WHEN plan = 'trial' THEN 10
    WHEN plan = 'starter' THEN 50
    WHEN plan = 'pro' THEN 200
    WHEN plan = 'scale' THEN -1
    ELSE -1
  END,
  image_limit = CASE 
    WHEN plan = 'trial' THEN 0
    WHEN plan = 'starter' THEN 10
    WHEN plan = 'pro' THEN 50
    WHEN plan = 'scale' THEN -1
    ELSE -1
  END
WHERE generation_limit = -1;
