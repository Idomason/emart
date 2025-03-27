import {
  ApiResponse,
  LoginCredentials,
  SignupCredentials,
  User,
} from "@/types";
import apiClient from "./index";

export const authApi = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<User>> => {
    return apiClient.post("/api/v1/auth/login", { email, password });
  },

  signup: async (
    credentials: SignupCredentials
  ): Promise<ApiResponse<User>> => {
    return apiClient.post("/api/v1/auth/signup", credentials);
  },

  logout: async (): Promise<void> => {
    return apiClient.post("/api/v1/auth/logout");
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get("/api/v1/auth/me");
  },
};
