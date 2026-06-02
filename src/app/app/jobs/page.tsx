"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { Job } from "@/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<(Job & { candidates: { count: number } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const res = await fetch("/api/jobs", { headers: { authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.jobs) setJobs(data.jobs);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Nenhuma vaga cadastrada ainda.</p>
          <Link href="/app/jobs/new" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
            Criar primeira vaga →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/app/jobs/${job.id}`}
              className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{job.title}</h3>
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  job.status === "active" ? "bg-green-100 text-green-700" :
                  job.status === "closed" ? "bg-gray-100 text-gray-500" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {job.status === "active" ? "Ativa" : job.status === "closed" ? "Fechada" : "Rascunho"}
                </span>
              </div>
              {job.department && <p className="mt-1 text-sm text-gray-500">{job.department}</p>}
              {job.location && <p className="text-sm text-gray-400">{job.location}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>{(job as any).candidates?.count || 0} candidatos</span>
                <span>{new Date(job.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
