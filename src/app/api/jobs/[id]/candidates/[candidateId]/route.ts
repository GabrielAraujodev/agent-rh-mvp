import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PUT(request: NextRequest, { params }: { params: { id: string; candidateId: string } }) {
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
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();
    if (!job) return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });

    const body = await request.json();
    const { status, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("candidates")
      .update(updateData)
      .eq("id", params.candidateId)
      .eq("job_id", params.id)
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string; candidateId: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseAdmin();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { error } = await supabase
      .from("candidates")
      .delete()
      .eq("id", params.candidateId)
      .eq("job_id", params.id);

    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
