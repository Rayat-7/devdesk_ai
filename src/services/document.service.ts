
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export class DocumentProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentProcessingError";
  }
}

export async function extractDocumentText(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const extension = filename
    .split(".")
    .pop()
    ?.toLowerCase();

  if (!buffer || buffer.length === 0) {
    throw new DocumentProcessingError("The uploaded file is empty");
  }

  switch (extension) {
    case "pdf": {
      const signature = buffer.subarray(0, 5).toString("ascii");

      if (signature !== "%PDF-") {
        throw new DocumentProcessingError("Invalid PDF file");
      }

      const parser = new PDFParse({
        data: new Uint8Array(buffer)
      });

      try {
        const result = await parser.getText();
        return result.text.trim();
      } catch {
        throw new DocumentProcessingError(
          "Could not read this PDF. It may be damaged or unsupported."
        );
      } finally {
        await parser.destroy();
      }
    }

    case "txt": {
      try {
        const text = new TextDecoder("utf-8", {
          fatal: true
        }).decode(buffer);

        return text.trim();
      } catch {
        throw new DocumentProcessingError(
          "Could not read this TXT file. Please upload a valid UTF-8 text file."
        );
      }
    }

    case "docx": {
      const signature = buffer.subarray(0, 2).toString("hex");

      if (signature !== "504b") {
        throw new DocumentProcessingError("Invalid DOCX file");
      }

      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
      } catch {
        throw new DocumentProcessingError(
          "Could not read this DOCX file. It may be damaged or invalid."
        );
      }
    }

    default:
      throw new DocumentProcessingError(
        "Unsupported document format. Use PDF, TXT or DOCX."
      );
  }
}
