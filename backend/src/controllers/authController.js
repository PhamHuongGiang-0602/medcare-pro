// =============================================================
// CONTROLLER — Auth (MVC: Controller Layer)
// =============================================================
const bcrypt = require("bcryptjs");
const { users } = require("../models/db");
const { generateToken } = require("../middleware/auth");

// POST /api/auth/login
const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: "Vui lòng nhập tên đăng nhập và mật khẩu" });

  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng" });

  if (!user.active)
    return res.status(403).json({ success: false, message: "Tài khoản đã bị vô hiệu hóa" });

  const token = generateToken(user);
  return res.json({
    success: true,
    message: "Đăng nhập thành công",
    data: {
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role, email: user.email, phone: user.phone, doctorId: user.doctorId || null, patientId: user.patientId || null },
    },
  });
};

// GET /api/auth/me
const getMe = (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
  return res.json({
    success: true,
    data: { id: user.id, username: user.username, name: user.name, role: user.role, email: user.email, phone: user.phone },
  });
};

module.exports = { login, getMe };
