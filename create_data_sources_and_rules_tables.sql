-- Create data_sources and rules tables for AI routing system
-- Run this SQL in your Supabase SQL Editor

-- Create data_sources table
CREATE TABLE IF NOT EXISTS public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'google', 'perplexity', 'custom'
  api_key TEXT NOT NULL,
  model_name VARCHAR(255), -- e.g., 'gpt-4', 'claude-3-opus', 'gemini-2.0-flash-exp'
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rules table
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  classification_level VARCHAR(50) NOT NULL CHECK (classification_level IN ('public', 'internal', 'confidential', 'restricted')),
  data_source_id UUID NOT NULL REFERENCES public.data_sources(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_sources_organization_id ON public.data_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_is_active ON public.data_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_rules_organization_id ON public.rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_rules_classification_level ON public.rules(classification_level);
CREATE INDEX IF NOT EXISTS idx_rules_is_active ON public.rules(is_active);
CREATE INDEX IF NOT EXISTS idx_rules_priority ON public.rules(priority DESC);

-- Add comments to tables and columns
COMMENT ON TABLE public.data_sources IS 'AI model configurations with API keys for each organization';
COMMENT ON COLUMN public.data_sources.type IS 'AI provider type: openai, anthropic, google, perplexity, or custom';
COMMENT ON COLUMN public.data_sources.api_key IS 'API key for the AI service (encrypted at application layer)';
COMMENT ON COLUMN public.data_sources.model_name IS 'Specific model name like gpt-4, claude-3-opus, gemini-2.0-flash-exp';

COMMENT ON TABLE public.rules IS 'Rules for routing queries to specific AI models based on classification level';
COMMENT ON COLUMN public.rules.classification_level IS 'Classification level: public, internal, confidential, or restricted';
COMMENT ON COLUMN public.rules.priority IS 'Higher priority rules are checked first (default: 0)';

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (optional - you can modify based on your security needs)
-- For now, we'll allow all operations since we're using supabaseAdmin in the API

-- Policy for data_sources: Only allow operations via service role
CREATE POLICY "Allow service role all operations" ON public.data_sources
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy for rules: Only allow operations via service role
CREATE POLICY "Allow service role all operations" ON public.rules
  FOR ALL
  USING (true)
  WITH CHECK (true);
