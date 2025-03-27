import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import ChatRoom from "../models/chatRoomModel";
import User from "../models/userModel";
import Order from "../models/orderModel";
import Message from "../models/messageModel";

const JWT_SECRET = process.env.JWT_SECRET!;

// Extend Express Request interface to include io
declare global {
  namespace Express {
    interface Request {
      io?: SocketServer;
    }
  }
}

export const initializeSocket = (server: HttpServer) => {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        throw new Error("Authentication error: No token provided");
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error("Authentication error: User not found");
      }

      // Attach user to socket for later use
      socket.data.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(
      `New connection: ${socket.id} (User: ${socket.data.user.email})`
    );

    // Join order-specific room
    socket.on("joinOrderRoom", async (orderId: string) => {
      try {
        // Verify user has access to this order
        const order = await Order.findOne({
          _id: orderId,
          $or: [
            { user: socket.data.user._id }, // Order owner
            ...(socket.data.user.role === "admin" ? [{}] : []), // Admin can access any
          ],
        });

        if (!order) {
          throw new Error("Order not found or access denied");
        }

        socket.join(`order_${orderId}`);
        console.log(
          `User ${socket.data.user.email} joined order room ${orderId}`
        );

        // Send chat history
        const chatRoom = await ChatRoom.findOne({ order: orderId }).populate(
          "messages.user",
          "email role"
        );

        if (chatRoom) {
          socket.emit("chatHistory", chatRoom.messages);
        }
      } catch (error) {
        console.error("Join order room error:", error);
        socket.emit(
          "error",
          error instanceof Error ? error.message : "Failed to join room"
        );
      }
    });

    // Handle new messages
    socket.on(
      "sendMessage",
      async ({ orderId, content }: { orderId: string; content: string }) => {
        try {
          if (!content.trim()) {
            throw new Error("Message cannot be empty");
          }

          // Verify chat room exists and is open
          const chatRoom = await ChatRoom.findOne({ order: orderId });
          if (!chatRoom) {
            throw new Error("Chat room not found");
          }

          if (chatRoom.isClosed) {
            throw new Error("Chat room is closed");
          }

          // Create new message
          const newMessage = await Message.create({
            user: socket.data.user._id,
            content: content.trim(),
            timestamp: new Date(),
          });

          // Save to database
          chatRoom.messages.push(newMessage._id);
          await chatRoom.save();

          // Broadcast to all in the order room (including sender)
          const populatedMessage = {
            ...newMessage.toObject(),
            user: {
              _id: socket.data.user._id,
              email: socket.data.user.email,
              role: socket.data.user.role,
            },
          };

          io.to(`order_${orderId}`).emit("newMessage", populatedMessage);
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit(
            "error",
            error instanceof Error ? error.message : "Failed to send message"
          );
        }
      }
    );

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user.email}`);
    });

    // Error handling
    socket.on("error", (error: Error) => {
      console.error("Socket error:", error);
    });
  });

  // Attach io to app for use in controllers
  return io;
};

// Utility function to emit events from controllers
export const notifyOrderUpdate = (
  io: SocketServer | undefined,
  orderId: string,
  event: string,
  data: any
) => {
  if (io) {
    io.to(`order_${orderId}`).emit(event, data);
  }
};
