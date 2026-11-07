import { randomUUID } from "node:crypto";
import { qdrant } from "../config/qdrant.js";
import { generateEmbedding } from "./embedding.service.js";
import type { DocumentChunk } from "./chunk.service.js";

export const COLLECTION_NAME = "devdesk_documents";

const VECTOR_SIZE = 2048;

export interface StoreDocumentInput {
  documentId: string;
  filename: string;
  chunks: DocumentChunk[];
}

export async function ensureCollectionExists(): Promise<void> {
  const result = await qdrant.getCollections();

  const collectionExists = result.collections.some(
    (collection) => collection.name === COLLECTION_NAME
  );

  if (collectionExists) {
    console.log(`Collection "${COLLECTION_NAME}" already exists.`);
    return;
  }

  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: {
      size: VECTOR_SIZE,
      distance: "Cosine",
    },
  });

  console.log(`Collection "${COLLECTION_NAME}" created.`);
}

export async function storeDocumentChunks(
  input: StoreDocumentInput
): Promise<number> {
  const { documentId, filename, chunks } = input;

  if (chunks.length === 0) {
    throw new Error("No chunks provided for storage.");
  }

  const points = [];

  for (const chunk of chunks) {
    console.log(`Embedding chunk ${chunk.chunkIndex}...`);

    const embedding = await generateEmbedding(
      chunk.content,
      "passage"
    );

    points.push({
      id: randomUUID(),

      vector: embedding,

      payload: {
        documentId,
        filename,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
      },
    });
  }

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });

  return points.length;
}