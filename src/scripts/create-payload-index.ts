import { createDocumentIdIndex } from "../config/qdrant.js";

async function main() {
  try {
    await createDocumentIdIndex();
    console.log("Index setup completed.");
  } catch (error) {
    console.error("Index creation failed:");
    console.dir(error, { depth: 10 });
    process.exitCode = 1;
  }
}

main();