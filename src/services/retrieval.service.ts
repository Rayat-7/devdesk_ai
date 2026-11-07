
import { qdrant } from "../config/qdrant.js";
import { generateEmbedding } from "./embedding.service.js";
import { COLLECTION_NAME } from "./vector.service.js";

export interface RetrievedChunk {
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  score: number;
}

export async function searchSimilarChunks(
  question: string,
  limit: number = 5,
  documentId?: string
): Promise<RetrievedChunk[]> {
  const cleanedQuestion = question.trim();

  if (!cleanedQuestion) {
    throw new Error("Search question cannot be empty.");
  }

  if (documentId !== undefined && !documentId.trim()) {
    throw new Error("Document ID cannot be empty.");
  }

  // Step 1: Convert the question into a vector.
  const queryVector = await generateEmbedding(
    cleanedQuestion,
    "query"
  );

  // Step 2: Build the Qdrant search options.
  const searchOptions = {
    query: queryVector,
    limit,
    with_payload: true,

    ...(documentId !== undefined
      ? {
          filter: {
            must: [
              {
                key: "documentId",
                match: {
                  value: documentId.trim(),
                },
              },
            ],
          },
        }
      : {}),
  };

  // Step 3: Search Qdrant.
  const searchResult = await qdrant.query(
    COLLECTION_NAME,
    searchOptions
  );

  // Step 4: Extract original text and metadata.
  return searchResult.points.map((point) => {
    const payload = point.payload ?? {};

    return {
      documentId: String(payload.documentId ?? ""),
      filename: String(payload.filename ?? ""),
      chunkIndex: Number(payload.chunkIndex ?? -1),
      content: String(payload.content ?? ""),
      score: point.score,
    };
  });
}
