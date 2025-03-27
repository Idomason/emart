import request from "supertest";
import app from "../../app";
import User from "../../models/userModel";

describe("Auth Controller", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/v1/auth/signup", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("email", "test@example.com");
    });

    it("should fail with duplicate email", async () => {
      await User.create({
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      const res = await request(app).post("/api/v1/auth/signup").send({
        email: "test@example.com",
        password: "password123",
        role: "user",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await User.create({
        email: "test@example.com",
        password: "password123",
        role: "user",
      });
    });

    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("email", "test@example.com");
    });

    it("should fail with invalid password", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });
  });
});
