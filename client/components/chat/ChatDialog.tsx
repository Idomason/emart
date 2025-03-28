"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/lib/hooks/useSocket";
import { Order } from "@/types/order";
import { useAuth } from "@/lib/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  _id: string;
  content: string;
  user: {
    _id: string;
    email: string;
  };
  createdAt: string;
}

interface ChatDialogProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatDialog({ order, isOpen, onClose }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) {
      console.log("No socket connection available");
      return;
    }

    if (isOpen && socket) {
      // Handle connection events
      const handleConnect = () => {
        console.log("Socket connected successfully");
        setIsConnected(true);

        // Join the order's chat room after confirming connection
        socket.emit("joinOrderRoom", order._id);
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      };

      const handleConnectError = (error: Error) => {
        console.error("Socket connection error:", error);
        toast({
          title: "Connection Error",
          description:
            "Failed to connect to chat server. Please try again later.",
          variant: "destructive",
        });
        setIsConnected(false);
      };

      // Listen for chat history
      const handleChatHistory = (history: Message[]) => {
        console.log("Received chat history:", history);
        setMessages(history);
      };

      // Listen for new messages
      const handleNewMessage = (message: Message) => {
        console.log("Received new message:", message);
        setMessages((prev) => [...prev, message]);
      };

      // Listen for errors
      const handleError = (error: string) => {
        console.error("Socket error:", error);
        toast({
          title: "Chat Error",
          description: error || "An error occurred in the chat",
          variant: "destructive",
        });
      };

      // Set up event listeners
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);
      socket.on("chatHistory", handleChatHistory);
      socket.on("newMessage", handleNewMessage);
      socket.on("error", handleError);

      // If already connected, manually emit join event
      if (socket.connected) {
        console.log("Socket already connected, joining room");
        setIsConnected(true);
        socket.emit("joinOrderRoom", order._id);
      }

      // Cleanup event listeners
      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
        socket.off("chatHistory", handleChatHistory);
        socket.off("newMessage", handleNewMessage);
        socket.off("error", handleError);
      };
    }
  }, [isOpen, socket, order._id, toast]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && isConnected) {
      socket.emit("sendMessage", {
        orderId: order._id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } else if (!isConnected) {
      toast({
        title: "Not Connected",
        description:
          "Unable to send message. Please wait for connection or refresh.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order Chat - #{order._id.slice(-6)}
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex gap-2 ${
                      message.user._id === user?._id ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(message.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[80%] ${
                        message.user._id === user?._id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No messages yet. Start the conversation!
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={!isConnected}
            />
            <Button type="submit" disabled={!isConnected || !newMessage.trim()}>
              Send
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
