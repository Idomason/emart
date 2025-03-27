import request from "supertest";
import app from "../../app";
import User from "../../models/userModel";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

describe("Auth Controller", () => {
  const testUser = {
    email: "test@example.com",
    password: "password123",
    role: "user",
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/v1/auth/signup", () => {
    it("should create a new user", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email", testUser.email);
      expect(res.body.data).toHaveProperty("role", testUser.role);
      expect(res.body.data).not.toHaveProperty("password");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should validate required fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it("should not allow duplicate email", async () => {
      await User.create(testUser);
      const res = await request(app).post("/api/v1/auth/signup").send(testUser);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await User.create(testUser);
    });

    it("should login with correct credentials", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email", testUser.email);
      expect(res.body.data).not.toHaveProperty("password");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should not login with incorrect password", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should not login with non-existent email", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "nonexistent@example.com",
        password: testUser.password,
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should clear jwt cookie", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", "jwt=test-token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["set-cookie"][0]).toContain("jwt=;");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    let userToken: string;

    beforeEach(async () => {
      const user = await User.create(testUser);
      userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
    });

    it("should return user data when authenticated", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", `jwt=${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email", testUser.email);
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should return 404 for non-existent user", async () => {
      await User.deleteMany({});
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", `jwt=${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should require authentication", async () => {
      const res = await request(app).get("/api/v1/auth/me");

      expect(res.status).toBe(401);
    });
  });
});
