const express = require("express");
const cors = require("cors");
const { getHelloMessage } = require("./utils/message");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: getHelloMessage() });
});

module.exports = app;
