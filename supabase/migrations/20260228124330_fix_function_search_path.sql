/*
  # Fix Function Search Path Security

  1. Overview
    - Adds SECURITY DEFINER and explicit search_path to functions
    - Prevents search_path injection attacks
    - Follows PostgreSQL security best practices

  2. Changes
    - Recreate functions with proper SECURITY DEFINER and search_path settings
    - Affects: generate_slug, set_product_slug, update_updated_at

  3. Security
    - Functions now have immutable search_path
    - Prevents privilege escalation attacks
    - No functional changes
*/

-- ============================================================================
-- DROP ALL TRIGGERS FIRST
-- ============================================================================

DROP TRIGGER IF EXISTS set_product_slug_trigger ON products;
DROP TRIGGER IF EXISTS products_slug_trigger ON products;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_content_assets_updated_at ON content_assets;
DROP TRIGGER IF EXISTS update_visual_generations_updated_at ON visual_generations;
DROP TRIGGER IF EXISTS update_project_milestones_updated_at ON project_milestones;
DROP TRIGGER IF EXISTS products_updated_at ON products;
DROP TRIGGER IF EXISTS milestones_updated_at ON project_milestones;
DROP TRIGGER IF EXISTS content_assets_updated_at ON content_assets;
DROP TRIGGER IF EXISTS visual_generations_updated_at ON visual_generations;

-- ============================================================================
-- DROP AND RECREATE FUNCTIONS WITH SECURE SEARCH_PATH
-- ============================================================================

DROP FUNCTION IF EXISTS generate_slug(text) CASCADE;
DROP FUNCTION IF EXISTS set_product_slug() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        trim(input_text),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$;

-- Automatically set product slug before insert
CREATE OR REPLACE FUNCTION set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- RECREATE ALL TRIGGERS
-- ============================================================================

CREATE TRIGGER set_product_slug_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_slug();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_assets_updated_at
  BEFORE UPDATE ON content_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_visual_generations_updated_at
  BEFORE UPDATE ON visual_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();