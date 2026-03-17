const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

module.exports = { PORT };
