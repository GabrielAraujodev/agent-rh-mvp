import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <div className="inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700 mb-6">
          🚀 Beta Grátis — Sem cartão de crédito
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
          Triagem de currículos{" "}
          <span className="text-primary-600">com IA</span>
          <br />
          em segundos
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Análise inteligente de candidatos usando IA. Cole o currículo e a vaga,
          receba uma análise completa com score de match, pontos fortes e feedback.
          <strong className="text-gray-800"> Grátis durante o beta.</strong>
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-lg bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            Começar Grátis →
          </Link>

          <a
            href="#como-funciona"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Como Funciona
          </a>
        </div>

        {/* Métricas sociais */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-gray-200 pt-8">
          <div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Clientes pagando</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">∞</p>
            <p className="text-sm text-gray-500">Horas economizadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">100%</p>
            <p className="text-sm text-gray-500">Satisfação (até agora)</p>
          </div>
        </div>
      </div>

      {/* Seção "Como funciona" */}
      <div id="como-funciona" className="mt-24 mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Como funciona
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Cole os dados",
              desc: "Insira a descrição da vaga e o currículo do candidato.",
            },
            {
              step: "2",
              title: "IA analisa",
              desc: "Nossa IA avalia compatibilidade, extrai pontos fortes e gaps.",
            },
            {
              step: "3",
              title: "Veja o resultado",
              desc: "Receba um score de match, feedback detalhado e recomendações.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
