const request = require("supertest");
const app = require("../../app");

describe("GET /api/hello", () => {
  it("responds with 200 and message payload", async () => {
    const response = await request(app).get("/api/hello");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Backend workflow testing" });
  });
});
