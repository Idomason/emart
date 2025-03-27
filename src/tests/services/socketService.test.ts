import { io as Client, Socket } from "socket.io-client";
import { createServer } from "http";
import { AddressInfo } from "net";
import app from "../../app";
import User from "../../models/userModel";
import Order from "../../models/orderModel";
import ChatRoom from "../../models/chatRoomModel";
import MessageModel from "../../models/messageModel";
import jwt from "jsonwebtoken";
import { initializeSocket } from "../../services/socketService";

// Define socket data interface
interface SocketData {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

// Define message interface
interface Message {
  content: string;
  user: {
    _id: string;
  };
}

// Define error interface
interface SocketError {
  message: string;
}

// Extend Socket type to include data property
interface CustomSocket extends Socket {
  data: SocketData;
}

describe("SocketService", () => {
  let httpServer: any;
  let port: number;
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;
  let testOrder: any;
  let testChatRoom: any;
  let sockets: CustomSocket[] = [];

  beforeAll(async () => {
    // Set JWT secret for testing
    process.env.JWT_SECRET = "test-secret-key";

    // Create test users
    const user = await User.create({
      email: "socket@test.com",
      password: "password123",
      role: "user",
    });
    userId = user._id.toString();
    userToken = jwt.sign({ id: userId }, process.env.JWT_SECRET);

    const admin = await User.create({
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });
    adminId = admin._id.toString();
    adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET);

    // Create test order and chat room
    testOrder = await Order.create({
      user: userId,
      description: "Test order",
      quantity: 1,
      status: "review",
    });

    testChatRoom = await ChatRoom.create({
      order: testOrder._id,
      messages: [],
    });

    // Create HTTP server and initialize socket
    httpServer = createServer(app);
    initializeSocket(httpServer);
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Disconnect all sockets
    await Promise.all(
      sockets.map((socket) => {
        if (socket.connected) {
          return new Promise<void>((resolve) => {
            socket.disconnect();
            resolve();
          });
        }
      })
    );
    sockets = [];

    // Clean up database
    await Promise.all([
      User.deleteMany({}),
      Order.deleteMany({}),
      ChatRoom.deleteMany({}),
      MessageModel.deleteMany({}),
    ]);

    // Close server
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });

  beforeEach(async () => {
    // Clear messages
    await Promise.all([
      MessageModel.deleteMany({}),
      ChatRoom.updateMany({}, { $set: { messages: [] } }),
    ]);

    // Disconnect all sockets
    await Promise.all(
      sockets.map((socket) => {
        if (socket.connected) {
          return new Promise<void>((resolve) => {
            socket.disconnect();
            resolve();
          });
        }
      })
    );
    sockets = [];
  });

  const createSocket = (token?: string) => {
    const socket = Client(`http://localhost:${port}`, {
      auth: token ? { token } : {},
      timeout: 10000,
      transports: ["websocket"],
      reconnection: false,
      forceNew: true,
      autoConnect: true,
      path: "/socket.io",
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    }) as CustomSocket;

    sockets.push(socket);
    return socket;
  };

  const waitForEvent = <T>(
    socket: CustomSocket,
    event: string,
    timeout = 10000
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${event}`));
      }, timeout);

      socket.once(event, (data) => {
        clearTimeout(timer);
        resolve(data as T);
      });

      socket.once("connect_error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  };

  describe("Authentication", () => {
    it("should authenticate socket connection with valid token", async () => {
      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      expect(socket.connected).toBe(true);
      expect((socket as any).data.user).toBeDefined();
      expect((socket as any).data.user._id).toBe(userId);
      socket.disconnect();
    });

    it("should reject connection with invalid token", async () => {
      const socket = createSocket("invalid-token");
      const error = await waitForEvent<SocketError>(socket, "connect_error");

      expect(error.message).toBe("Authentication failed");
      socket.disconnect();
    });

    it("should reject connection without token", async () => {
      const socket = createSocket();
      const error = await waitForEvent<SocketError>(socket, "connect_error");

      expect(error.message).toBe("Authentication failed");
      socket.disconnect();
    });
  });

  describe("Order Room Management", () => {
    it("should allow user to join their own order room", async () => {
      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      socket.emit("joinOrderRoom", testOrder._id.toString());
      const messages = await waitForEvent(socket, "chatHistory");

      expect(Array.isArray(messages)).toBe(true);
      socket.disconnect();
    });

    it("should allow admin to join any order room", async () => {
      const socket = createSocket(adminToken);
      await waitForEvent(socket, "connect");

      socket.emit("joinOrderRoom", testOrder._id.toString());
      const messages = await waitForEvent(socket, "chatHistory");

      expect(Array.isArray(messages)).toBe(true);
      socket.disconnect();
    });

    it("should prevent user from joining other user's order room", async () => {
      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      socket.emit("joinOrderRoom", "invalid-order-id");
      const error = await waitForEvent<string>(socket, "error");

      expect(error).toBe("Order not found or access denied");
      socket.disconnect();
    });
  });

  describe("Message Handling", () => {
    it("should allow user to send message in their order room", async () => {
      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      socket.emit("joinOrderRoom", testOrder._id.toString());
      await waitForEvent(socket, "chatHistory");

      socket.emit("sendMessage", {
        orderId: testOrder._id.toString(),
        content: "Test message",
      });

      const message = await waitForEvent<Message>(socket, "newMessage");
      expect(message.content).toBe("Test message");
      expect(message.user._id).toBe(userId);
      socket.disconnect();
    });

    it("should not allow sending empty messages", async () => {
      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      socket.emit("joinOrderRoom", testOrder._id.toString());
      await waitForEvent(socket, "chatHistory");

      socket.emit("sendMessage", {
        orderId: testOrder._id.toString(),
        content: "   ",
      });

      const error = await waitForEvent<string>(socket, "error");
      expect(error).toBe("Message cannot be empty");
      socket.disconnect();
    });

    it("should persist messages in database", async () => {
      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      socket.emit("joinOrderRoom", testOrder._id.toString());
      await waitForEvent(socket, "chatHistory");

      socket.emit("sendMessage", {
        orderId: testOrder._id.toString(),
        content: "Persistent message",
      });

      await waitForEvent(socket, "newMessage");

      const chatRoom = await ChatRoom.findOne({
        order: testOrder._id,
      }).populate("messages");

      expect(chatRoom?.messages.length).toBeGreaterThan(0);
      const firstMessage = chatRoom?.messages[0] as any;
      expect(firstMessage.content).toBe("Persistent message");
      socket.disconnect();
    });

    it("should broadcast messages to all users in the room", async () => {
      const userSocket = createSocket(userToken);
      const adminSocket = createSocket(adminToken);

      await Promise.all([
        waitForEvent(userSocket, "connect"),
        waitForEvent(adminSocket, "connect"),
      ]);

      userSocket.emit("joinOrderRoom", testOrder._id.toString());
      adminSocket.emit("joinOrderRoom", testOrder._id.toString());

      await Promise.all([
        waitForEvent(userSocket, "chatHistory"),
        waitForEvent(adminSocket, "chatHistory"),
      ]);

      const messagePromise = Promise.all([
        waitForEvent<Message>(adminSocket, "newMessage"),
        waitForEvent<Message>(userSocket, "newMessage"),
      ]);

      userSocket.emit("sendMessage", {
        orderId: testOrder._id.toString(),
        content: "Broadcast test",
      });

      const [adminMessage, userMessage] = await messagePromise;
      expect(adminMessage.content).toBe("Broadcast test");
      expect(userMessage.content).toBe("Broadcast test");

      userSocket.disconnect();
      adminSocket.disconnect();
    });
  });

  describe("Error Handling", () => {
    it("should handle disconnection gracefully", async () => {
      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      socket.disconnect();
      expect(socket.connected).toBe(false);
    });

    it("should handle invalid order ID format", async () => {
      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      socket.emit("joinOrderRoom", "invalid-id");
      const error = await waitForEvent<string>(socket, "error");

      expect(error).toBe("Order not found or access denied");
      socket.disconnect();
    });

    it("should handle closed chat rooms", async () => {
      await ChatRoom.findByIdAndUpdate(testChatRoom._id, { isClosed: true });

      const socket = createSocket(userToken);
      await waitForEvent(socket, "connect");

      socket.emit("joinOrderRoom", testOrder._id.toString());
      await waitForEvent(socket, "chatHistory");

      socket.emit("sendMessage", {
        orderId: testOrder._id.toString(),
        content: "Test message",
      });

      const error = await waitForEvent<string>(socket, "error");
      expect(error).toBe("Chat room is closed");
      socket.disconnect();
    });
  });
});
