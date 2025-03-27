import app from "../../app";
import request from "supertest";

describe("getAllUsers", () => {
  it("should return all users", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(0);
  });
});
