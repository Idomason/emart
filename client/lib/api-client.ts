import { API_URL, API_ROUTES } from "./constants";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "Something went wrong");
  }

  return data;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, {
      ...defaultOptions,
      ...options,
    });

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Network error occurred");
  }
}

// Auth API methods
export const authApi = {
  login: async (email: string, password: string) =>
    apiClient(API_ROUTES.auth.login, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: async (email: string, password: string) =>
    apiClient(API_ROUTES.auth.signup, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: async () =>
    apiClient(API_ROUTES.auth.logout, {
      method: "POST",
    }),

  getProfile: async () => apiClient(API_ROUTES.auth.profile),
};

// Orders API methods
export const ordersApi = {
  list: () => apiClient(API_ROUTES.orders.list),
  myOrders: () => apiClient(API_ROUTES.orders.myOrders),
  create: (orderData: any) =>
    apiClient(API_ROUTES.orders.create, {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
  getById: (id: string) => apiClient(API_ROUTES.orders.getById(id)),
};

// Chat API methods
export const chatApi = {
  getRooms: () => apiClient(API_ROUTES.chat.rooms),
  getMessages: (roomId: string) => apiClient(API_ROUTES.chat.messages(roomId)),
};
