/*
  # Optimize RLS Performance

  1. Overview
    - Fixes RLS policies to use (SELECT auth.uid()) pattern for better performance
    - Prevents re-evaluation of auth functions for each row
    - Improves query performance at scale

  2. Changes
    - Recreate all RLS policies using the optimized (SELECT auth.uid()) pattern
    - Affects tables: user_profiles, projects, content_assets, automations, subscriptions, 
      user_trials, visual_generations, products, project_milestones

  3. Security
    - Maintains same security guarantees
    - All policies remain restrictive and check ownership
    - No security regression
*/

-- ============================================================================
-- USER_PROFILES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- CONTENT_ASSETS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own content assets" ON content_assets;
DROP POLICY IF EXISTS "Users can create content assets for own projects" ON content_assets;
DROP POLICY IF EXISTS "Users can delete own content assets" ON content_assets;

CREATE POLICY "Users can view own content assets"
  ON content_assets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = content_assets.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create content assets for own projects"
  ON content_assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = content_assets.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete own content assets"
  ON content_assets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = content_assets.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- AUTOMATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own automations" ON automations;
DROP POLICY IF EXISTS "Users can create automations for own projects" ON automations;
DROP POLICY IF EXISTS "Users can delete own automations" ON automations;

CREATE POLICY "Users can view own automations"
  ON automations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = automations.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create automations for own projects"
  ON automations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = automations.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete own automations"
  ON automations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = automations.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- USER_TRIALS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own trial" ON user_trials;
DROP POLICY IF EXISTS "Users can insert own trial" ON user_trials;

CREATE POLICY "Users can view own trial"
  ON user_trials FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own trial"
  ON user_trials FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- VISUAL_GENERATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own visual generations" ON visual_generations;
DROP POLICY IF EXISTS "Users can create visual generations for own projects" ON visual_generations;
DROP POLICY IF EXISTS "Users can delete own visual generations" ON visual_generations;

CREATE POLICY "Users can view own visual generations"
  ON visual_generations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = visual_generations.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create visual generations for own projects"
  ON visual_generations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = visual_generations.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete own visual generations"
  ON visual_generations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = visual_generations.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view products from their projects" ON products;
DROP POLICY IF EXISTS "Users can insert products to their projects" ON products;
DROP POLICY IF EXISTS "Users can update products from their projects" ON products;
DROP POLICY IF EXISTS "Users can delete products from their projects" ON products;

CREATE POLICY "Users can view products from their projects"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert products to their projects"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update products from their projects"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete products from their projects"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- PROJECT_MILESTONES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view milestones from their projects" ON project_milestones;
DROP POLICY IF EXISTS "Users can insert milestones to their projects" ON project_milestones;
DROP POLICY IF EXISTS "Users can update milestones from their projects" ON project_milestones;
DROP POLICY IF EXISTS "Users can delete milestones from their projects" ON project_milestones;

CREATE POLICY "Users can view milestones from their projects"
  ON project_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert milestones to their projects"
  ON project_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update milestones from their projects"
  ON project_milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete milestones from their projects"
  ON project_milestones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = (SELECT auth.uid())
    )
  );