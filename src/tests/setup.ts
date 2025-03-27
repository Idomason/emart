import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";
import { Server } from "http";
import app from "../app";
import User from "../models/userModel";
import ChatRoom from "../models/chatRoomModel";
import Order from "../models/orderModel";
import jwt from "jsonwebtoken";
import io from "socket.io-client";

// Load environment variables
dotenv.config();

const testPort = process.env.TEST_PORT || 5001;
let mongoServer: MongoMemoryServer;
let server: Server;
let userToken: string;

beforeAll(async () => {
  // Setup MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Setup HTTP server for socket tests
  server = app.listen(testPort);

  const user = await User.create({
    email: "socket@test.com",
    password: "password123",
  });

  userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  server.close();
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

beforeEach(async () => {
  // Clear users and chat rooms before each test
  await User.deleteMany({});
  await ChatRoom.deleteMany({});
});

describe("SocketService", () => {
  it("should authenticate socket connection", (done) => {
    const socket = io(`http://localhost:${testPort}`, {
      auth: { token: userToken },
    });

    socket.on("connect", () => {
      expect(socket.connected).toBe(true);
      socket.disconnect();
      done();
    });
  });
});

// Export testPort for use in socket tests
export { testPort };
