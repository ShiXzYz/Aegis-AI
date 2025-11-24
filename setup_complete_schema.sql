-- Complete database setup for AI routing system
-- This script will create tables if they don't exist and update existing ones
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- STEP 1: Create data_sources table
-- ============================================
CREATE TABLE IF NOT EXISTS public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  api_key TEXT NOT NULL,
  model_name VARCHAR(255),
  organization_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for data_sources if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'data_sources_organization_id_fkey'
  ) THEN
    ALTER TABLE public.data_sources
    ADD CONSTRAINT data_sources_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- STEP 2: Update or create rules table
-- ============================================

-- Check if rules table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rules') THEN
    -- Create new rules table if it doesn't exist
    CREATE TABLE public.rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      classification_level VARCHAR(50) NOT NULL CHECK (classification_level IN ('public', 'internal', 'confidential', 'restricted')),
      data_source_id UUID NOT NULL,
      organization_id UUID NOT NULL,
      priority INTEGER DEFAULT 0 NOT NULL,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Update existing rules table
    -- Add columns if they don't exist
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS classification_level VARCHAR(50);
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS data_source_id UUID;
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS organization_id UUID;
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Set default values for NULL entries
    UPDATE public.rules SET classification_level = 'public' WHERE classification_level IS NULL;
    UPDATE public.rules SET priority = 0 WHERE priority IS NULL;
    UPDATE public.rules SET is_active = true WHERE is_active IS NULL;
    UPDATE public.rules SET created_at = NOW() WHERE created_at IS NULL;
    UPDATE public.rules SET updated_at = NOW() WHERE updated_at IS NULL;
  END IF;
END $$;

-- Add constraints for rules table
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

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_data_sources_organization_id ON public.data_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_is_active ON public.data_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_rules_organization_id ON public.rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_rules_classification_level ON public.rules(classification_level);
CREATE INDEX IF NOT EXISTS idx_rules_is_active ON public.rules(is_active);
CREATE INDEX IF NOT EXISTS idx_rules_priority ON public.rules(priority DESC);

-- ============================================
-- STEP 4: Enable Row Level Security
-- ============================================
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role all operations" ON public.data_sources;
DROP POLICY IF EXISTS "Allow service role all operations" ON public.rules;

-- Create RLS policies that allow service role (supabaseAdmin) to access everything
CREATE POLICY "Allow service role all operations" ON public.data_sources
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role all operations" ON public.rules
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 5: Add helpful comments
-- ============================================
COMMENT ON TABLE public.data_sources IS 'AI model configurations with API keys for each organization';
COMMENT ON COLUMN public.data_sources.type IS 'AI provider type: openai, anthropic, google, perplexity, or custom';
COMMENT ON COLUMN public.data_sources.api_key IS 'API key for the AI service';
COMMENT ON COLUMN public.data_sources.model_name IS 'Specific model name like gpt-4, claude-3-opus, gemini-2.0-flash-exp';

COMMENT ON TABLE public.rules IS 'Rules for routing queries to specific AI models based on classification level';
COMMENT ON COLUMN public.rules.classification_level IS 'Classification level: public, internal, confidential, or restricted';
COMMENT ON COLUMN public.rules.priority IS 'Higher priority rules are checked first (default: 0)';

-- ============================================
-- Done! Your database is now ready.
-- ============================================
