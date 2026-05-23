// =============================================================
// CONTROLLERS — Patients, Doctors, Records, Invoices, Notifications, Reports
// =============================================================
const { v4: uuidv4 } = require("uuid");
const db = require("../models/db");

// ============================================================
// PATIENTS
// ============================================================
const patients = {
  getAll: (req, res) => {
    let list = db.patients;
    const { q } = req.query;
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q));
    return res.json({ success: true, total: list.length, data: list });
  },
  getOne: (req, res) => {
    const p = db.patients.find((p) => p.id === req.params.id);
    if (!p) return res.status(404).json({ success: false, message: "Không tìm thấy bệnh nhân" });
    // If user is a patient, they can only access their own data
    if (req.user.role === "patient" && req.user.patientId !== p.id) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập thông tin bệnh nhân này" });
    }
    const records = db.getMedicalRecords().filter((r) => r.patientId === p.id);
    const apts    = db.getAppointments().filter((a) => a.patientId === p.id);
    const invs    = db.getInvoices().filter((i) => i.patientId === p.id);
    return res.json({ success: true, data: { ...p, medicalRecords: records, appointments: apts, invoices: invs } });
  },
};

// ============================================================
// DOCTORS
// ============================================================
const doctors = {
  getAll: (req, res) => {
    const { specialty, available } = req.query;
    let list = db.doctors;
    if (specialty) list = list.filter((d) => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
    if (available !== undefined) list = list.filter((d) => d.available === (available === "true"));
    return res.json({ success: true, total: list.length, data: list });
  },
  getSchedule: (req, res) => {
    const { date } = req.query;
    const doc = db.doctors.find((d) => d.id === req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Không tìm thấy bác sĩ" });
    const bookedSlots = db.getAppointments().filter((a) => a.doctorId === req.params.id && a.date === date && !["cancelled"].includes(a.status)).map((a) => a.time);
    const schedule = doc.schedule.map((t) => ({ time: t, available: !bookedSlots.includes(t) }));
    return res.json({ success: true, data: { doctor: doc, date, schedule } });
  },
};

// ============================================================
// MEDICAL RECORDS
// ============================================================
const medicalRecords = {
  getAll: (req, res) => {
    const { patientId } = req.query;
    let list = db.getMedicalRecords();
    if (req.user.role === "patient" && req.user.patientId) list = list.filter((r) => r.patientId === req.user.patientId);
    else if (patientId) list = list.filter((r) => r.patientId === patientId);
    const enriched = list.map((r) => ({
      ...r,
      patient: db.patients.find((p) => p.id === r.patientId),
      doctor:  db.doctors.find((d)  => d.id === r.doctorId),
    }));
    return res.json({ success: true, total: enriched.length, data: enriched });
  },
  getOne: (req, res) => {
    const r = db.getMedicalRecords().find((r) => r.id === req.params.id);
    if (!r) return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ bệnh án" });
    return res.json({ success: true, data: { ...r, patient: db.patients.find((p) => p.id === r.patientId), doctor: db.doctors.find((d) => d.id === r.doctorId) } });
  },
  create: (req, res) => {
    const { appointmentId, patientId, diagnosis, symptoms, prescription, tests, notes } = req.body;
    if (!patientId || !diagnosis)
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc: patientId, diagnosis" });

    const list = db.getMedicalRecords();
    const record = {
      id: uuidv4(), code: db.generateCode("HS", list),
      appointmentId: appointmentId || null,
      patientId, doctorId: req.user.doctorId || "d1",
      date: new Date().toISOString().split("T")[0],
      diagnosis, symptoms: symptoms || "",
      prescription: prescription || [],
      tests: tests || [],
      notes: notes || "",
      createdAt: new Date().toISOString(),
    };
    db.setMedicalRecords([...list, record]);

    // Mark appointment completed
    if (appointmentId) {
      const apts = db.getAppointments();
      const idx  = apts.findIndex((a) => a.id === appointmentId);
      if (idx !== -1) { apts[idx].status = "completed"; db.setAppointments([...apts]); }
    }
    return res.status(201).json({ success: true, message: "Tạo hồ sơ bệnh án thành công", data: record });
  },
};

// ============================================================
// INVOICES
// ============================================================
const invoices = {
  getAll: (req, res) => {
    let list = db.getInvoices();
    const { status, patientId } = req.query;
    if (req.user.role === "patient" && req.user.patientId) list = list.filter((i) => i.patientId === req.user.patientId);
    else if (patientId) list = list.filter((i) => i.patientId === patientId);
    if (status) list = list.filter((i) => i.status === status);
    const enriched = list.map((i) => ({ ...i, patient: db.patients.find((p) => p.id === i.patientId) }));
    return res.json({ success: true, total: enriched.length, data: enriched });
  },
  pay: (req, res) => {
    const { method } = req.body;
    if (!["Tiền mặt", "Chuyển khoản", "Thẻ", "QR"].includes(method))
      return res.status(400).json({ success: false, message: "Phương thức thanh toán không hợp lệ" });

    const list = db.getInvoices();
    const idx  = list.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
    if (list[idx].status === "paid") return res.status(400).json({ success: false, message: "Hóa đơn đã được thanh toán" });

    list[idx] = { ...list[idx], status: "paid", method, paidAt: new Date().toISOString() };
    db.setInvoices([...list]);
    return res.json({ success: true, message: "Thanh toán thành công", data: list[idx] });
  },
};

// ============================================================
// NOTIFICATIONS (Event-based Service)
// ============================================================
const notifications = {
  getAll: (req, res) => {
    let list = db.getNotifications();
    if (req.user.role !== "admin") list = list.filter((n) => n.targetUserId === req.user.id || n.targetUserId === null);
    const { unread } = req.query;
    if (unread === "true") list = list.filter((n) => !n.read);
    return res.json({ success: true, unreadCount: list.filter((n) => !n.read).length, total: list.length, data: list });
  },
  markRead: (req, res) => {
    const list = db.getNotifications();
    const idx  = list.findIndex((n) => n.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });
    list[idx] = { ...list[idx], read: true };
    db.setNotifications([...list]);
    return res.json({ success: true, message: "Đã đánh dấu đã đọc" });
  },
  markAllRead: (req, res) => {
    const list = db.getNotifications().map((n) =>
      n.targetUserId === req.user.id || n.targetUserId === null ? { ...n, read: true } : n
    );
    db.setNotifications(list);
    return res.json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
  },
  send: (req, res) => {
    const { type, title, message, channel, targetUserId } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: "Thiếu title hoặc message" });
    const notifs = db.getNotifications();
    const n = { id: uuidv4(), type: type || "system", title, message, channel: channel || "System", targetUserId: targetUserId || null, read: false, createdAt: new Date().toISOString() };
    db.setNotifications([...notifs, n]);
    return res.status(201).json({ success: true, message: "Gửi thông báo thành công", data: n });
  },
};

