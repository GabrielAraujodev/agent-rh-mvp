import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseAdmin();
    const auth = await getUser(request);
    if (!auth) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data, error } = await supabase
      .from("jobs")
      .select("*, candidates(*)")
      .eq("id", params.id)
      .eq("user_id", auth.id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });

    return NextResponse.json({ job: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseAdmin();
    const auth = await getUser(request);
    if (!auth) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await request.json();
    const { data, error } = await supabase
      .from("jobs")
      .update(body)
      .eq("id", params.id)
      .eq("user_id", auth.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ job: data });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro" }, { status: 500 });
  }
}

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseAdmin();
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}
