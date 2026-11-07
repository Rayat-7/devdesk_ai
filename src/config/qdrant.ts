import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

if (!QDRANT_URL) {
  throw new Error("QDRANT_URL is missing from .env");
}

if (!QDRANT_API_KEY) {
  throw new Error("QDRANT_API_KEY is missing from .env");
}

export const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

export async function createDocumentIdIndex() {
  await qdrant.createPayloadIndex(
    "devdesk_documents",
    {
      field_name: "documentId",
      field_schema: "keyword",
      wait: true,
    }
  );

  console.log("Qdrant documentId index created successfully.");
}