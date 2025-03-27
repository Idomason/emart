export type OrderStatus = "review" | "completed" | "cancelled";

export interface Order {
  _id: string;
  user: string;
  description: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  description: string;
  quantity: number;
}

export interface UpdateOrderInput {
  description?: string;
  quantity?: number;
  status?: OrderStatus;
}
