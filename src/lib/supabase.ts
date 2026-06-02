import { createClient, SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Retorna o cliente Supabase para uso no navegador.
 * Inicializa sob demanda (lazy) para não quebrar o build.
 */
export function getSupabase(): SupabaseClient {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase não configurado. " +
      "Crie um .env.local com:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=sua-url\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave"
    );
  }

  browserClient = createClient(supabaseUrl!, supabaseAnonKey!);
  return browserClient;
}

/**
 * Cliente Supabase para uso em API routes (servidor).
 * Usa autenticação stateless (sem refresh token).
 */
export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase não configurado no servidor");
  }

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ⚠️ Para uso em CLIENT COMPONENTS (React):
// import { getSupabase } from "@/lib/supabase";
// const supabase = getSupabase();
