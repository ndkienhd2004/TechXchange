import { getAxiosInstance } from "@/services/axiosConfig";

const api = () => getAxiosInstance();

export type ChatConversation = {
  peer_user_id: number;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  room_id: string;
  peer: {
    id: number;
    username: string;
    email: string;
    role: string;
  } | null;
};

export type ChatMessage = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  sent_at: string;
};

export const openStoreConversationService = async (storeId: number) => {
  const response = await api().post("/chat/open-store", { store_id: storeId });
  return response.data;
};

export const getConversationsService = async (limit = 100) => {
  const response = await api().get("/chat/conversations", {
    params: { limit },
  });
  return response.data;
};

export const getMessagesService = async (peerUserId: number, limit = 100) => {
  const response = await api().get(`/chat/messages/${peerUserId}`, {
    params: { limit },
  });
  return response.data;
};

export const sendMessageService = async (receiverId: number, message: string) => {
  const response = await api().post("/chat/messages", {
    receiver_id: receiverId,
    message,
  });
  return response.data;
};
