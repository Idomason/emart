import { ClosedChatsTable } from "@/components/chat/closed-chats-table";

export default function ClosedChatsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Closed Chats</h1>
      <ClosedChatsTable />
    </div>
  );
}
