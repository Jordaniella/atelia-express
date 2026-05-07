/*
  Add Launch Strategy and Readiness Tracking
  
  Overview:
  Transforms AtelIA from AI toolkit to Launch Intelligence OS by adding strategic
  launch planning fields and readiness tracking capabilities.
  
  New Columns in projects table:
  - positioning_statement (text) - Core market positioning
  - core_promise (text) - Main value proposition
  - unique_mechanism (text) - What makes it unique
  - key_offer (text) - Primary offer/CTA
  
  New Table: user_trials
  - Tracks trial period for users
  - Trial start date and end date
  - Used to display days remaining
  
  Security:
  - RLS enabled on user_trials
  - Users can only view their own trial info
*/

-- Add launch strategy fields to projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'positioning_statement'
  ) THEN
    ALTER TABLE projects ADD COLUMN positioning_statement text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'core_promise'
  ) THEN
    ALTER TABLE projects ADD COLUMN core_promise text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'unique_mechanism'
  ) THEN
    ALTER TABLE projects ADD COLUMN unique_mechanism text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'key_offer'
  ) THEN
    ALTER TABLE projects ADD COLUMN key_offer text;
  END IF;
END $$;

-- Create user_trials table
CREATE TABLE IF NOT EXISTS user_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trial"
  ON user_trials FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own trial"
  ON user_trials FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_trials_user_id ON user_trials(user_id);
