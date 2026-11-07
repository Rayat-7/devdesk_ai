import type { Request, Response } from "express";
import { z } from "zod";
import { ai, AI_MODEL } from "../config/ai.js";

import {
  getHistory,
  saveMessage
} from "../services/memory.service.js";

const chatSchema = z.object({
  sessionId: z.string().min(1).max(100),
  message: z.string().trim().min(1).max(4000)
});

export const chatController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = chatSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request"
      });
    }

    const { sessionId, message } = result.data;

    // Get previous conversation
    const history = getHistory(sessionId);

    // Add the new user message
    const messages = [
      {
        role: "system" as const,
        content: "You are DevDesk AI, a helpful technical assistant."
      },
      ...history,
      {
        role: "user" as const,
        content: message
      }
    ];

    // Ask the AI
    const completion = await ai.chat.completions.create({
      model: AI_MODEL,
      messages ,
      stream: false
    });

    const reply =
      completion.choices[0]?.message?.content;

    if (typeof reply !== "string") {
      return res.status(502).json({
        success: false,
        message: "The AI returned an empty response."
      });
    }

    // Save both messages
    saveMessage(sessionId, {
      role: "user",
      content: message
    });

    saveMessage(sessionId, {
      role: "assistant",
      content: reply
    });

    return res.status(200).json({
      success: true,
      sessionId,
      reply
    });

  } catch (error) {
    console.error("Chat request failed:", error);

    return res.status(502).json({
      success: false,
      message: "AI request failed"
    });
  }
};




export const chatStreamController = async (
  req: Request,
  res: Response
) => {
  try {
    // 1. Validate incoming data
    const result = chatSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request"
      });
    }

    const { sessionId, message } = result.data;

    // 2. Retrieve previous conversation
    const history = getHistory(sessionId);

    // 3. Prepare conversation context
    const messages = [
      {
        role: "system" as const,
        content: "You are DevDesk AI, a helpful technical assistant."
      },
      ...history,
      {
        role: "user" as const,
        content: message
      }
    ];

    // 4. Configure Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    // 5. Request a streaming response
    const stream = await ai.chat.completions.create({
      model: AI_MODEL,
      messages,
      stream: true
    });

    let fullReply = "";

    // 6. Read arriving chunks
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;

      if (typeof content === "string" && content.length > 0) {
        fullReply += content;

        // Send each chunk to the client
        res.write(
          `data: ${JSON.stringify({ content })}\n\n`
        );
      }
    }

    // 7. Save conversation after completion
    saveMessage(sessionId, {
      role: "user",
      content: message
    });

    saveMessage(sessionId, {
      role: "assistant",
      content: fullReply
    });

    // 8. Notify client that streaming is finished
    res.write(
      `data: ${JSON.stringify({ done: true })}\n\n`
    );

    res.end();

  } catch (error) {
    console.error("Streaming error:", error);

    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({
          error: "AI streaming failed"
        })}\n\n`
      );

      res.end();
    } else {
      res.status(502).json({
        success: false,
        message: "AI provider request failed"
      });
    }
  }
};
