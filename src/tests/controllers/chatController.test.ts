import request from "supertest";
import app from "../../app";
import User from "../../models/userModel";
import Order from "../../models/orderModel";
import ChatRoom from "../../models/chatRoomModel";
import jwt from "jsonwebtoken";

describe("Chat Controller", () => {
  let userToken: string;
  let adminToken: string;
  let orderId: string;
  let chatRoomId: string;

  beforeAll(async () => {
    const user = await User.create({
      email: "user@test.com",
      password: "password123",
      role: "user",
    });

    const admin = await User.create({
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET!);

    const order = await Order.create({
      user: user._id,
      description: "Test order",
      specifications: "Test specs",
      quantity: 1,
      status: "review",
    });
    orderId = order._id.toString();

    const chatRoom = await ChatRoom.create({
      order: orderId,
      messages: [],
    });
    chatRoomId = chatRoom._id.toString();
  });

  beforeEach(async () => {
    await ChatRoom.updateOne(
      { _id: chatRoomId },
      { isClosed: false, summary: "" }
    );
  });

  describe("POST /api/v1/chats/:orderId/close", () => {
    it("should close chat room as admin", async () => {
      const res = await request(app)
        .post(`/api/v1/chats/${orderId}/close`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ summary: "Issue resolved" });

      expect(res.status).toBe(200);
      expect(res.body.isClosed).toBe(true);
      expect(res.body.summary).toBe("Issue resolved");
    });

    it("should reject non-admin users", async () => {
      const res = await request(app)
        .post(`/api/v1/chats/${orderId}/close`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ summary: "Issue resolved" });

      expect(res.status).toBe(403);
    });
  });
});
