
import { Router } from "express";

import { uploadImage } from "../middleware/image-upload.middleware.js";
import { askImageController } from "../controllers/image.controller.js";

const router = Router();

router.post("/ask", uploadImage, askImageController);

export default router;
