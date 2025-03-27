import request from "supertest";
import app from "../../app";
import User from "../../models/userModel";
import Order from "../../models/orderModel";
import ChatRoom from "../../models/chatRoomModel";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

describe("User Controller", () => {
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

  describe("GET /api/v1/users", () => {
    it("should return all users", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).not.toHaveProperty("password");
    });

    it("should require authentication", async () => {
      const res = await request(app).get("/api/v1/users");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return a specific user", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("email", "user@test.com");
      expect(res.body).not.toHaveProperty("password");
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/users/${fakeId}`)
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/users/:id", () => {
    it("should update user email", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set("Cookie", `jwt=${adminToken}`)
        .send({ email: "updated@test.com" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("email", "updated@test.com");
    });

    it("should prevent admin from removing their own admin role", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${adminId}`)
        .set("Cookie", `jwt=${adminToken}`)
        .send({ role: "user" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/cannot remove.*admin privileges/i);
    });

    it("should allow admin to change other user's role", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .set("Cookie", `jwt=${adminToken}`)
        .send({ role: "admin" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("role", "admin");
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should delete user and associated data", async () => {
      // Create test order and chat room
      const order = await Order.create({
        user: userId,
        description: "Test order",
        quantity: 1,
        specifications: "Test specs",
        status: "review",
      });

      await ChatRoom.create({
        order: order._id,
        messages: [],
      });

      const res = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);

      // Verify cascade deletion
      const deletedUser = await User.findById(userId);
      const deletedOrders = await Order.find({ user: userId });
      const deletedChatRooms = await ChatRoom.find({ order: order._id });

      expect(deletedUser).toBeNull();
      expect(deletedOrders).toHaveLength(0);
      expect(deletedChatRooms).toHaveLength(0);
    });

    it("should prevent self-deletion", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${adminId}`)
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/cannot delete.*own account/i);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/users/${fakeId}`)
        .set("Cookie", `jwt=${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
