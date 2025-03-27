"use client";

import React, { useEffect, useRef } from "react";
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
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const { user } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && socket) {
      // Join the order's chat room
      socket.emit("joinOrderRoom", order._id);

      // Listen for chat history
      socket.on("chatHistory", (history: Message[]) => {
        setMessages(history);
        scrollToBottom();
      });

      // Listen for new messages
      socket.on("newMessage", (message: Message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      // Listen for errors
      socket.on("error", (error: string) => {
        console.error("Socket error:", error);
      });
    }

    return () => {
      if (socket) {
        socket.off("chatHistory");
        socket.off("newMessage");
        socket.off("error");
      }
    };
  }, [isOpen, socket, order._id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit("sendMessage", {
        orderId: order._id,
        content: newMessage.trim(),
      });
      setNewMessage("");
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
          <DialogTitle>Order Chat - #{order._id.slice(-6)}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
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
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              Send
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
