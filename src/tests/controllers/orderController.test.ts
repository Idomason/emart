import request from "supertest";
import app from "../../app";
import User from "../../models/userModel";
import Order from "../../models/orderModel";
import ChatRoom from "../../models/chatRoomModel";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

describe("Order Controller", () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;

  beforeAll(async () => {
    // Create admin user
    const admin = await User.create({
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });
    adminId = admin._id.toString();
    adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET!);

    // Create regular user
    const user = await User.create({
      email: "user@test.com",
      password: "password123",
      role: "user",
    });
    userId = user._id.toString();
    userToken = jwt.sign({ id: userId }, process.env.JWT_SECRET!);
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await ChatRoom.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe("GET /api/v1/orders/my", () => {
    it("should return user's orders", async () => {
      const res = await request(app)
        .get("/api/v1/orders/my")
        .set("Cookie", `jwt=${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe("GET /api/v1/orders", () => {
    it("should allow admin to get all orders", async () => {
      // Create test orders
      await Order.create([
        {
          user: userId,
          description: "User order",
          quantity: 1,
          status: "review",
        },
        {
          user: adminId,
          description: "Admin order",
          quantity: 1,
          status: "review",
        },
      ]);

      const res = await request(app)
        .get("/api/v1/orders")
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it("should not allow regular users to get all orders", async () => {
      const res = await request(app)
        .get("/api/v1/orders")
        .set("Cookie", `jwt=${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/orders/:id", () => {
    let testOrder: any;

    beforeEach(async () => {
      testOrder = await Order.create({
        user: userId,
        description: "Test order",
        quantity: 1,
        status: "review",
      });
    });

    it("should allow user to get their own order", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${testOrder._id}`)
        .set("Cookie", `jwt=${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(testOrder._id.toString());
    });

    it("should allow admin to get any order", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${testOrder._id}`)
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(testOrder._id.toString());
    });

    it("should not allow user to get other users' orders", async () => {
      const otherOrder = await Order.create({
        user: adminId,
        description: "Other order",
        quantity: 1,
        status: "review",
      });

      const res = await request(app)
        .get(`/api/v1/orders/${otherOrder._id}`)
        .set("Cookie", `jwt=${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/orders/:id", () => {
    let testOrder: any;

    beforeEach(async () => {
      testOrder = await Order.create({
        user: userId,
        description: "Test order",
        quantity: 1,
        status: "review",
      });
    });

    it("should allow admin to update order status", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${testOrder._id}`)
        .set("Cookie", `jwt=${adminToken}`)
        .send({ status: "completed" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("completed");
    });

    it("should not allow regular users to update order status", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${testOrder._id}`)
        .set("Cookie", `jwt=${userToken}`)
        .send({ status: "completed" });

      expect(res.status).toBe(403);
    });

    it("should validate order status values", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${testOrder._id}`)
        .set("Cookie", `jwt=${adminToken}`)
        .send({ status: "invalid_status" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/orders/:id", () => {
    let testOrder: any;

    beforeEach(async () => {
      testOrder = await Order.create({
        user: userId,
        description: "Test order",
        quantity: 1,
        status: "review",
      });

      await ChatRoom.create({
        order: testOrder._id,
        messages: [],
      });
    });

    it("should allow admin to delete order and associated chat room", async () => {
      const res = await request(app)
        .delete(`/api/v1/orders/${testOrder._id}`)
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(200);

      // Verify deletion
      const deletedOrder = await Order.findById(testOrder._id);
      const deletedChatRoom = await ChatRoom.findOne({ order: testOrder._id });

      expect(deletedOrder).toBeNull();
      expect(deletedChatRoom).toBeNull();
    });

    it("should not allow regular users to delete orders", async () => {
      const res = await request(app)
        .delete(`/api/v1/orders/${testOrder._id}`)
        .set("Cookie", `jwt=${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
