
import type { Request, Response } from "express";
import { z } from "zod";
import { generateRagAnswer } from "../services/rag.service.js";

const questionSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  documentId: z.string().uuid().optional(),
});

export async function askRagController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validation = questionSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid question.",
        errors: validation.error.flatten(),
      });
      return;
    }

    const { question, documentId } = validation.data;

    const result = await generateRagAnswer(question, documentId);

    res.status(200).json({
      success: true,
      question,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error("RAG controller error:", error);
    res.status(502).json({
      success: false,
      message: "Failed to generate an answer using RAG.",
    });
  }
}
