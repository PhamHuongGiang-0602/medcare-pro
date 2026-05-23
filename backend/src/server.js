// =============================================================
// SERVER — Express.js Entry Point
// Architecture: Client-Server + MVC
// Security: Helmet, Rate Limiting, CORS, JWT
// =============================================================
const express     = require("express");
const cors        = require("cors");
const helmet      = require("helmet");
const morgan      = require("morgan");
const rateLimit   = require("express-rate-limit");
const routes      = require("./routes");

const app  = express();
const PORT = process.env.PORT || 4000;

// ---- Security Middleware (Bảo mật) ----
app.use(helmet());                          // HTTP security headers
app.use(cors({ origin: "*", methods: ["GET","POST","PATCH","DELETE","PUT"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100, message: { success: false, message: "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." } }));  // 100 req/min

// ---- General Middleware ----
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- API Routes ----
app.use("/api", routes);

// ---- 404 Handler ----
app.use((req, res) => res.status(404).json({ success: false, message: `Endpoint không tồn tại: ${req.method} ${req.originalUrl}` }));

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Lỗi máy chủ nội bộ" });
});

// ---- Start ----
app.listen(PORT, () => {
  console.log(`\n🏥 MedCare Pro API Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Running on: http://localhost:${PORT}`);
  console.log(`📋 API Docs:   http://localhost:${PORT}/api/health`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\nTest login:\n  POST http://localhost:${PORT}/api/auth/login`);
  console.log(`  Body: { "username": "admin", "password": "admin123" }\n`);
});

module.exports = app;
