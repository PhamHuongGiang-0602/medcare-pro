// =============================================================
// DATA LAYER (Data-Centered Architecture)
// In-memory database — thay bằng PostgreSQL/MySQL khi production
// =============================================================
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

// ---- USERS ----
const users = [
  // Ban Giám đốc: chỉ xem báo cáo thống kê + thông báo của bản thân
  { id: "u1", username: "director",    passwordHash: bcrypt.hashSync("director123", 10),    role: "director",     name: "Giám đốc Trần Văn Bình",  email: "director@medcare.vn",  phone: "0900000001", active: true },
  // Ban Quản lý: báo cáo thống kê + thông báo của bản thân
  { id: "u7", username: "manager",     passwordHash: bcrypt.hashSync("manager123", 10),     role: "manager",      name: "Quản lý Lê Thị Hương",    email: "manager@medcare.vn",   phone: "0900000007", active: true },
  // Quản trị viên hệ thống: chỉ quản trị hệ thống + thông báo của bản thân
  { id: "u6", username: "admin",       passwordHash: bcrypt.hashSync("admin123", 10),       role: "system_admin", name: "Quản trị viên Hệ thống", email: "admin@medcare.vn",     phone: "0900000006", active: true },
  { id: "u2", username: "doctor1",    passwordHash: bcrypt.hashSync("doctor123", 10),     role: "doctor",       name: "BS. Nguyễn Văn An",   email: "an@medcare.vn",         phone: "0900000002", active: true, doctorId: "d1" },
  { id: "u3", username: "doctor2",    passwordHash: bcrypt.hashSync("doctor123", 10),     role: "doctor",       name: "BS. Trần Thị Bình",   email: "binh@medcare.vn",       phone: "0900000003", active: true, doctorId: "d2" },
  { id: "u4", username: "patient",    passwordHash: bcrypt.hashSync("patient123", 10),    role: "patient",      name: "Hoàng Thị Mai",       email: "mai@gmail.com",         phone: "0901234567", active: true, patientId: "p1" },
  { id: "u5", username: "reception",  passwordHash: bcrypt.hashSync("reception123", 10),  role: "receptionist", name: "Lễ tân Minh Châu",    email: "chau@medcare.vn",       phone: "0900000005", active: true },
];

// ---- DOCTORS ----
const doctors = [
  { id: "d1", name: "BS. Nguyễn Văn An",   specialty: "Tim mạch",         degree: "Tiến sĩ Y khoa", experience: 15, available: true,  schedule: ["08:00","09:00","10:00","14:00","15:00"], color: "#0ea5e9" },
  { id: "d2", name: "BS. Trần Thị Bình",   specialty: "Nhi khoa",         degree: "Thạc sĩ Y khoa", experience: 10, available: true,  schedule: ["08:30","09:30","11:00","13:30","16:00"], color: "#10b981" },
  { id: "d3", name: "BS. Lê Quốc Cường",   specialty: "Ngoại tổng quát", degree: "Chuyên khoa I",  experience: 12, available: false, schedule: ["08:00","10:30","14:00","15:30"],           color: "#f59e0b" },
  { id: "d4", name: "BS. Phạm Minh Đức",   specialty: "Da liễu",          degree: "Thạc sĩ Y khoa", experience: 8,  available: true,  schedule: ["09:00","10:00","11:00","14:30","16:00"], color: "#8b5cf6" },
];

// ---- PATIENTS ----
const patients = [
  { id: "p1", code: "BN001", name: "Hoàng Thị Mai",  dob: "1985-03-15", gender: "Nữ",  phone: "0901234567", email: "mai@gmail.com",  address: "Q.1, TP.HCM",         bloodType: "A+",  allergies: "Penicillin", createdAt: "2024-01-10" },
  { id: "p2", code: "BN002", name: "Nguyễn Văn Hùng", dob: "1990-07-22", gender: "Nam", phone: "0912345678", email: "hung@gmail.com", address: "Q.Bình Thạnh, TP.HCM", bloodType: "O+",  allergies: "Không",      createdAt: "2024-02-15" },
  { id: "p3", code: "BN003", name: "Lê Thị Lan",     dob: "1978-11-08", gender: "Nữ",  phone: "0923456789", email: "lan@gmail.com",  address: "Q.3, TP.HCM",         bloodType: "B+",  allergies: "Aspirin",    createdAt: "2024-03-20" },
  { id: "p4", code: "BN004", name: "Trần Quốc Bảo",  dob: "2000-01-30", gender: "Nam", phone: "0934567890", email: "bao@gmail.com",  address: "Q.7, TP.HCM",         bloodType: "AB-", allergies: "Không",      createdAt: "2024-04-05" },
];

// ---- APPOINTMENTS ----
let appointments = [
  { id: "a1", code: "LK001", patientId: "p1", doctorId: "d1", date: "2026-05-23", time: "09:00", type: "Khám định kỳ",   status: "confirmed", fee: 300000, notes: "", createdAt: "2026-05-20T10:00:00Z" },
  { id: "a2", code: "LK002", patientId: "p2", doctorId: "d2", date: "2026-05-23", time: "10:00", type: "Khám bệnh",      status: "waiting",   fee: 250000, notes: "", createdAt: "2026-05-21T08:00:00Z" },
  { id: "a3", code: "LK003", patientId: "p3", doctorId: "d4", date: "2026-05-24", time: "14:30", type: "Tái khám",       status: "pending",   fee: 200000, notes: "", createdAt: "2026-05-22T14:00:00Z" },
  { id: "a4", code: "LK004", patientId: "p4", doctorId: "d1", date: "2026-05-22", time: "08:00", type: "Khám cấp cứu",  status: "completed", fee: 500000, notes: "Cấp cứu tim mạch", createdAt: "2026-05-22T07:30:00Z" },
  { id: "a5", code: "LK005", patientId: "p1", doctorId: "d3", date: "2026-05-21", time: "10:30", type: "Khám bệnh",     status: "completed", fee: 350000, notes: "", createdAt: "2026-05-20T09:00:00Z" },
];

