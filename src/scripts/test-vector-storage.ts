import { randomUUID } from "node:crypto";

import { createChunks } from "../services/chunk.service.js";

import {
  ensureCollectionExists,
  storeDocumentChunks,
  COLLECTION_NAME,
} from "../services/vector.service.js";

async function testVectorStorage() {
  try {
    console.log("Preparing document...");

    const sampleText = `
      Artificial Intelligence is transforming modern software development.

      Large Language Models can understand and generate human language.
      However, they do not automatically know private information
      stored inside a user's documents.

      Retrieval-Augmented Generation solves this problem by retrieving
      relevant information from external knowledge sources before
      generating an answer.

      Embeddings represent the semantic meaning of text as numerical
      vectors. These vectors can be compared to find related content.

      Vector databases store embeddings and allow similarity searches.
      Qdrant is one example of a vector database.

      Chunking divides large documents into smaller sections.
      Each section can be embedded and stored independently.
    `.repeat(15);

    const chunks = createChunks(sampleText);

    console.log("Total chunks generated:", chunks.length);

    console.log("\nChecking Qdrant collection...");

    await ensureCollectionExists();

    console.log("\nStoring document chunks...");

    const documentId = randomUUID();

    const storedCount = await storeDocumentChunks({
      documentId,
      filename: "rag-test-document.txt",
      chunks,
    });

    console.log("\nStorage successful!");

    console.log("Document ID:", documentId);
    console.log("Collection:", COLLECTION_NAME);
    console.log("Chunks stored:", storedCount);

    const countResult = await qdrantCount();

    console.log("Total points in collection:", countResult);

  } catch (error) {
    console.error("Vector storage test failed:");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exitCode = 1;
  }
}

async function qdrantCount(): Promise<number> {
  const { qdrant } = await import("../config/qdrant.js");

  const result = await qdrant.count(COLLECTION_NAME, {
    exact: true,
  });

  return result.count;
}

testVectorStorage();