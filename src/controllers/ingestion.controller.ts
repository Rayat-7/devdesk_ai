import type { Request, Response } from "express";

import {
  ingestDocument,
  DocumentIngestionError,
} from "../services/ingestion.service.js";

import { DocumentProcessingError } from "../services/document.service.js";

export async function ingestDocumentController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // 1. Check whether a file was uploaded.
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please upload a document.",
      });

      return;
    }

    // 2. Send the uploaded file to the ingestion service.
    const result = await ingestDocument({
      buffer: req.file.buffer,
      filename: req.file.originalname,
    });

    // 3. Return the indexing result.
    res.status(201).json({
      success: true,
      message: "Document uploaded and indexed successfully.",
      document: result,
    });

  } catch (error) {
    console.error("Document ingestion error:", error);

    if (
      error instanceof DocumentProcessingError ||
      error instanceof DocumentIngestionError
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });

      return;
    }

    // Embedding or Qdrant infrastructure failure.
    res.status(502).json({
      success: false,
      message: "Document indexing failed. Please try again.",
    });
  }
}