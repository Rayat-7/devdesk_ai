import { uploadDocument } from "../middleware/upload.middleware.js";

import { askDocumentController } from "../controllers/document.controller.js";
import { Router } from "express";

const router = Router();

router.post(
  "/ask",
  uploadDocument,
  askDocumentController
);

export default router;