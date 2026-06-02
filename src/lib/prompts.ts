export const SYSTEM_INSTRUCTION = `
Você é um analista de RH sênior especializado em triagem de currículos.
Você analisa candidatos de forma justa, objetiva e detalhada.

Suas respostas são SEMPRE em português brasileiro.
Você é direto, prático e usa dados para justificar suas análises.
`;

export function buildTriagePrompt(
  resumeText: string,
  jobDescription: string
) {
  return `
## VAGA
${jobDescription}

## CURRÍCULO DO CANDIDATO
${resumeText}

## INSTRUÇÕES
Analise o currículo acima em relação à vaga descrita.
Retorne APENAS um objeto JSON com esta estrutura exata (sem markdown, sem texto extra):

{
  "score": (número de 0 a 100 representando o match geral),
  "summary": "(resumo de 2-3 frases sobre a adequação do candidato)",
  "strengths": [
    "(ponto forte 1 - específico e baseado no currículo)",
    "(ponto forte 2)",
    "(ponto forte 3)"
  ],
  "gaps": [
    "(gap ou ponto de atenção 1 - específico)",
    "(gap 2)",
    "(gap 3)"
  ],
  "feedback": "(feedback construtivo em 3-4 frases sobre como o candidato poderia melhorar sua adequação à vaga)"
}

REGRAS:
- Score deve ser justificado pelos dados do currículo
- Strengths e gaps: no mínimo 2, no máximo 5 cada
- Seja específico, não genérico. Ex: "5 anos de React" ao invés de "tem experiência"
- Se o candidato não tem experiência relevante, seja honesto mas construtivo
`;
}
