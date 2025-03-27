import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import { createServer } from "http";
import { AddressInfo } from "net";
import { initializeSocket } from "../services/socketService";

let mongoServer: MongoMemoryServer;
let httpServer: any;
export let testPort: number;

beforeAll(async () => {
  // Set JWT secret for testing
  process.env.JWT_SECRET = "test-secret-key";

  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to MongoDB
  await mongoose.connect(mongoUri);

  // Create HTTP server with random port
  httpServer = createServer(app);
  initializeSocket(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(() => {
      testPort = (httpServer.address() as AddressInfo).port;
      resolve();
    });
  });
});

afterAll(async () => {
  // Disconnect from MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();

  // Close HTTP server
  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
