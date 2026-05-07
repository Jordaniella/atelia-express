/*
  # Add Products, Milestones, and Enhanced Assets System

  ## 1. New Tables
    
    ### `products`
    - `id` (uuid, primary key)
    - `project_id` (uuid, foreign key to projects)
    - `name` (text) - Product name
    - `description` (text) - Product description
    - `slug` (text) - Stable identifier for storage paths
    - `price` (text, nullable) - Price/pricing tier
    - `target_segment` (text, nullable) - Specific audience segment
    - `unique_value_proposition` (text, nullable) - What makes this product unique
    - `status` (text) - draft, active, archived
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `project_milestones`
    - `id` (uuid, primary key)
    - `project_id` (uuid, foreign key to projects)
    - `title` (text) - Milestone title
    - `description` (text, nullable) - Milestone details
    - `due_at` (timestamptz) - Due date/time
    - `status` (text) - todo, in_progress, done
    - `priority` (text) - low, medium, high
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Enhanced Existing Tables
    
    ### `content_assets` - Add planning fields
    - `product_id` (uuid, nullable, foreign key to products)
    - `title` (text, nullable) - Human-readable title
    - `channel` (text, nullable) - instagram, tiktok, email, landing, blog, ads
    - `status` (text) - draft, planned, published
    - `publish_at` (timestamptz, nullable) - Scheduled publication date
    - `notes` (text, nullable) - Additional notes
    - `updated_at` (timestamptz)

    ### `visual_generations` - Add product linking and storage
    - `product_id` (uuid, nullable, foreign key to products)
    - `storage_path` (text, nullable) - Organized folder path
    - `file_name` (text, nullable) - Original filename
    - `title` (text, nullable) - Human-readable title
    - `updated_at` (timestamptz)

  ## 3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
    - Ensure product access is controlled via project ownership
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  slug text NOT NULL,
  price text,
  target_segment text,
  unique_value_proposition text,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_at timestamptz NOT NULL,
  status text DEFAULT 'todo' NOT NULL,
  priority text DEFAULT 'medium' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add new columns to content_assets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE content_assets ADD COLUMN product_id uuid REFERENCES products(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'title'
  ) THEN
    ALTER TABLE content_assets ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'channel'
  ) THEN
    ALTER TABLE content_assets ADD COLUMN channel text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'status'
  ) THEN
    ALTER TABLE content_assets ADD COLUMN status text DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'publish_at'
  ) THEN
    ALTER TABLE content_assets ADD COLUMN publish_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'notes'
  ) THEN
    ALTER TABLE content_assets ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_assets' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE content_assets ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add new columns to visual_generations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visual_generations' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE visual_generations ADD COLUMN product_id uuid REFERENCES products(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visual_generations' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE visual_generations ADD COLUMN storage_path text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visual_generations' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE visual_generations ADD COLUMN file_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visual_generations' AND column_name = 'title'
  ) THEN
    ALTER TABLE visual_generations ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'visual_generations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE visual_generations ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can view products from their projects"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert products to their projects"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update products from their projects"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products from their projects"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = products.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Enable RLS on project_milestones
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- Milestones policies
CREATE POLICY "Users can view milestones from their projects"
  ON project_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert milestones to their projects"
  ON project_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones from their projects"
  ON project_milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete milestones from their projects"
  ON project_milestones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_project_id_idx ON products(project_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS project_milestones_project_id_idx ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS project_milestones_due_at_idx ON project_milestones(due_at);
CREATE INDEX IF NOT EXISTS content_assets_product_id_idx ON content_assets(product_id);
CREATE INDEX IF NOT EXISTS content_assets_publish_at_idx ON content_assets(publish_at);
CREATE INDEX IF NOT EXISTS visual_generations_product_id_idx ON visual_generations(product_id);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-generate slug for products
CREATE OR REPLACE FUNCTION set_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_slug_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_slug();

-- Update updated_at timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER content_assets_updated_at
  BEFORE UPDATE ON content_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER visual_generations_updated_at
  BEFORE UPDATE ON visual_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();