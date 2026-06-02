"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { KanbanBoard } from "@/components/kanban-board";
import type { Job, Candidate } from "@/types";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const loadData = async () => {
    const supabase = getSupabase();
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token ?? "";
    setToken(accessToken);

    const res = await fetch(`/api/jobs/${id}`, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) { router.push("/app"); return; }
    const data = await res.json();
    setJob(data.job);
    setCandidates(data.job.candidates || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const handleRefresh = () => loadData();

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" /></div>;
  if (!job) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              job.status === "active" ? "bg-green-100 text-green-700" :
              job.status === "closed" ? "bg-gray-100 text-gray-500" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {job.status === "active" ? "Ativa" : job.status === "closed" ? "Fechada" : "Rascunho"}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {job.department && `${job.department} • `}{job.location && `${job.location} • `}
            Criada em {new Date(job.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <button onClick={() => router.push("/app/jobs")}
          className="text-sm text-gray-500 hover:text-gray-700">
          ← Voltar
        </button>
      </div>

      {/* Description */}
      {job.description && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-700">Descrição da Vaga</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{job.description}</p>
        </div>
      )}

      {/* Kanban Pipeline */}
      <KanbanBoard job={job} candidates={candidates} token={token} onRefresh={handleRefresh} />
    </div>
  );
}
