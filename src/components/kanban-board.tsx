"use client";

import { useState } from "react";
import type { Candidate, CandidateStatus, Job } from "@/types";
import { PIPELINE_STAGES } from "@/types";

interface Props {
  job: Job;
  candidates: Candidate[];
  token: string;
  onRefresh: () => void;
}

export function KanbanBoard({ job, candidates, token, onRefresh }: Props) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", resumeText: "" });
  const [addLoading, setAddLoading] = useState(false);

  const grouped = Object.fromEntries(
    PIPELINE_STAGES.map(s => [s.key, candidates.filter(c => c.status === s.key)])
  ) as Record<CandidateStatus, Candidate[]>;

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
    await fetch(`/api/jobs/${job.id}/candidates/${candidateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    onRefresh();
  };

  const handleDelete = async (candidateId: string) => {
    if (!confirm("Remover este candidato?")) return;
    await fetch(`/api/jobs/${job.id}/candidates/${candidateId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    setSelectedCandidate(null);
    onRefresh();
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    await fetch(`/api/jobs/${job.id}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...addForm, resumeText: addForm.resumeText || undefined }),
    });
    setAddLoading(false);
    setAdding(false);
    setAddForm({ name: "", email: "", phone: "", resumeText: "" });
    onRefresh();
  };

  const stageCounts = Object.fromEntries(
    PIPELINE_STAGES.map(s => [s.key, candidates.filter(c => c.status === s.key).length])
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-gray-700">Pipeline:</span>
        {PIPELINE_STAGES.map(s => (
          <span key={s.key} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {s.label} ({stageCounts[s.key]})
          </span>
        ))}
        <button onClick={() => setAdding(true)}
          className="ml-auto rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
          + Adicionar Candidato
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-5 gap-3">
        {PIPELINE_STAGES.map(stage => (
          <div key={stage.key} className="rounded-lg border border-gray-200 bg-gray-50">
            <div className={`rounded-t-lg border-b px-3 py-2 text-xs font-semibold uppercase tracking-wider ${stage.color}`}>
              {stage.label}
              <span className="ml-1">({grouped[stage.key].length})</span>
            </div>
            <div className="space-y-2 p-2 min-h-[120px]">
              {grouped[stage.key].length === 0 && (
                <p className="py-4 text-center text-xs text-gray-400">Vazio</p>
              )}
              {grouped[stage.key].map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className="cursor-pointer rounded-md border border-gray-200 bg-white p-3 text-xs shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="font-medium text-gray-900">{candidate.name}</p>
                  {candidate.email && <p className="mt-0.5 text-gray-500 truncate">{candidate.email}</p>}
                  {candidate.score !== null && (
                    <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      candidate.score >= 80 ? "bg-green-100 text-green-700" :
                      candidate.score >= 50 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      Score: {candidate.score}/100
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Detalhes do Candidato */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedCandidate(null)}>
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedCandidate.name}</h3>
                <p className="text-sm text-gray-500">{selectedCandidate.email}{selectedCandidate.phone ? ` • ${selectedCandidate.phone}` : ""}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {selectedCandidate.score !== null && (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Score:</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${
                    selectedCandidate.score >= 80 ? "bg-green-100 text-green-700" :
                    selectedCandidate.score >= 50 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{selectedCandidate.score}/100</span>
                </div>
                {selectedCandidate.summary && <p className="mt-2 text-sm text-gray-600">{selectedCandidate.summary}</p>}
              </div>
            )}

            {(selectedCandidate.strengths?.length > 0 || selectedCandidate.gaps?.length > 0) && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {selectedCandidate.strengths?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-green-600">✅ Pontos Fortes</p>
                    <ul className="mt-1 space-y-1">
                      {selectedCandidate.strengths.map((s, i) => <li key={i} className="text-xs text-gray-600">• {s}</li>)}
                    </ul>
                  </div>
                )}
                {selectedCandidate.gaps?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-red-600">⚠️ Gaps</p>
                    <ul className="mt-1 space-y-1">
                      {selectedCandidate.gaps.map((g, i) => <li key={i} className="text-xs text-gray-600">• {g}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedCandidate.feedback && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Feedback</p>
                <p className="mt-1 text-sm text-gray-600">{selectedCandidate.feedback}</p>
              </div>
            )}

            {/* Mover de estágio */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Mover para:</p>
              <div className="flex flex-wrap gap-2">
                {PIPELINE_STAGES.map(s => (
                  <button
                    key={s.key}
                    onClick={() => handleStatusChange(selectedCandidate.id, s.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border ${
                      selectedCandidate.status === s.key
                        ? `${s.color} border-current`
                        : "border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => handleDelete(selectedCandidate.id)}
                className="text-xs text-red-500 hover:text-red-700 underline">Remover candidato</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Adicionar Candidato */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setAdding(false)}>
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Adicionar Candidato</h3>
            <form onSubmit={handleAddCandidate} className="mt-4 space-y-3">
              <input type="text" placeholder="Nome *" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="email" placeholder="Email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
                <input type="text" placeholder="Telefone" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
              </div>
              <textarea rows={4} placeholder="Currículo (cole o texto para triagem automática)" value={addForm.resumeText} onChange={e => setAddForm({ ...addForm, resumeText: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={addLoading}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                  {addLoading ? "Adicionando..." : "Adicionar"}
                </button>
                <button type="button" onClick={() => setAdding(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