// ---- MEDICAL RECORDS ----
let medicalRecords = [
  {
    id: "r1", code: "HS001", appointmentId: "a4", patientId: "p4", doctorId: "d1",
    date: "2026-05-22", diagnosis: "Tăng huyết áp độ 1",
    symptoms: "Đau đầu, chóng mặt, mệt mỏi",
    prescription: [
      { drug: "Amlodipine 5mg",  dosage: "1 viên/ngày", duration: "30 ngày" },
      { drug: "Losartan 50mg",   dosage: "1 viên/ngày", duration: "30 ngày" },
    ],
    tests: [
      { name: "ECG",              result: "Bình thường" },
      { name: "Xét nghiệm máu",  result: "Cholesterol cao" },
    ],
    notes: "Hạn chế muối, tập thể dục đều đặn. Tái khám sau 1 tháng.",
    createdAt: "2026-05-22T09:30:00Z",
  },
  {
    id: "r2", code: "HS002", appointmentId: "a2", patientId: "p2", doctorId: "d2",
    date: "2026-05-23", diagnosis: "Viêm họng cấp",
    symptoms: "Đau họng, sốt nhẹ 38°C",
    prescription: [
      { drug: "Amoxicillin 500mg", dosage: "3 viên/ngày", duration: "7 ngày" },
      { drug: "Paracetamol 500mg", dosage: "Khi sốt",     duration: "5 ngày" },
    ],
    tests: [],
    notes: "Uống nhiều nước, nghỉ ngơi. Tái khám nếu không đỡ sau 3 ngày.",
    createdAt: "2026-05-23T10:30:00Z",
  },
];

// ---- INVOICES ----
let invoices = [
  { id: "i1", code: "HD001", appointmentId: "a4", patientId: "p4", date: "2026-05-22", services: [{ name: "Khám bệnh", price: 200000 }, { name: "ECG", price: 150000 }, { name: "Xét nghiệm máu", price: 150000 }], total: 500000, status: "paid",    method: "Tiền mặt",    paidAt: "2026-05-22T11:00:00Z", createdAt: "2026-05-22T10:00:00Z" },
  { id: "i2", code: "HD002", appointmentId: "a5", patientId: "p1", date: "2026-05-21", services: [{ name: "Khám bệnh", price: 200000 }, { name: "Siêu âm bụng", price: 150000 }], total: 350000, status: "paid",    method: "Chuyển khoản", paidAt: "2026-05-21T12:00:00Z", createdAt: "2026-05-21T11:00:00Z" },
  { id: "i3", code: "HD003", appointmentId: "a1", patientId: "p1", date: "2026-05-23", services: [{ name: "Khám định kỳ", price: 300000 }], total: 300000, status: "pending", method: null,            paidAt: null,                   createdAt: "2026-05-23T09:00:00Z" },
  { id: "i4", code: "HD004", appointmentId: "a2", patientId: "p2", date: "2026-05-23", services: [{ name: "Khám bệnh", price: 250000 }], total: 250000, status: "pending", method: null,            paidAt: null,                   createdAt: "2026-05-23T10:00:00Z" },
];

// ---- NOTIFICATIONS ----
let notifications = [
  { id: "n1", type: "reminder", title: "Nhắc lịch khám", message: "Bệnh nhân Hoàng Thị Mai có lịch khám lúc 09:00 hôm nay", channel: "SMS",    targetUserId: "u2", read: false, createdAt: "2026-05-23T07:00:00Z" },
  { id: "n2", type: "result",   title: "Kết quả xét nghiệm", message: "Kết quả xét nghiệm của BN Trần Quốc Bảo đã có", channel: "Email",  targetUserId: "u2", read: false, createdAt: "2026-05-23T08:30:00Z" },
  { id: "n3", type: "reminder", title: "Nhắc lịch khám", message: "Bệnh nhân Nguyễn Văn Hùng có lịch khám lúc 10:00 hôm nay", channel: "SMS", targetUserId: "u2", read: true,  createdAt: "2026-05-23T08:00:00Z" },
  { id: "n4", type: "system",   title: "Hệ thống", message: "Sao lưu dữ liệu tự động hoàn tất lúc 02:00", channel: "System", targetUserId: null,  read: true,  createdAt: "2026-05-23T02:00:00Z" },
  { id: "n5", type: "payment",  title: "Thanh toán", message: "Hóa đơn HD002 đã được thanh toán thành công", channel: "Email", targetUserId: "u4", read: true,  createdAt: "2026-05-21T12:05:00Z" },
];

// ---- HELPERS ----
const generateCode = (prefix, list) => {
  const max = list.reduce((m, item) => {
    const n = parseInt((item.code || "").replace(prefix, "")) || 0;
    return Math.max(m, n);
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
};

module.exports = {
  users, doctors, patients,
  getAppointments: () => appointments,
  setAppointments: (v) => { appointments = v; },
  getMedicalRecords: () => medicalRecords,
  setMedicalRecords: (v) => { medicalRecords = v; },
  getInvoices: () => invoices,
  setInvoices: (v) => { invoices = v; },
  getNotifications: () => notifications,
  setNotifications: (v) => { notifications = v; },
  generateCode,
};
