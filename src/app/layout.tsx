import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "TalentAI — Triagem de Currículos com IA",
  description:
    "Análise inteligente de candidatos usando IA. Grátis durante o beta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
          TalentAI MVP — Feito com IA para RHs do Brasil
        </footer>
      </body>
    </html>
  );
}
