"use client";

import { useState } from "react";
import type { TriageResult, WorkflowStep } from "@/types";
import { ResultCard } from "./result-card";

export function UploadForm() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || !jobDescription) return;

    setLoading(true);
    setResult(null);
    setError(null);

    setSteps([
      { name: "Extração", description: "Analisando currículo...", status: "running" },
      { name: "Análise", description: "Comparando com a vaga...", status: "pending" },
      { name: "Resultado", description: "Gerando feedback...", status: "pending" },
    ]);

    try {
      // Etapa 1: Extração
      await sleep(500);
      setSteps((s) =>
        s.map((st) =>
          st.name === "Extração" ? { ...st, status: "done" } : st
        )
      );
      setSteps((s) =>
        s.map((st) =>
          st.name === "Análise" ? { ...st, status: "running" } : st
        )
      );

      // Etapa 2: Chamar IA
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          jobTitle: jobTitle || "Vaga",
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao processar");
      }

      const data = await response.json();

      setSteps((s) =>
        s.map((st) =>
          st.name === "Análise" ? { ...st, status: "done" } : st
        )
      );
      setSteps((s) =>
        s.map((st) =>
          st.name === "Resultado" ? { ...st, status: "running" } : st
        )
      );

      await sleep(300);
      setResult(data.result);
      setSteps((s) =>
        s.map((st) =>
          st.name === "Resultado" ? { ...st, status: "done" } : st
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      setSteps((s) =>
        s.map((st) =>
          st.status === "running" ? { ...st, status: "error" } : st
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título da vaga */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título da Vaga
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Ex: Engenheiro de Software Sênior"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Descrição da vaga */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descrição da Vaga
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            placeholder="Cole a descrição da vaga aqui..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          />
        </div>

        {/* Currículo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currículo do Candidato
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            placeholder="Cole o texto do currículo aqui..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            Cole o texto completo do currículo. Suporta até 10.000 caracteres.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !resumeText || !jobDescription}
          className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Analisando..." : "Analisar Candidato"}
        </button>
      </form>

      {/* Status das etapas */}
      {steps.length > 0 && (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-700">Progresso</h3>
          {steps.map((step) => (
            <div key={step.name} className="flex items-center gap-3">
              {step.status === "running" && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              )}
              {step.status === "done" && (
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {step.status === "error" && (
                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {step.status === "pending" && (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span
                className={`text-sm ${
                  step.status === "running"
                    ? "font-medium text-primary-700"
                    : step.status === "done"
                    ? "text-green-700"
                    : step.status === "error"
                    ? "text-red-700"
                    : "text-gray-400"
                }`}
              >
                {step.name}: {step.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <p className="mt-1 text-xs text-red-500">
            Verifique sua chave da API Gemini no .env.local
          </p>
        </div>
      )}

      {/* Resultado */}
      {result && <ResultCard result={result} />}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
