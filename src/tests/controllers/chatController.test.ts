import request from "supertest";
import app from "../../app";
import User from "../../models/userModel";

describe("Chat Controller", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/v1/auth/signup", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/v1/auth/signup").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email", "test@example.com");
    });
  });
});
