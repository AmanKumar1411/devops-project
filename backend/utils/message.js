function getHelloMessage() {
  return "Backend workflow testing";
}

function getHealthStatus() {
  return {
    status: "ok",
    service: "backend",
    message: "Backend service is healthy",
  };
}

function getServerTime() {
  return {
    isoTime: new Date().toISOString(),
  };
}

function getProducts() {
  return [
    { id: 1, name: "Premium Wireless Headphones", price: 129.99 },
    { id: 2, name: "Organic Cotton T-Shirt", price: 29.5 },
    { id: 3, name: "Ergonomic Office Chair", price: 249.0 },
  ];
}

function findProductById(id) {
  return getProducts().find((product) => product.id === id) || null;
}

function searchProducts(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return getProducts();
  }

  return getProducts().filter((product) =>
    product.name.toLowerCase().includes(normalized)
  );
}

function buildEchoPayload(body) {
  return {
    received: body,
    receivedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildEchoPayload,
  findProductById,
  getHealthStatus,
  getHelloMessage,
  getProducts,
  getServerTime,
  searchProducts,
};
