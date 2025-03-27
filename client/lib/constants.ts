export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const API_ROUTES = {
  auth: {
    login: `${API_URL}/api/v1/auth/login`,
    signup: `${API_URL}/api/v1/auth/signup`,
    logout: `${API_URL}/api/v1/auth/logout`,
    profile: `${API_URL}/api/v1/auth/profile`,
  },
  orders: {
    list: `${API_URL}/api/v1/orders`,
    myOrders: `${API_URL}/api/v1/orders/my`,
    create: `${API_URL}/api/v1/orders`,
    getById: (id: string) => `${API_URL}/api/v1/orders/${id}`,
  },
  chat: {
    rooms: `${API_URL}/api/v1/chat/rooms`,
    messages: (roomId: string) =>
      `${API_URL}/api/v1/chat/rooms/${roomId}/messages`,
  },
};
