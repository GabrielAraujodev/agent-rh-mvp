"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/app", label: "📊 Dashboard", icon: "▫" },
  { href: "/app/jobs", label: "💼 Vagas", icon: "▫" },
  { href: "/app/workflow", label: "🤖 Triagem Rápida", icon: "▫" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/auth/login"); return; }
      setUser(session.user);
      setChecking(false);
    });
  }, [router]);

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    router.push("/");
  };

  if (checking) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  // Job detail page tem layout próprio
  const isJobDetail = pathname?.startsWith("/app/jobs/") && pathname !== "/app/jobs" && pathname !== "/app/jobs/new";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Sidebar-style nav */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-6">
          <Link href="/app" className="text-lg font-bold text-primary-600">TalentAI</Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href))
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {!isJobDetail && (
            <Link
              href="/app/jobs/new"
              className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              + Nova Vaga
            </Link>
          )}
          <span className="text-xs text-gray-400">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
        </div>
      </div>
      {children}
    </div>
  );
}
