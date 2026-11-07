import { createChunks } from "../services/chunk.service.js";

const sampleText = "A".repeat(2500);

const chunks = createChunks(sampleText);

console.log("Total chunks:", chunks.length);

chunks.forEach((chunk) => {
  console.log("\n------------------------");
  console.log("Chunk index:", chunk.chunkIndex);
  console.log("Content length:", chunk.content.length);
  console.log("Content:", chunk.content);
});