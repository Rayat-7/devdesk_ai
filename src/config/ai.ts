import OpenAI from "openai";
import "dotenv/config";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing");
}

if (!process.env.OPENROUTER_MODEL) {
  throw new Error("OPENROUTER_MODEL is missing");
}

export const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",

  apiKey: process.env.OPENROUTER_API_KEY,

  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "DevDesk AI"
  }
});

export const AI_MODEL = process.env.OPENROUTER_MODEL;