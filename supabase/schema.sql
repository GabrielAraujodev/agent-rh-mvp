-- ============================================
-- SCHEMA DO SUPABASE — MVP TalentAI
-- Execute isso no SQL Editor do Supabase
-- ============================================

-- 1. Tabela de execuções dos workflows
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT DEFAULT 'Vaga',
  resume_text TEXT,
  job_description TEXT,
  result JSONB NOT NULL,           -- { score, summary, strengths, gaps, feedback }
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_workflow_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_created_at ON workflow_executions(created_at DESC);

-- 3. Row Level Security (proteção multi-tenant)
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Política: usuário só vê PRÓPRIOS dados
CREATE POLICY "users_see_own_executions"
  ON workflow_executions
  FOR ALL
  USING (auth.uid() = user_id);

-- 4. Trigger para atualizar timestamp (opcional)
-- Isso é automático com o DEFAULT now()
