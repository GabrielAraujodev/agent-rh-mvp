-- ============================================
-- SCHEMA COMPLETO — TalentAI ATS
-- ============================================

-- 1. Tabela de execuções dos workflows (triagem avulsa)
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT DEFAULT 'Vaga',
  resume_text TEXT,
  job_description TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Vagas (job openings)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  description TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Candidatos (pipeline)
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  resume_text TEXT,
  score INTEGER,
  summary TEXT,
  strengths JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',
  feedback TEXT,
  status TEXT DEFAULT 'triagem' CHECK (status IN ('triagem', 'entrevista', 'oferta', 'contratado', 'rejeitado')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_workflow_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_created_at ON workflow_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);

-- Row Level Security
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "users_see_own_executions"
  ON workflow_executions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "users_see_own_jobs"
  ON jobs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "users_manage_candidates"
  ON candidates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = candidates.job_id
      AND jobs.user_id = auth.uid()
    )
  );
