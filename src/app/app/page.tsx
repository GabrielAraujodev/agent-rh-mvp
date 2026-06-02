"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { Job, Candidate, CandidateStatus, PIPELINE_STAGES } from "@/types";

export default function AppDashboard() {
  const [stats, setStats] = useState({ vagas: 0, candidatos: 0, contratados: 0 });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const supabase = getSupabase();
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const res = await fetch("/api/jobs", { headers: { authorization: `Bearer ${token}` } });
      const data = await res.json();
      const jobs: Job[] = data.jobs || [];

      setRecentJobs(jobs.slice(0, 5));

      // Busca candidatos de todas as vagas
      let totalCandidatos = 0;
      let totalContratados = 0;
      for (const job of jobs) {
        const jRes = await fetch(`/api/jobs/${job.id}`, { headers: { authorization: `Bearer ${token}` } });
        const jData = await jRes.json();
        const candidates: Candidate[] = jData.job?.candidates || [];
        totalCandidatos += candidates.length;
        totalContratados += candidates.filter(c => c.status === "contratado").length;
      }

      setStats({ vagas: jobs.length, candidatos: totalCandidatos, contratados: totalContratados });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Vagas Abertas</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.vagas}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Candidatos</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.candidatos}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Contratados</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{stats.contratados}</p>
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Últimas Vagas</h2>
          <Link href="/app/jobs" className="text-sm font-medium text-primary-600 hover:text-primary-700">Ver todas →</Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-500">Nenhuma vaga ainda.</p>
            <Link href="/app/jobs/new" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
              Criar primeira vaga →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Vaga</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/app/jobs/${job.id}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{job.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        job.status === "active" ? "bg-green-100 text-green-700" :
                        job.status === "closed" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {job.status === "active" ? "Ativa" : job.status === "closed" ? "Fechada" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(job.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link href="/app/jobs/new" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Nova Vaga
        </Link>
        <Link href="/app/workflow" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          🔍 Triagem Rápida
        </Link>
      </div>
    </div>
  );
}
