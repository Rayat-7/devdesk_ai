import { qdrant } from "../config/qdrant.js";

async function testQdrantConnection() {
  try {
    console.log("Connecting to Qdrant...");

    const result = await qdrant.getCollections();

    console.log("Qdrant connected successfully!");

    console.log("Available collections:");

    if (result.collections.length === 0) {
      console.log("No collections found yet.");
    } else {
      console.log(result.collections);
    }
  } catch (error) {
    console.error("Qdrant connection failed:");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exitCode = 1;
  }
}

testQdrantConnection();