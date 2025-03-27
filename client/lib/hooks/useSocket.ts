import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: document.cookie.replace("jwt=", ""),
        },
        path: "/socket.io",
      });

      // Handle connection errors
      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
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
