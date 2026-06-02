import { NextRequest, NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { buildTriagePrompt, SYSTEM_INSTRUCTION } from "@/lib/prompts";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { TriageResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, jobTitle } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Currículo e descrição da vaga são obrigatórios" },
        { status: 400 }
      );
    }

    if (resumeText.length > 15000 || jobDescription.length > 10000) {
      return NextResponse.json(
        { error: "Texto muito longo. Máximo: 15k caracteres (currículo) e 10k (vaga)." },
        { status: 400 }
      );
    }

    // 🔥 CHAMADA PARA O GEMINI (GRÁTIS)
    const prompt = buildTriagePrompt(resumeText, jobDescription);
    const result = await callGeminiJSON<TriageResult>(prompt, SYSTEM_INSTRUCTION);

    // Valida o resultado
    if (typeof result.score !== "number" || result.score < 0 || result.score > 100) {
      throw new Error("Score inválido retornado pelo modelo");
    }

    // Salva no banco (se usuário autenticado)
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader) {
      const supabaseAdmin = getSupabaseAdmin();
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        userId = user.id;
        await supabaseAdmin.from("workflow_executions").insert({
          user_id: userId,
          job_title: jobTitle || "Vaga",
          resume_text: resumeText.substring(0, 500),
          job_description: jobDescription.substring(0, 500),
          result,
        });
      }
    }

    return NextResponse.json({
      result,
      saved: !!userId,
    });
  } catch (error: unknown) {
    console.error("Erro no triage:", error);

    const message =
      error instanceof Error ? error.message : "Erro interno do servidor";

    // Erro específico da API Gemini
    if (message.includes("API_KEY") || message.includes("not found")) {
      return NextResponse.json(
        {
          error:
            "Chave da API Gemini não configurada. " +
            "Crie um arquivo .env.local com GEMINI_API_KEY=sua-chave-aqui",
        },
        { status: 500 }
      );
    }

    // Erro de parsing do JSON
    if (message.includes("JSON") || message.includes("parse")) {
      return NextResponse.json(
        {
          error:
            "Erro ao processar resposta da IA. Tente novamente.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
