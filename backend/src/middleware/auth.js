// =============================================================
// MIDDLEWARE — Authentication & Authorization (Security Layer)
// Implements: JWT Auth + RBAC (Role-Based Access Control)
// =============================================================
const jwt = require("jsonwebtoken");
const { users } = require("../models/db");

const JWT_SECRET = process.env.JWT_SECRET || "medcare-secret-key-change-in-production";
const JWT_EXPIRES = "24h";

// ---- Generate token ----
const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ---- Verify token middleware ----
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Không có token xác thực" });
  }
  try {
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id && u.active);
    if (!user) return res.status(401).json({ success: false, message: "Tài khoản không hợp lệ hoặc bị vô hiệu hóa" });
    req.user = { id: user.id, username: user.username, role: user.role, name: user.name, doctorId: user.doctorId, patientId: user.patientId };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// ---- Role check middleware factory ----
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Bạn không có quyền truy cập. Yêu cầu vai trò: ${roles.join(", ")}` });
  }
  next();
};

module.exports = { generateToken, authenticate, authorize };
