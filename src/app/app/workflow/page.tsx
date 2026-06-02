"use client";

import { UploadForm } from "@/components/upload-form";

export default function WorkflowPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Nova Triagem</h2>
        <p className="mt-1 text-sm text-gray-500">
        Cole o currículo e a descrição da vaga para análise instantânea.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
