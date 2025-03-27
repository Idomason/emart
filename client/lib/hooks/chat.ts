import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api-client/chat";

export const useChatRoom = (orderId: string) => {
  return useQuery({
    queryKey: ["chatRoom", orderId],
    queryFn: async () => {
      const response = await chatApi.getChatRoom(orderId);
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const useMessages = (roomId: string) => {
  return useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const response = await chatApi.getMessages(roomId);
      return response.data;
    },
    enabled: !!roomId,
    refetchInterval: 3000, // Poll every 3 seconds
  });
};

export const useSendMessage = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await chatApi.sendMessage(roomId, content);
      return response.data;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(["messages", roomId], (oldMessages: any) => {
        return oldMessages ? [...oldMessages, newMessage] : [newMessage];
      });
    },
  });
};

export const useCloseChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.closeChatRoom,
    onSuccess: (response) => {
      const chatRoom = response.data;
      queryClient.setQueryData(["chatRoom", chatRoom._id], chatRoom);
    },
  });
};
