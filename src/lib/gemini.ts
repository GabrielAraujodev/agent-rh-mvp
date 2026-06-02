import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.warn(
    "⚠️ OPENROUTER_API_KEY não encontrada. " +
    "O workflow de IA não vai funcionar até você configurar."
  );
}

const MODEL = process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free";

const client = apiKey
  ? new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://agent-rh-mvp.vercel.app",
        "X-Title": "TalentAI",
      },
    })
  : null;

/**
 * Chama o OpenRouter (modelo gratuito) com suporte a JSON.
 * Compatível com a mesma interface do Gemini.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  if (!client) {
    throw new Error(
      "OpenRouter não configurado. " +
      "Coloque sua OPENROUTER_API_KEY no .env.local"
    );
  }

  // Instrução para forçar JSON no output
  const jsonPrompt =
    `IMPORTANTE: Responda APENAS com um JSON válido. NÃO use markdown, NÃO use código, NÃO explique nada. ` +
    `Retorne SOMENTE o JSON.\n\n${prompt}`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          systemInstruction ??
          "Você é um assistente de RH especializado em análise de currículos. " +
          "Responda sempre em português brasileiro, de forma clara e objetiva.",
      },
      {
        role: "user",
        content: jsonPrompt,
      },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Resposta vazia do OpenRouter");
  }

  // Extrai JSON mesmo se vier com markdown ``` ... ```
  const cleaned = text
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "")
    .trim();

  return JSON.parse(cleaned) as T;
}

/**
 * Mantido para compatibilidade - mesmo que callGeminiJSON.
 */
export async function callGemini(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  if (!client) {
    throw new Error("OpenRouter não configurado");
  }

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: systemInstruction ?? "Você é um assistente útil.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  return completion.choices[0]?.message?.content ?? "";
}
