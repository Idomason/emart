import { CreateOrderInput, Order, UpdateOrderInput } from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const ordersApi = {
  getMyOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/api/v1/orders/my-orders`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch orders");
    }

    return response.json();
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/api/v1/orders`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch orders");
    }

    return response.json();
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await fetch(`${API_URL}/api/v1/orders/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch order");
    }

    return response.json();
  },

  createOrder: async (data: CreateOrderInput): Promise<Order> => {
    const response = await fetch(`${API_URL}/api/v1/orders`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create order");
    }

    return response.json();
  },

  updateOrder: async (id: string, data: UpdateOrderInput): Promise<Order> => {
    const response = await fetch(`${API_URL}/api/v1/orders/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order");
    }

    return response.json();
  },

  updateOrderStatus: async (
    id: string,
    status: Order["status"]
  ): Promise<Order> => {
    const response = await fetch(`${API_URL}/api/v1/orders/${id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order status");
    }

    return response.json();
  },

  deleteOrder: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/v1/orders/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete order");
    }
  },
};
