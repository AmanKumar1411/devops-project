const request = require("supertest");
const app = require("../../app");

describe("Backend multi API integration", () => {
  it("returns health payload", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "backend",
      message: "Backend service is healthy",
    });
  });

  it("returns server time", async () => {
    const response = await request(app).get("/api/time");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      isoTime: expect.any(String),
    });
  });

  it("returns product collection", async () => {
    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.products.length).toBeGreaterThanOrEqual(3);
  });

  it("filters products by query", async () => {
    const response = await request(app).get("/api/products?search=headphones");

    expect(response.status).toBe(200);
    expect(response.body.products).toEqual([
      expect.objectContaining({ name: "Premium Wireless Headphones" }),
    ]);
  });

  it("returns product details for valid id", async () => {
    const response = await request(app).get("/api/products/2");

    expect(response.status).toBe(200);
    expect(response.body.product).toEqual(
      expect.objectContaining({ id: 2, name: "Organic Cotton T-Shirt" })
    );
  });

  it("returns 404 for unknown product id", async () => {
    const response = await request(app).get("/api/products/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Product not found" });
  });

  it("echoes posted payload", async () => {
    const response = await request(app)
      .post("/api/echo")
      .send({ source: "integration-test", ok: true });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      received: { source: "integration-test", ok: true },
      receivedAt: expect.any(String),
    });
  });
});
