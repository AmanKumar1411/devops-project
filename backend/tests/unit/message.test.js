const {
  buildEchoPayload,
  findProductById,
  getHealthStatus,
  getHelloMessage,
  getProducts,
  searchProducts,
} = require("../../utils/message");

describe("getHelloMessage", () => {
  it("returns the expected API message", () => {
    expect(getHelloMessage()).toBe("Backend workflow testing");
  });
});

describe("getHealthStatus", () => {
  it("returns healthy backend status", () => {
    expect(getHealthStatus()).toEqual({
      status: "ok",
      service: "backend",
      message: "Backend service is healthy",
    });
  });
});

describe("products helpers", () => {
  it("returns at least three products", () => {
    expect(getProducts().length).toBeGreaterThanOrEqual(3);
  });

  it("finds a product by id", () => {
    expect(findProductById(1)).toEqual(
      expect.objectContaining({ id: 1, name: "Premium Wireless Headphones" })
    );
  });

  it("filters products by search query", () => {
    const filtered = searchProducts("cotton");
    expect(filtered).toEqual([
      expect.objectContaining({ name: "Organic Cotton T-Shirt" }),
    ]);
  });
});

describe("buildEchoPayload", () => {
  it("returns the received payload with timestamp", () => {
    const payload = { action: "ping" };
    const result = buildEchoPayload(payload);
    expect(result).toEqual({
      received: payload,
      receivedAt: expect.any(String),
    });
  });
});
