/*
  Fix RLS Infinite Recursion for user_profiles
  
  Overview:
  Removes the circular reference in admin policies that was causing infinite recursion.
  Admin policies were checking user_profiles to determine if user is admin, creating a loop.
  
  Changes:
  - Drop problematic admin policies that cause recursion
  - Keep basic user policies for own data access
  - Admins will need separate admin-specific tables or functions if needed
  
  Security:
  - Users maintain access to their own profiles
  - Recursive admin checks removed
*/

-- Drop admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON subscriptions;
