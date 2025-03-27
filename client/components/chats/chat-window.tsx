"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export function ChatWindow() {
  const { orderId } = useParams();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatData, isLoading } = useQuery({
    queryKey: ["chat", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/chat/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`/api/chat/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate query to refresh messages
      queryClient.invalidateQueries(["chat", orderId]);
    },
  });

  const closeChatMutation = useMutation({
    mutationFn: async (summary: string) => {
      const res = await fetch(`/api/chat/${orderId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      if (!res.ok) throw new Error("Failed to close chat");
      return res.json();
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages]);

  if (isLoading) return <div>Loading chat...</div>;

  return (
    <Card className="h-[calc(100vh-200px)]">
      <CardHeader>
        <CardTitle>Order #{orderId} Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {chatData?.messages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {!chatData?.isClosed ? (
          <div className="mt-4 space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                sendMessageMutation.mutate(formData.get("message") as string);
                e.currentTarget.reset();
              }}
            >
              <Input name="message" placeholder="Type your message..." />
              <Button type="submit" className="mt-2">
                Send
              </Button>
            </form>

            {chatData?.user.role === "admin" && (
              <div className="border-t pt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    closeChatMutation.mutate(formData.get("summary") as string);
                  }}
                >
                  <Textarea
                    name="summary"
                    placeholder="Enter chat summary..."
                    className="mb-2"
                  />
                  <Button type="submit" variant="destructive">
                    Close Chat
                  </Button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Chat Closed</h3>
            <p className="text-sm text-muted-foreground">
              Summary: {chatData?.summary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{message.user.email}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
