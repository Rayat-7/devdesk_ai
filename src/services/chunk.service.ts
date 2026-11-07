export interface DocumentChunk {
  chunkIndex: number;
  content: string;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

export function createChunks(
  text: string
): DocumentChunk[] {
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (!cleanedText) {
    return [];
  }

  const chunks: DocumentChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(
      start + CHUNK_SIZE,
      cleanedText.length
    );

    const content = cleanedText
      .slice(start, end)
      .trim();

    if (content) {
      chunks.push({
        chunkIndex,
        content,
      });

      chunkIndex++;
    }

    if (end === cleanedText.length) {
      break;
    }

    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}