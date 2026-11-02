import type { ChatCompletionMessageParam } from "openai/resources/index";

const conversations = new Map<
  string,
  ChatCompletionMessageParam[]
>();

export function getHistory(sessionId: string) {
  return conversations.get(sessionId) || [];
}

export function saveMessage(
  sessionId: string,
  message: ChatCompletionMessageParam
) {
  const history = getHistory(sessionId);

  history.push(message);

  // Keep only the latest 20 messages
  conversations.set(sessionId, history.slice(-20));
}