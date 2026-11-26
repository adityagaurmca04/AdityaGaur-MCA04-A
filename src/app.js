const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const { notFound, errorHandler } = require("./middleware/errors");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.get("/", (req, res) => {
  res.json({ message: "Student Management API is running" });
});
app.use((req, res, next) => {
  if (req.body === undefined) {
    req.body = {};
    return next();
  }
  if (req.body === null || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ message: "Request body must be a JSON object" });
  }
  return next();
});
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
