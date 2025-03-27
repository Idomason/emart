import { ApiResponse, Order } from "@/types";
import apiClient from "./index";

export const ordersApi = {
  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    return apiClient.get("/api/v1/orders/my");
  },

  getAllOrders: async (): Promise<ApiResponse<Order[]>> => {
    return apiClient.get("/api/v1/orders");
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return apiClient.get(`/api/v1/orders/${id}`);
  },

  createOrder: async (
    data: Pick<Order, "description" | "quantity">
  ): Promise<ApiResponse<Order>> => {
    return apiClient.post("/api/v1/orders", data);
  },

  updateOrderStatus: async (
    id: string,
    status: Order["status"]
  ): Promise<ApiResponse<Order>> => {
    return apiClient.patch(`/api/v1/orders/${id}`, { status });
  },

  deleteOrder: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/api/v1/orders/${id}`);
  },
};
