import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api-client/orders";
import { Order } from "@/types";

export const useMyOrders = () => {
  return useQuery({
    queryKey: ["orders", "my"],
    queryFn: async () => {
      const response = await ordersApi.getMyOrders();
      return response.data;
    },
  });
};

export const useAllOrders = () => {
  return useQuery({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      const response = await ordersApi.getAllOrders();
      return response.data;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const response = await ordersApi.getOrder(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Pick<Order, "description" | "quantity">) => {
      const response = await ordersApi.createOrder(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Order["status"];
    }) => {
      const response = await ordersApi.updateOrderStatus(id, status);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.setQueryData(["orders", data._id], data);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.deleteOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.removeQueries({ queryKey: ["orders", id] });
    },
  });
};
