import { apiFetch } from "./client";

export interface ChatSummary {
  id: string;
  title: string;
  unitCode: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function getStudentChats(): Promise<ChatSummary[]> {
  return apiFetch<ChatSummary[]>("/students/me/chats");
}

export function createStudentChat(unitCode: string): Promise<ChatSummary> {
  return apiFetch<ChatSummary>("/students/me/chats", {
    method: "POST",
    body: JSON.stringify({ unitCode }),
  });
}

export function sendChatMessage(
  chatId: string,
  content: string,
  unitCode: string,
): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(`/students/me/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, unitCode }),
  });
}
