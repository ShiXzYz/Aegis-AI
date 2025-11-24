-- Update existing rules table to add missing columns
-- Run this SQL in your Supabase SQL Editor

-- First, let's see what columns exist
-- You can run this to check: SELECT column_name FROM information_schema.columns WHERE table_name = 'rules';

-- Add missing columns if they don't exist
ALTER TABLE public.rules
ADD COLUMN IF NOT EXISTS classification_level VARCHAR(50);

ALTER TABLE public.rules
ADD COLUMN IF NOT EXISTS data_source_id UUID;

ALTER TABLE public.rules
ADD COLUMN IF NOT EXISTS organization_id UUID;

ALTER TABLE public.rules
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

ALTER TABLE public.rules
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.rules
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE public.rules
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add constraints after columns exist
DO $$
BEGIN
  -- Add check constraint for classification_level
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rules_classification_level_check'
  ) THEN
    ALTER TABLE public.rules
    ADD CONSTRAINT rules_classification_level_check
    CHECK (classification_level IN ('public', 'internal', 'confidential', 'restricted'));
  END IF;

  -- Add foreign key for data_source_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rules_data_source_id_fkey'
  ) THEN
    ALTER TABLE public.rules
    ADD CONSTRAINT rules_data_source_id_fkey
    FOREIGN KEY (data_source_id)
    REFERENCES public.data_sources(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for organization_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rules_organization_id_fkey'
  ) THEN
    ALTER TABLE public.rules
    ADD CONSTRAINT rules_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_rules_organization_id ON public.rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_rules_classification_level ON public.rules(classification_level);
CREATE INDEX IF NOT EXISTS idx_rules_is_active ON public.rules(is_active);
CREATE INDEX IF NOT EXISTS idx_rules_priority ON public.rules(priority DESC);

-- Update NOT NULL constraints only if the columns have data
UPDATE public.rules SET classification_level = 'public' WHERE classification_level IS NULL;
UPDATE public.rules SET priority = 0 WHERE priority IS NULL;
UPDATE public.rules SET is_active = true WHERE is_active IS NULL;

-- Now make them NOT NULL
ALTER TABLE public.rules ALTER COLUMN classification_level SET NOT NULL;
ALTER TABLE public.rules ALTER COLUMN priority SET NOT NULL;
ALTER TABLE public.rules ALTER COLUMN is_active SET NOT NULL;
