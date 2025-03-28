import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api-client/orders";
import { Order } from "@/types";

export const useMyOrders = () => {
  return useQuery({
    queryKey: ["orders", "my"],
    queryFn: async () => {
      return ordersApi.getMyOrders();
    },
    refetchInterval: 3000,
  });
};

export const useAllOrders = () => {
  return useQuery({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      return ordersApi.getAllOrders();
    },
    refetchInterval: 3000,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      return ordersApi.getOrder(id);
    },
    enabled: !!id,
    refetchInterval: 3000,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Pick<Order, "description" | "quantity">) => {
      return ordersApi.createOrder(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      queryClient.setQueryData(
        ["orders", "my"],
        (oldData: Order[] | undefined) => {
          return oldData ? [data, ...oldData] : [data];
        }
      );
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  // 123Bamidele*

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Order["status"];
    }) => {
      return ordersApi.updateOrderStatus(id, status);
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
