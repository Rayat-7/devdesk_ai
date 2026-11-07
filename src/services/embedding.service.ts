import "dotenv/config";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;

const EMBEDDING_DIMENSIONS = 2048;

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing");
}

if (!EMBEDDING_MODEL) {
  throw new Error("EMBEDDING_MODEL is missing");
}

export type EmbeddingInputType = "passage" | "query";

export async function generateEmbedding(
  text: string,
  inputType: EmbeddingInputType
): Promise<number[]> {
  const cleanedText = text.trim();

  if (!cleanedText) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/embeddings",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "DevDesk AI",
      },

      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: cleanedText,
        input_type: inputType,
        encoding_format: "float",
      }),
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();

    throw new Error(
      `Embedding API failed (${response.status}): ${errorDetails.slice(0, 1000)}`
    );
  }

  const result = await response.json() as {
    data?: Array<{
      embedding?: number[];
      index?: number;
    }>;
  };

  const embedding = result.data?.[0]?.embedding;

  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("Invalid embedding response from OpenRouter");
  }

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS} dimensions, received ${embedding.length}`
    );
  }

  return embedding;
}