"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";

export function ClosedChatsTable() {
  const { data: closedChats, isLoading } = useQuery({
    queryKey: ["closedChats"],
    queryFn: async () => {
      const res = await fetch("/api/chat/closed");
      if (!res.ok) throw new Error("Failed to fetch closed chats");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading closed chats...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead>Closed At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {closedChats?.map((chat) => (
          <TableRow key={chat._id}>
            <TableCell>{chat.order._id}</TableCell>
            <TableCell>{chat.order.description}</TableCell>
            <TableCell>{chat.order.status}</TableCell>
            <TableCell>{chat.summary}</TableCell>
            <TableCell>
              {new Date(chat.updatedAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
