import { getAxiosInstance } from "@/services/axiosConfig";

const api = () => getAxiosInstance();

export type AssistantConversation = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

export type AssistantMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  citations_json?: Array<{
    title?: string;
    uri?: string;
  }>;
};

export const getAssistantConversationsService = async (limit = 20) => {
  const response = await api().get("/assistant/conversations", { params: { limit } });
  return response.data;
};

export const getAssistantMessagesService = async (conversationId: number, limit = 50) => {
  const response = await api().get(`/assistant/messages/${conversationId}`, {
    params: { limit },
  });
  return response.data;
};

export const sendAssistantMessageService = async (
  message: string,
  conversationId?: number | null,
  locale = "vi-VN",
) => {
  const response = await api().post("/assistant/chat", {
    message,
    conversation_id: conversationId || null,
    locale,
  });
  return response.data;
};
