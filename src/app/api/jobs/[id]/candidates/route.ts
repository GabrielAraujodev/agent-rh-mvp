import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseAdmin();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verifica se a vaga pertence ao user
    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, description")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();
    if (!job) return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });

    const body = await request.json();
    const { name, email, phone, resumeText } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome do candidato é obrigatório" }, { status: 400 });
    }

    // Se tiver currículo e descrição da vaga, faz triagem IA
    let score: number | null = null;
    let summary: string | null = null;
    let strengths: string[] = [];
    let gaps: string[] = [];
    let feedback: string | null = null;

    if (resumeText && job.description) {
      try {
        const { callGeminiJSON } = await import("@/lib/gemini");
        const { buildTriagePrompt, SYSTEM_INSTRUCTION } = await import("@/lib/prompts");
        const prompt = buildTriagePrompt(resumeText, job.description);
        const result = await callGeminiJSON<{
          score: number; summary: string; strengths: string[]; gaps: string[]; feedback: string;
        }>(prompt, SYSTEM_INSTRUCTION);
        score = result.score;
        summary = result.summary;
        strengths = result.strengths;
        gaps = result.gaps;
        feedback = result.feedback;
      } catch (e) {
        console.error("Erro na triagem automática:", e);
      }
    }

    const { data, error } = await supabase
      .from("candidates")
      .insert({
        job_id: params.id,
        name,
        email,
        phone,
        resume_text: resumeText,
        score,
        summary,
        strengths,
        gaps,
        feedback,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ candidate: data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
