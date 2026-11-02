
import { Router } from "express";

import {
  chatController,
  chatStreamController
} from "../controllers/chat.controller.js";

const router = Router();

// Normal AI response
router.post("/", chatController);

// Streaming AI response
router.post("/stream", chatStreamController);

export default router;
