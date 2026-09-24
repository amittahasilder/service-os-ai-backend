const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");

const app = express();

// =====================================
// SECURITY
// =====================================

app.use(helmet());

// =====================================
// CORS
// =====================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// =====================================
// BODY PARSER
// =====================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// COOKIE
// =====================================

app.use(cookieParser());

// =====================================
// API ROUTES
// =====================================

app.use("/api/auth", authRoutes);

// =====================================
// HEALTH CHECK
// =====================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ServiceOS API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// =====================================
// ROOT
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to ServiceOS API 🚀",
  });
});

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;