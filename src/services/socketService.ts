import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import ChatRoom from "../models/chatRoomModel";
import User from "../models/userModel";
import Order from "../models/orderModel";
import Message from "../models/messageModel";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined in environment variables");
  // Don't throw error here to allow server to start, but socket auth will fail
}

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
      credentials: true,
    },
    path: "/socket.io",
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      // Try getting token from various sources
      let token = socket.handshake.auth.token;

      // Debug: Log received token (remove in production)
      console.log(
        "Socket auth token received:",
        token ? token.substring(0, 20) + "..." : "none"
      );

      // If token is not in auth, try to get it from Authorization header
      if (!token) {
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
          console.log("Using token from Authorization header");
        }
      }

      if (!token) {
        throw new Error("Authentication error: No token provided");
      }

      // Check if JWT_SECRET is available
      if (!JWT_SECRET) {
        console.error("JWT_SECRET is not available for token verification");
        throw new Error("Server configuration error");
      }

      // Skip token verification in development mode if using a test token
      if (process.env.NODE_ENV === "development" && token === "test-token") {
        console.log("Using test token in development mode");
        const testUser = await User.findOne({ role: "user" });
        if (testUser) {
          (socket as any).data = {
            user: {
              _id: testUser._id,
              email: testUser.email,
              role: testUser.role,
            },
          };
          return next();
        }
      }

      // Handle direct user ID as fallback (only for development)
      if (
        process.env.NODE_ENV === "development" &&
        mongoose.Types.ObjectId.isValid(token)
      ) {
        console.log(
          "Using direct user ID for authentication (development only)"
        );
        const user = await User.findById(token);
        if (user) {
          (socket as any).data = {
            user: {
              _id: user._id,
              email: user.email,
              role: user.role,
            },
          };
          return next();
        }
      }

      // Make sure token doesn't have any extra data and is valid
      token = token.trim();

      // Check if token is actually a JWT token before verifying
      if (!token.match(/^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/)) {
        console.error("Malformed JWT token received:", token);
        throw new Error("Invalid token format");
      }

      try {
        console.log(
          "Attempting to verify token with JWT_SECRET:",
          JWT_SECRET ? "available" : "not available"
        );

        // Verify the token using the same format as in middlewares/auth.ts
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        if (!decoded || !decoded.id) {
          throw new Error("Invalid token payload");
        }

        const user = await User.findById(decoded.id);

        if (!user) {
          throw new Error("Authentication error: User not found");
        }

        // Attach user to socket for later use
        (socket as any).data = {
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
          },
        };

        console.log(`Socket authenticated: User ${user.email}`);
        next();
      } catch (jwtError) {
        console.error("JWT verification error:", jwtError);
        throw new Error("Invalid token");
      }
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
            ...(socket.data.user.role === "admin" ? [{ _id: orderId }] : []), // Admin can access any
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
        const chatRoom = await ChatRoom.findOne({ order: orderId }).populate({
          path: "messages",
          populate: {
            path: "user",
            select: "email role",
          },
        });

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
