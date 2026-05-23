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
router.get ("/patients",     authenticate, authorize("admin","doctor","receptionist"), patients.getAll);
router.get ("/patients/:id", authenticate, patients.getOne);

// ---- Doctors ----
router.get ("/doctors",              authenticate, doctors.getAll);
router.get ("/doctors/:id/schedule", authenticate, doctors.getSchedule);

// ---- Appointments ----
router.get   ("/appointments",           authenticate, apt.getAll);
router.get   ("/appointments/:id",       authenticate, apt.getOne);
router.post  ("/appointments",           authenticate, apt.create);
router.patch ("/appointments/:id/status",authenticate, authorize("admin","doctor","receptionist"), apt.updateStatus);
router.delete("/appointments/:id",       authenticate, authorize("admin","receptionist"), apt.remove);

// ---- Medical Records ----
router.get ("/records",     authenticate, medicalRecords.getAll);
router.get ("/records/:id", authenticate, medicalRecords.getOne);
router.post("/records",     authenticate, authorize("admin","doctor"), medicalRecords.create);

// ---- Invoices ----
router.get  ("/invoices",          authenticate, invoices.getAll);
router.patch("/invoices/:id/pay",  authenticate, authorize("admin","receptionist"), invoices.pay);

// ---- Notifications ----
router.get  ("/notifications",            authenticate, notifications.getAll);
router.patch("/notifications/:id/read",   authenticate, notifications.markRead);
router.patch("/notifications/read-all",   authenticate, notifications.markAllRead);
router.post ("/notifications",            authenticate, authorize("admin"), notifications.send);

// ---- Reports ----
router.get("/reports/summary", authenticate, authorize("admin","doctor"), reports.getSummary);

// ---- Users (Admin) ----
router.get("/users", authenticate, authorize("admin"), usersCtrl.getAll);

// ---- Health check ----
router.get("/health", (req, res) => res.json({ status: "ok", service: "MedCare Pro API", timestamp: new Date().toISOString() }));

module.exports = router;
