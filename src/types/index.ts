export interface TriageResult {
  score: number;
  strengths: string[];
  gaps: string[];
  feedback: string;
  summary: string;
}

export interface WorkflowExecution {
  id: string;
  user_id: string;
  job_title: string;
  resume_text: string;
  job_description: string;
  result: TriageResult;
  created_at: string;
}

export type StepStatus = "pending" | "running" | "done" | "error";

export interface WorkflowStep {
  name: string;
  description: string;
  status: StepStatus;
}

// --- ATS Types ---

export interface Job {
  id: string;
  user_id: string;
  title: string;
  department: string | null;
  location: string | null;
  description: string | null;
  requirements: string | null;
  status: "active" | "closed" | "draft";
  created_at: string;
  updated_at: string;
}

export type CandidateStatus = "triagem" | "entrevista" | "oferta" | "contratado" | "rejeitado";

export interface Candidate {
  id: string;
  job_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  resume_text: string | null;
  score: number | null;
  summary: string | null;
  strengths: string[];
  gaps: string[];
  feedback: string | null;
  status: CandidateStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const PIPELINE_STAGES: { key: CandidateStatus; label: string; color: string }[] = [
  { key: "triagem", label: "Triagem", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "entrevista", label: "Entrevista", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { key: "oferta", label: "Oferta", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { key: "contratado", label: "Contratado", color: "bg-green-100 text-green-800 border-green-200" },
  { key: "rejeitado", label: "Rejeitado", color: "bg-red-100 text-red-800 border-red-200" },
];
