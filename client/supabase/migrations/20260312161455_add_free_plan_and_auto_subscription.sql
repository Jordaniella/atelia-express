/*
  # Add Free Plan and Auto-Create Subscription on User Registration

  1. Changes
    - Update subscription plan constraint to include 'free' option
    - Create trigger function to automatically create subscription record
    - Create trigger to execute on user_profiles insert
  
  2. Behavior
    - When a new user is created in user_profiles table
    - Automatically creates a subscription record with plan='free' and status='active'
    - This ensures every user has a subscription record from the start
  
  3. Security
    - Function runs with security definer to bypass RLS
    - Only creates subscription if one doesn't already exist
*/

-- Update the plan constraint to include 'free'
DO $$
BEGIN
  -- Drop the old constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'subscriptions_plan_check'
  ) THEN
    ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_plan_check;
  END IF;
  
  -- Add the new constraint with 'free' included
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check 
    CHECK (plan IN ('free', 'trial', 'starter', 'pro', 'scale'));
END $$;

-- Create function to automatically create subscription on user creation
CREATE OR REPLACE FUNCTION public.create_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a subscription record for the new user
  INSERT INTO public.subscriptions (user_id, plan, status, generation_limit, image_limit)
  VALUES (NEW.id, 'free', 'active', -1, -1)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_user_created_subscription ON public.user_profiles;

-- Create trigger on user_profiles insert
CREATE TRIGGER on_user_created_subscription
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_subscription();

-- Add unique constraint on user_id to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_user_id_key'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;