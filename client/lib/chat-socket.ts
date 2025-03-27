import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useChatSocket(orderId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "joinOrder", orderId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chatClosed") {
        queryClient.invalidateQueries(["chat", orderId]);
      }
    };

    return () => {
      ws.close();
    };
  }, [orderId, queryClient]);
}
