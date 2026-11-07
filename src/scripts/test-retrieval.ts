
import { searchSimilarChunks } from "../services/retrieval.service.js";

async function testRetrieval() {
  try {
    const documentId =
      "747835b1-0e18-4ec5-a2ba-db283baee669";

    const question =
      "10 Ω ও 15 Ω এর দুটি রোধ সমান্তরালে যুক্ত থাকলে তুল্য রোধ কত?";

    console.log("User question:", question);
    console.log("Target document ID:", documentId);
    console.log("\nSearching document-specific chunks...\n");

    const results = await searchSimilarChunks(
      question,
      5,
      documentId
    );

    if (results.length === 0) {
      throw new Error(
        "No matching chunks found in the selected document."
      );
    }

    // Verify document isolation.
    const incorrectChunks = results.filter(
      (chunk) => chunk.documentId !== documentId
    );

    if (incorrectChunks.length > 0) {
      throw new Error(
        "Document isolation failed! Results contain chunks from another document."
      );
    }

    console.log("Document isolation: PASSED");
    console.log(`Retrieved ${results.length} chunks.`);

    results.forEach((chunk, index) => {
      console.log("\n================================");
      console.log(`Result ${index + 1}`);
      console.log("================================");

      console.log("Filename:", chunk.filename);
      console.log("Document ID:", chunk.documentId);
      console.log("Chunk index:", chunk.chunkIndex);
      console.log("Similarity score:", chunk.score);
      console.log("Content:", chunk.content);
    });

    const expectedAnswerFound = results.some(
      (chunk) => /6\s*Ω/.test(chunk.content)
    );

    console.log("\n================================");
    console.log("FINAL TEST RESULTS");
    console.log("================================");

    console.log("Document isolation: PASSED");
    console.log(
      "Expected answer (6 Ω) found:",
      expectedAnswerFound ? "YES" : "NOT FOUND"
    );

      } catch (error) {
    console.error("\nRetrieval test failed:");

    console.dir(error, { depth: 10 });

    if (error instanceof Error) {
      console.log("\nError name:", error.name);
      console.log("Error message:", error.message);
      console.log("Error stack:", error.stack);
    }

    if (error && typeof error === "object") {
      const qdrantError = error as {
        getActualType?: () => unknown;
        data?: unknown;
        status?: number;
      };

      console.log("\nError properties:");
      console.log(Object.getOwnPropertyNames(error));

      if (typeof qdrantError.getActualType === "function") {
        console.log("\nQdrant API error details:");
        console.dir(qdrantError.getActualType(), { depth: 10 });
      }

      console.log("\nError data:", qdrantError.data);
      console.log("Error status:", qdrantError.status);
    }

    process.exitCode = 1;
  }}
testRetrieval();
