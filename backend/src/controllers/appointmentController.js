// =============================================================
// CONTROLLER — Appointments (MVC: Controller Layer)
// =============================================================
const { v4: uuidv4 } = require("uuid");
const db = require("../models/db");

const VALID_STATUSES = ["pending", "confirmed", "waiting", "completed", "cancelled"];

// GET /api/appointments
const getAll = (req, res) => {
  const { date, status, doctorId, patientId } = req.query;
  let list = db.getAppointments();

  // Role-based filtering (Business Logic)
  if (req.user.role === "doctor" && req.user.doctorId) list = list.filter((a) => a.doctorId === req.user.doctorId);
  if (req.user.role === "patient" && req.user.patientId) list = list.filter((a) => a.patientId === req.user.patientId);

  if (date)     list = list.filter((a) => a.date === date);
  if (status)   list = list.filter((a) => a.status === status);
  if (doctorId) list = list.filter((a) => a.doctorId === doctorId);
  if (patientId)list = list.filter((a) => a.patientId === patientId);

  // Enrich with related data
  const enriched = list.map((a) => ({
    ...a,
    patient: db.patients.find((p) => p.id === a.patientId) || null,
    doctor:  db.doctors.find((d)  => d.id === a.doctorId)  || null,
  }));

  return res.json({ success: true, total: enriched.length, data: enriched });
};

// GET /api/appointments/:id
const getOne = (req, res) => {
  const apt = db.getAppointments().find((a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ success: false, message: "Không tìm thấy lịch khám" });
  
  // Role-based access control
  if (req.user.role === "patient" && apt.patientId !== req.user.patientId) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập lịch khám này" });
  }
  
  if (req.user.role === "doctor" && apt.doctorId !== req.user.doctorId) {
    return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập lịch khám này" });
  }
  
  return res.json({
    success: true,
    data: { ...apt, patient: db.patients.find((p) => p.id === apt.patientId), doctor: db.doctors.find((d) => d.id === apt.doctorId) },
  });
};

// POST /api/appointments
const create = (req, res) => {
  const { patientId, doctorId, date, time, type, notes } = req.body;
  if (!patientId || !doctorId || !date || !time)
    return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc: patientId, doctorId, date, time" });

  const patient = db.patients.find((p) => p.id === patientId);
  const doctor  = db.doctors.find((d)  => d.id === doctorId);
  if (!patient) return res.status(404).json({ success: false, message: "Không tìm thấy bệnh nhân" });
  if (!doctor)  return res.status(404).json({ success: false, message: "Không tìm thấy bác sĩ" });
  if (!doctor.available) return res.status(400).json({ success: false, message: "Bác sĩ hiện không có lịch làm việc" });

  // Check conflict
  const conflict = db.getAppointments().find((a) => a.doctorId === doctorId && a.date === date && a.time === time && !["cancelled"].includes(a.status));
  if (conflict) return res.status(409).json({ success: false, message: `Bác sĩ đã có lịch khám lúc ${time} ngày ${date}` });

  const list = db.getAppointments();
  const newApt = {
    id: uuidv4(), code: db.generateCode("LK", list),
    patientId, doctorId, date, time,
    type: type || "Khám bệnh", status: "pending",
    fee: 250000, notes: notes || "",
    createdAt: new Date().toISOString(),
  };
  db.setAppointments([...list, newApt]);

  // Auto-create notification (Event-based pattern)
  _createNotification("reminder", "Đặt lịch thành công", `Lịch khám của ${patient.name} với ${doctor.name} lúc ${time} ngày ${date} đã được tạo.`, "SMS", null);

  return res.status(201).json({ success: true, message: "Đặt lịch khám thành công", data: { ...newApt, patient, doctor } });
};

// PATCH /api/appointments/:id/status
const updateStatus = (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status))
    return res.status(400).json({ success: false, message: `Trạng thái không hợp lệ. Hợp lệ: ${VALID_STATUSES.join(", ")}` });

  const list = db.getAppointments();
  const idx  = list.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Không tìm thấy lịch khám" });

  const updated = { ...list[idx], status, updatedAt: new Date().toISOString() };
  list[idx] = updated;
  db.setAppointments([...list]);

  return res.json({ success: true, message: `Cập nhật trạng thái thành "${status}" thành công`, data: updated });
};

// DELETE /api/appointments/:id
const remove = (req, res) => {
  const list = db.getAppointments();
  const idx  = list.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Không tìm thấy lịch khám" });
  if (list[idx].status === "completed") return res.status(400).json({ success: false, message: "Không thể xóa lịch khám đã hoàn thành" });

  list.splice(idx, 1);
  db.setAppointments([...list]);
  return res.json({ success: true, message: "Đã xóa lịch khám" });
};

// Internal helper
const _createNotification = (type, title, message, channel, targetUserId) => {
  const notifs = db.getNotifications();
  db.setNotifications([...notifs, { id: uuidv4(), type, title, message, channel, targetUserId, read: false, createdAt: new Date().toISOString() }]);
};

module.exports = { getAll, getOne, create, updateStatus, remove };
