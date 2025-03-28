import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper function to extract token from cookies with better error handling
const getTokenFromCookie = (): string | null => {
  try {
    if (!document.cookie) {
      console.error("No cookies found at all");
      return null;
    }

    const cookies = document.cookie.split(";");

    // First try to find the socket_token cookie which should be JS-accessible
    let tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("socket_token=")
    );

    if (tokenCookie) {
      console.log("Found socket_token cookie:", tokenCookie);
      return tokenCookie.trim().substring("socket_token=".length);
    }

    // Fallback to looking for the jwt cookie
    tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("jwt="));

    if (!tokenCookie) {
      console.error("No auth token cookies found");
      return null;
    }

    console.log("Found jwt cookie:", tokenCookie);
    return tokenCookie.trim().substring("jwt=".length);
  } catch (error) {
    console.error("Error extracting token from cookies:", error);
    return null;
  }
};

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user) {
      // Get the token from cookies
      const token = getTokenFromCookie();

      if (!token) {
        console.error("No token found in cookies");

        // Try to get token from localStorage as fallback if available
        const localToken =
          localStorage.getItem("jwt") || localStorage.getItem("socket_token");
        if (localToken) {
          console.log("Found token in localStorage instead");
          initializeSocket(localToken);
          return;
        }

        // Store user object ID as last resort for testing
        if (user._id) {
          console.log("Using user ID as fallback for socket auth");
          initializeSocket(user._id);
          return;
        }

        console.error("No token available for socket authentication");
        return;
      }

      initializeSocket(token);
    }

    function initializeSocket(token: string) {
      console.log(
        "Initializing socket with token:",
        token.substring(0, 10) + "..."
      );

      // Initialize socket connection with the token
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        path: "/socket.io",
      });

      // Handle connection errors
      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Debug connection
      socketRef.current.on("connect", () => {
        console.log("Socket connected successfully");
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return socketRef.current;
};
