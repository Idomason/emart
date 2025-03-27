import mongoose from "mongoose";

interface ChatRoom {
  order: mongoose.Types.ObjectId;
  isClosed: boolean;
  summary?: string;
  messages: mongoose.Types.ObjectId[];
}

const chatRoomSchema = new mongoose.Schema<ChatRoom>({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    unique: true,
  },
  isClosed: {
    type: Boolean,
    default: false,
  },
  summary: {
    type: String,
    default: "",
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
});

const ChatRoom = mongoose.model<ChatRoom>("ChatRoom", chatRoomSchema);

export default ChatRoom;