// ============================================================
// REPORTS (Admin only)
// ============================================================
const reports = {
  getSummary: (req, res) => {
    const apts  = db.getAppointments();
    const invs  = db.getInvoices();
    const today = new Date().toISOString().split("T")[0];

    const totalRevenue = invs.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
    const pendingRevenue = invs.filter((i) => i.status === "pending").reduce((s, i) => s + i.total, 0);
    const todayApts = apts.filter((a) => a.date === today);

    const bySpecialty = db.doctors.map((d) => ({
      specialty: d.specialty,
      doctorName: d.name,
      count: apts.filter((a) => a.doctorId === d.id && a.status === "completed").length,
    }));

    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const m = new Date(2026, 4 - i, 1);
      const label = `T${m.getMonth() + 1}`;
      return { month: label, revenue: Math.floor(Math.random() * 30 + 40), patients: Math.floor(Math.random() * 50 + 110) };
    }).reverse();

    return res.json({
      success: true,
      data: {
        summary: {
          totalPatients: db.patients.length,
          totalDoctors: db.doctors.length,
          totalAppointments: apts.length,
          todayAppointments: todayApts.length,
          completedToday: todayApts.filter((a) => a.status === "completed").length,
          waitingToday: todayApts.filter((a) => a.status === "waiting").length,
          totalRevenue, pendingRevenue,
        },
        bySpecialty,
        revenueByMonth,
      },
    });
  },
};

// ============================================================
// USERS (Admin)
// ============================================================
const usersCtrl = {
  getAll: (req, res) => {
    const { users } = db;
    return res.json({ success: true, data: users.map(({ passwordHash, ...u }) => u) });
  },
};

module.exports = { patients, doctors, medicalRecords, invoices, notifications, reports, usersCtrl };
