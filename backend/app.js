const express = require("express");
const cors = require("cors");
const {
  buildEchoPayload,
  findProductById,
  getHealthStatus,
  getHelloMessage,
  getServerTime,
  searchProducts,
} = require("./utils/message");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running. Try /api/hello");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: getHelloMessage() });
});

app.get("/api/health", (req, res) => {
  res.json(getHealthStatus());
});

app.get("/api/time", (req, res) => {
  res.json(getServerTime());
});

app.get("/api/products", (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search : "";
  res.json({ products: searchProducts(search) });
});

app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const product = findProductById(id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  return res.json({ product });
});

app.post("/api/echo", (req, res) => {
  res.json(buildEchoPayload(req.body || {}));
});

module.exports = app;
