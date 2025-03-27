export interface User {
  _id: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: string | User;
  description: string;
  quantity: number;
  status: "review" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  content: string;
  user: string | User;
  chatRoom: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  _id: string;
  order: string | Order;
  messages: Message[];
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {}
