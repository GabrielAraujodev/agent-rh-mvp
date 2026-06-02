import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "⚠️ GEMINI_API_KEY não encontrada no .env.local. " +
      "O workflow de IA não vai funcionar até você configurar."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const MODEL_NAME = "gemini-2.0-flash"; // 📌 Free tier: 60 req/min, sem cartão

export async function callGemini(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  if (!genAI) {
    throw new Error(
      "Gemini não configurado. Coloque sua GEMINI_API_KEY no .env.local"
    );
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: {
      role: "user",
      parts: [
        {
          text:
            systemInstruction ??
            "Você é um assistente de RH especializado em análise de currículos. " +
              "Responda sempre em português brasileiro, de forma clara e objetiva.",
        },
      ],
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Chama Gemini com um schema de saída estruturado (JSON).
 * O modelo é instruído a retornar APENAS o JSON.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const text = await callGemini(
    `IMPORTANTE: Responda APENAS com um JSON válido, sem formatação markdown, sem texto extra.\n\n${prompt}`,
    systemInstruction
  );

  // Remove possíveis ```json ... ``` do output
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}
