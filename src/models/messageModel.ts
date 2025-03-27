import mongoose from "mongoose";

interface Message {
  user: mongoose.Schema.Types.ObjectId;
  content: string;
  timestamp: Date;
}

const messageSchema = new mongoose.Schema<Message>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model<Message>("Message", messageSchema);

export default Message;
