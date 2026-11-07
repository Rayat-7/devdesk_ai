import { randomUUID } from "node:crypto";

import { extractDocumentText } from "./document.service.js";
import { createChunks } from "./chunk.service.js";
import {
  ensureCollectionExists,
  storeDocumentChunks,
} from "./vector.service.js";

export class DocumentIngestionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentIngestionError";
  }
}

interface IngestDocumentInput {
  buffer: Buffer;
  filename: string;
}

export async function ingestDocument({
  buffer,
  filename,
}: IngestDocumentInput) {
  // 1. Extract text from the uploaded document.
  const extractedText = await extractDocumentText(
    buffer,
    filename
  );

  if (!extractedText.trim()) {
    throw new DocumentIngestionError(
      "No readable text found in this document."
    );
  }

  // 2. Generate a unique ID for this document.
  const documentId = randomUUID();

  // 3. Divide the extracted text into chunks.
  const chunks = createChunks(extractedText);

  if (chunks.length === 0) {
    throw new DocumentIngestionError(
      "Could not generate chunks from this document."
    );
  }

  // 4. Make sure the Qdrant collection exists.
  await ensureCollectionExists();

  // 5. Generate embeddings and store the chunks.
  const storedCount = await storeDocumentChunks({
    documentId,
    filename,
    chunks,
  });

  // 6. Return document information.
  return {
    documentId,
    filename,
    totalCharacters: extractedText.length,
    totalChunks: storedCount,
    status: "indexed",
  };
}