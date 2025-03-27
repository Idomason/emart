import { ApiResponse, ChatRoom, Message } from "@/types";
import apiClient from "./index";

export const chatApi = {
  getChatRoom: async (orderId: string): Promise<ApiResponse<ChatRoom>> => {
    return apiClient.get(`/api/v1/chat/rooms/${orderId}`);
  },

  getMessages: async (roomId: string): Promise<ApiResponse<Message[]>> => {
    return apiClient.get(`/api/v1/chat/messages/${roomId}`);
  },

  sendMessage: async (
    roomId: string,
    content: string
  ): Promise<ApiResponse<Message>> => {
    return apiClient.post(`/api/v1/chat/messages/${roomId}`, { content });
  },

  closeChatRoom: async (roomId: string): Promise<ApiResponse<ChatRoom>> => {
    return apiClient.patch(`/api/v1/chat/rooms/${roomId}/close`);
  },
};
