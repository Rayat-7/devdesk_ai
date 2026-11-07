import { generateEmbedding } from "../services/embedding.service.js";

async function testEmbedding() {
  try {
    const sampleText =
      "Artificial intelligence helps computers understand human language.";

    console.log("Generating document embedding...");

    const passageVector = await generateEmbedding(
      sampleText,
      "passage"
    );

    console.log("Passage embedding successful!");
    console.log("Vector dimensions:", passageVector.length);
    console.log("First 5 values:", passageVector.slice(0, 5));

    console.log("\nGenerating question embedding...");

    const queryVector = await generateEmbedding(
      "How do computers understand human language?",
      "query"
    );

    console.log("Query embedding successful!");
    console.log("Vector dimensions:", queryVector.length);
    console.log("First 5 values:", queryVector.slice(0, 5));

  } catch (error) {
    console.error("Embedding test failed:");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exitCode = 1;
  }
}

testEmbedding();