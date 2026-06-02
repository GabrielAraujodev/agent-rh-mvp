"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", department: "", location: "", description: "", requirements: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/app/jobs/${data.job.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar vaga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">Nova Vaga</h2>
      <p className="mt-1 text-sm text-gray-500">Cadastre uma vaga e comece a receber candidatos.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Departamento</label>
            <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Ex: Tecnologia" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Local</label>
            <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Ex: São Paulo - SP" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição da Vaga</label>
          <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Descreva as responsabilidades e atividades..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Requisitos</label>
          <textarea rows={4} value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Formação, habilidades, experiência..." />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
            {loading ? "Criando..." : "Criar Vaga"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
