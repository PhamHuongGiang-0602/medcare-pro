// =============================================================
// ROUTES — REST API (MVC: View Layer for API)
// Base: /api
// =============================================================
const express  = require("express");
const router   = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { login, getMe }            = require("../controllers/authController");
const apt                         = require("../controllers/appointmentController");
const { patients, doctors, medicalRecords, invoices, notifications, reports, usersCtrl } = require("../controllers/index");

// ---- Auth ----
router.post("/auth/login", login);
router.get ("/auth/me",    authenticate, getMe);

// ---- Patients ----
// Bác sĩ và lễ tân có thể xem danh sách bệnh nhân (để hỗ trợ xem lịch khám/thanh toán)
router.get ("/patients",     authenticate, authorize("doctor","receptionist"), patients.getAll);
router.get ("/patients/:id", authenticate, patients.getOne);

// ---- Doctors ----
router.get ("/doctors",              authenticate, doctors.getAll);
router.get ("/doctors/:id/schedule", authenticate, doctors.getSchedule);

// ---- Appointments ----
// Xem lịch khám: bác sĩ, lễ tân, bệnh nhân (bệnh nhân chỉ xem của bản thân — lọc trong controller)
router.get   ("/appointments",           authenticate, authorize("doctor","receptionist","patient"), apt.getAll);
router.get   ("/appointments/:id",       authenticate, authorize("doctor","receptionist","patient"), apt.getOne);
// Đặt lịch: chỉ bệnh nhân
router.post  ("/appointments",           authenticate, authorize("patient"), apt.create);
// Cập nhật trạng thái: bác sĩ, lễ tân
router.patch ("/appointments/:id/status",authenticate, authorize("doctor","receptionist"), apt.updateStatus);
// Xóa lịch: lễ tân
router.delete("/appointments/:id",       authenticate, authorize("receptionist"), apt.remove);

// ---- Medical Records ----
// Xem hồ sơ bệnh án: bác sĩ, bệnh nhân (bệnh nhân chỉ xem của bản thân — lọc trong controller)
router.get ("/records",     authenticate, authorize("doctor","patient"), medicalRecords.getAll);
router.get ("/records/:id", authenticate, authorize("doctor","patient"), medicalRecords.getOne);
// Tạo hồ sơ: chỉ bác sĩ
router.post("/records",     authenticate, authorize("doctor"), medicalRecords.create);

// ---- Invoices ----
// Xem hóa đơn: bệnh nhân (chỉ của bản thân), bác sĩ và lễ tân (để xử lý thanh toán)
router.get  ("/invoices",          authenticate, authorize("patient","doctor","receptionist"), invoices.getAll);
// Thanh toán: bác sĩ, lễ tân
router.patch("/invoices/:id/pay",  authenticate, authorize("doctor","receptionist"), invoices.pay);

// ---- Notifications ----
// Tất cả các vai trò chỉ nhận thông báo của bản thân (lọc trong controller)
router.get  ("/notifications",            authenticate, notifications.getAll);
router.patch("/notifications/:id/read",   authenticate, notifications.markRead);
router.patch("/notifications/read-all",   authenticate, notifications.markAllRead);
// Gửi thông báo: chỉ ban giám đốc (admin trong bảng = "director" role ánh xạ thành "admin")
router.post ("/notifications",            authenticate, authorize("director"), notifications.send);

// ---- Reports ----
// Báo cáo thống kê: chỉ Ban Giám đốc (admin/director)
router.get("/reports/summary", authenticate, authorize("director", "manager"), reports.getSummary);

// ---- Users / System Admin ----
// Quản trị hệ thống: chỉ Quản trị viên (admin_system — role "admin_system" hoặc "superadmin")
// Trong hệ thống hiện tại dùng role "admin" cho Ban Giám đốc,
// nên tách Quản trị viên thành role "system_admin"
router.get   ("/users",        authenticate, authorize("system_admin"), usersCtrl.getAll);
router.post  ("/users",        authenticate, authorize("system_admin"), usersCtrl.create);
router.patch ("/users/:id",    authenticate, authorize("system_admin"), usersCtrl.update);
router.delete("/users/:id",    authenticate, authorize("system_admin"), usersCtrl.remove);

// ---- Health check ----
router.get("/health", (req, res) => res.json({ status: "ok", service: "MedCare Pro API", timestamp: new Date().toISOString() }));

module.exports = router;
