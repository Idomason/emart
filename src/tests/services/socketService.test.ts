import { io as Client } from "socket.io-client";
import User from "../../models/userModel";
import jwt from "jsonwebtoken";
import { testPort } from "../setup";

describe("SocketService", () => {
  let userToken: string;

  beforeAll(async () => {
    const user = await User.create({
      email: "socket@test.com",
      password: "password123",
      role: "user",
    });

    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
  });

  it("should authenticate socket connection", (done) => {
    const socket = Client(`http://localhost:${testPort}`, {
      auth: { token: userToken },
    });

    socket.on("connect", () => {
      expect(socket.connected).toBe(true);
      socket.disconnect();
      done();
    });
  });

  it("should reject invalid token", (done) => {
    const socket = Client(`http://localhost:${testPort}`, {
      auth: { token: "invalid-token" },
    });

    socket.on("connect_error", (error) => {
      expect(error.message).toBe("Authentication failed");
      socket.disconnect();
      done();
    });
  });
});
