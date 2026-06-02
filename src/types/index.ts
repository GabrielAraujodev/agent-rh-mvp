export interface TriageInput {
  resumeText: string;
  jobDescription: string;
}

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
