"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/store/features/authSlice";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuthResponse {
  success: boolean;
  data: User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  // Query to fetch current user
  useQuery<AuthResponse, Error>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        if (data.success && data.data) {
          dispatch(setUser(data.data));
        }
        return data;
      } catch (error) {
        console.error("Auth error:", error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return <>{children}</>;
}
