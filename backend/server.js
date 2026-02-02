const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Testing CI and CD" });
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
