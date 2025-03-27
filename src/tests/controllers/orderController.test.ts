import request from "supertest";
import app from "../../app";
import User from "../../models/userModel";
import Order from "../../models/orderModel";
import jwt from "jsonwebtoken";

describe("Order Controller", () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    const user = await User.create({
      email: "user@test.com",
      password: "password123",
      role: "user",
    });
    userId = user._id.toString();

    const admin = await User.create({
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    });

    userToken = jwt.sign({ id: userId }, process.env.JWT_SECRET!);
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET!);
  });

  beforeEach(async () => {
    await Order.deleteMany({});
  });

  describe("POST /api/v1/orders", () => {
    it("should create a new order", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          description: "Test order",
          specifications: "Test specs",
          quantity: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("status", "review");
    });
  });

  describe("PATCH /api/v1/orders/:id/status", () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await Order.create({
        user: userId,
        description: "Test order",
        specifications: "Test specs",
        quantity: 1,
        status: "review",
      });
      orderId = order._id.toString();
    });

    it("should update order status as admin", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "processing" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("processing");
    });

    it("should reject invalid status transition", async () => {
      const res = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "completed" });

      expect(res.status).toBe(400);
    });
  });
});
