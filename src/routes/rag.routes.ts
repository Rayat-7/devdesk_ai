import { Router } from "express";

import { askRagController } from "../controllers/rag.controller.js";
import { ingestDocumentController } from "../controllers/ingestion.controller.js";
import { uploadDocument } from "../middleware/upload.middleware.js";

const router = Router();

// Upload and index a document.
router.post(
  "/documents",
  uploadDocument,
  ingestDocumentController
);

// Ask questions using retrieved document context.
router.post("/ask", askRagController);

export default router;