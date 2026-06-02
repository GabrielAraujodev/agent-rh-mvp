import type { TriageResult } from "@/types";

export function ResultCard({ result }: { result: TriageResult }) {
  const scoreColor =
    result.score >= 80
      ? "text-green-600"
      : result.score >= 50
      ? "text-yellow-600"
      : "text-red-600";

  const scoreBg =
    result.score >= 80
      ? "bg-green-50 border-green-200"
      : result.score >= 50
      ? "bg-yellow-50 border-yellow-200"
      : "bg-red-50 border-red-200";

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      {/* Score */}
      <div className={`rounded-lg border p-4 text-center ${scoreBg}`}>
        <span className={`text-4xl font-bold ${scoreColor}`}>
          {result.score}
        </span>
        <span className={`ml-2 text-lg ${scoreColor}`}>/ 100</span>
        <p className="mt-1 text-sm text-gray-500">
          {result.score >= 80
            ? "Match alto — candidato muito adequado"
            : result.score >= 50
            ? "Match médio — candidato com potencial"
            : "Match baixo — candidato não atende requisitos"}
        </p>
      </div>

      {/* Summary */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700">Resumo</h3>
        <p className="mt-1 text-sm text-gray-600">{result.summary}</p>
      </div>

      {/* Strengths */}
      <div>
        <h3 className="text-sm font-semibold text-green-700">✅ Pontos Fortes</h3>
        <ul className="mt-2 space-y-1">
          {result.strengths.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-600">
              <span className="mt-0.5 text-green-500">•</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Gaps */}
      {result.gaps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-yellow-700">⚠️ Pontos de Atenção</h3>
          <ul className="mt-2 space-y-1">
            {result.gaps.map((g, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-yellow-500">•</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700">💬 Feedback</h3>
        <p className="mt-1 text-sm text-gray-600">{result.feedback}</p>
      </div>
    </div>
  );
}
