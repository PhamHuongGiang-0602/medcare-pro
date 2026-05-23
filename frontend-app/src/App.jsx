import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ============================================================
// MOCK DATA (Data Layer - Data-Centered Architecture)
// ============================================================
const MOCK_DOCTORS = [
  { id: 1, name: "BS. Nguyễn Văn An", specialty: "Tim mạch", avatar: "NVA", color: "#0ea5e9", available: true, schedule: ["08:00","09:00","10:00","14:00","15:00"] },
  { id: 2, name: "BS. Trần Thị Bình", specialty: "Nhi khoa", avatar: "TTB", color: "#10b981", available: true, schedule: ["08:30","09:30","11:00","13:30","16:00"] },
  { id: 3, name: "BS. Lê Quốc Cường", specialty: "Ngoại tổng quát", avatar: "LQC", color: "#f59e0b", available: false, schedule: ["08:00","10:30","14:00","15:30"] },
  { id: 4, name: "BS. Phạm Minh Đức", specialty: "Da liễu", avatar: "PMD", color: "#8b5cf6", available: true, schedule: ["09:00","10:00","11:00","14:30","16:00"] },
];

const MOCK_PATIENTS = [
  { id: "BN001", name: "Hoàng Thị Mai", dob: "1985-03-15", gender: "Nữ", phone: "0901234567", address: "Q.1, TP.HCM", bloodType: "A+", allergies: "Penicillin" },
  { id: "BN002", name: "Nguyễn Văn Hùng", dob: "1990-07-22", gender: "Nam", phone: "0912345678", address: "Q.Bình Thạnh, TP.HCM", bloodType: "O+", allergies: "Không" },
  { id: "BN003", name: "Lê Thị Lan", dob: "1978-11-08", gender: "Nữ", phone: "0923456789", address: "Q.3, TP.HCM", bloodType: "B+", allergies: "Aspirin" },
  { id: "BN004", name: "Trần Quốc Bảo", dob: "2000-01-30", gender: "Nam", phone: "0934567890", address: "Q.7, TP.HCM", bloodType: "AB-", allergies: "Không" },
];

const MOCK_APPOINTMENTS = [
  { id: "LK001", patientId: "BN001", patientName: "Hoàng Thị Mai", doctorId: 1, doctorName: "BS. Nguyễn Văn An", specialty: "Tim mạch", date: "2026-05-23", time: "09:00", status: "confirmed", type: "Khám định kỳ", fee: 300000 },
  { id: "LK002", patientId: "BN002", patientName: "Nguyễn Văn Hùng", doctorId: 2, doctorName: "BS. Trần Thị Bình", specialty: "Nhi khoa", date: "2026-05-23", time: "10:00", status: "waiting", type: "Khám bệnh", fee: 250000 },
  { id: "LK003", patientId: "BN003", patientName: "Lê Thị Lan", doctorId: 4, doctorName: "BS. Phạm Minh Đức", specialty: "Da liễu", date: "2026-05-24", time: "14:30", status: "pending", type: "Tái khám", fee: 200000 },
  { id: "LK004", patientId: "BN004", patientName: "Trần Quốc Bảo", doctorId: 1, doctorName: "BS. Nguyễn Văn An", specialty: "Tim mạch", date: "2026-05-22", time: "08:00", status: "completed", type: "Khám cấp cứu", fee: 500000 },
  { id: "LK005", patientId: "BN001", patientName: "Hoàng Thị Mai", doctorId: 3, doctorName: "BS. Lê Quốc Cường", specialty: "Ngoại tổng quát", date: "2026-05-21", time: "10:30", status: "completed", type: "Khám bệnh", fee: 350000 },
];

const MOCK_RECORDS = [
  { id: "HS001", patientId: "BN001", appointmentId: "LK004", date: "2026-05-22", doctor: "BS. Nguyễn Văn An", diagnosis: "Tăng huyết áp độ 1", symptoms: "Đau đầu, chóng mặt, mệt mỏi", prescription: [{ drug: "Amlodipine 5mg", dosage: "1 viên/ngày", duration: "30 ngày" }, { drug: "Losartan 50mg", dosage: "1 viên/ngày", duration: "30 ngày" }], tests: [{ name: "ECG", result: "Bình thường" }, { name: "Xét nghiệm máu", result: "Cholesterol cao" }], notes: "Hạn chế muối, tập thể dục đều đặn" },
  { id: "HS002", patientId: "BN002", appointmentId: "LK002", date: "2026-05-23", doctor: "BS. Trần Thị Bình", diagnosis: "Viêm họng cấp", symptoms: "Đau họng, sốt nhẹ", prescription: [{ drug: "Amoxicillin 500mg", dosage: "3 viên/ngày", duration: "7 ngày" }], tests: [], notes: "Uống nhiều nước, nghỉ ngơi" },
];

const MOCK_INVOICES = [
  { id: "HD001", patientId: "BN004", patientName: "Trần Quốc Bảo", appointmentId: "LK004", date: "2026-05-22", services: [{ name: "Khám bệnh", price: 200000 }, { name: "ECG", price: 150000 }, { name: "Xét nghiệm máu", price: 150000 }], total: 500000, status: "paid", method: "Tiền mặt" },
  { id: "HD002", patientId: "BN001", patientName: "Hoàng Thị Mai", appointmentId: "LK005", date: "2026-05-21", services: [{ name: "Khám bệnh", price: 200000 }, { name: "Siêu âm bụng", price: 150000 }], total: 350000, status: "paid", method: "Chuyển khoản" },
  { id: "HD003", patientId: "BN001", patientName: "Hoàng Thị Mai", appointmentId: "LK001", date: "2026-05-23", services: [{ name: "Khám định kỳ", price: 300000 }], total: 300000, status: "pending", method: "—" },
  { id: "HD004", patientId: "BN002", patientName: "Nguyễn Văn Hùng", appointmentId: "LK002", date: "2026-05-23", services: [{ name: "Khám bệnh", price: 250000 }], total: 250000, status: "pending", method: "—" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: "reminder", title: "Nhắc lịch khám", message: "Bệnh nhân Hoàng Thị Mai có lịch khám lúc 09:00 hôm nay", time: "07:00", read: false, channel: "SMS" },
  { id: 2, type: "result", title: "Kết quả xét nghiệm", message: "Kết quả xét nghiệm của BN Trần Quốc Bảo đã có", time: "08:30", read: false, channel: "Email" },
  { id: 3, type: "reminder", title: "Nhắc lịch khám", message: "Bệnh nhân Nguyễn Văn Hùng có lịch khám lúc 10:00 hôm nay", time: "08:00", read: true, channel: "SMS" },
  { id: 4, type: "system", title: "Hệ thống", message: "Sao lưu dữ liệu tự động hoàn tất lúc 02:00", time: "02:00", read: true, channel: "System" },
  { id: 5, type: "payment", title: "Thanh toán", message: "Hóa đơn HD002 đã được thanh toán thành công", time: "Hôm qua", read: true, channel: "Email" },
];

const REVENUE_DATA = [
  { month: "T1", revenue: 45, patients: 120 }, { month: "T2", revenue: 52, patients: 138 },
  { month: "T3", revenue: 48, patients: 125 }, { month: "T4", revenue: 61, patients: 160 },
  { month: "T5", revenue: 55, patients: 145 }, { month: "T6", revenue: 67, patients: 178 },
];
const SPECIALTY_DATA = [
  { name: "Tim mạch", value: 35, color: "#0ea5e9" }, { name: "Nhi khoa", value: 28, color: "#10b981" },
  { name: "Ngoại tổng quát", value: 20, color: "#f59e0b" }, { name: "Da liễu", value: 17, color: "#8b5cf6" },
];

// Phân quyền theo bảng:
// Ban Giám đốc (director):  Báo cáo thống kê, Thông báo (của bản thân)
// Ban Quản lý (manager):    Báo cáo thống kê, Thông báo (của bản thân)
// Bác sĩ (doctor):          Xem lịch khám, Thanh toán, Xem hồ sơ bệnh án, Thông báo (của bản thân)
// Lễ tân (receptionist):    Xem lịch khám, Thanh toán, Thông báo (của bản thân)
// Quản trị viên (system_admin): Quản trị hệ thống, Thông báo (của bản thân)
// Bệnh nhân (patient):      Xem lịch (bản thân), Đặt lịch, Hóa đơn, HSBA (bản thân), Thông báo (bản thân)
const USERS = [
  { username: "director",  password: "director123",  role: "director",     name: "Giám đốc Trần Văn Bình" },
  { username: "manager",   password: "manager123",   role: "manager",      name: "Quản lý Lê Thị Hương" },
  { username: "doctor",    password: "doctor123",    role: "doctor",       name: "BS. Nguyễn Văn An" },
  { username: "patient",   password: "patient123",   role: "patient",      name: "Hoàng Thị Mai" },
  { username: "reception", password: "reception123", role: "receptionist", name: "Lễ tân Minh Châu" },
  { username: "admin",     password: "admin123",     role: "system_admin", name: "Quản trị viên Hệ thống" },
];

// ============================================================
// UTILITY COMPONENTS
// ============================================================
const Badge = ({ status }) => {
  const map = {
    confirmed: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
    waiting: { label: "Chờ khám", cls: "bg-yellow-100 text-yellow-700" },
    pending: { label: "Chờ xác nhận", cls: "bg-gray-100 text-gray-600" },
    completed: { label: "Hoàn thành", cls: "bg-green-100 text-green-700" },
    cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-600" },
    paid: { label: "Đã thanh toán", cls: "bg-green-100 text-green-700" },
    unpaid: { label: "Chưa thanh toán", cls: "bg-red-100 text-red-600" },
  };
  const s = map[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
};

const Avatar = ({ initials, color, size = "md" }) => {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ background: color || "#6366f1" }}>
      {initials}
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

const Modal = ({ open, onClose, title, children, size = "md" }) => {
  if (!open) return null;
  const w = size === "lg" ? "max-w-2xl" : size === "xl" ? "max-w-4xl" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${w} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ onLogin, onLog }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = USERS.find(u => u.username === form.username && u.password === form.password);
      const now = new Date();
      const entry = {
        id: Date.now(),
        time: now.toLocaleString("vi-VN"),
        username: form.username || "(trống)",
        role: user ? ({director:"Ban Giám đốc", manager:"Ban Quản lý", doctor:"Bác sĩ", receptionist:"Lễ tân", system_admin:"Quản trị viên", patient:"Bệnh nhân"}[user.role] || user.role) : "—",
        name: user ? user.name : "—",
        status: user ? "success" : "fail",
        ip: "192.168.1.x",
      };
      if (onLog) onLog(entry);
      if (user) onLogin(user);
      else setError("Tên đăng nhập hoặc mật khẩu không đúng");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%)" }}>
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-3xl">🏥</div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">MedCare Pro</h1>
              <p className="text-blue-300 text-sm">Hệ thống Quản lý Bệnh viện</p>
            </div>
          </div>
          <p className="text-white/70 text-lg leading-relaxed mb-8">Nền tảng quản lý toàn diện cho bệnh viện tư nhân — từ lịch khám đến hồ sơ bệnh án, thanh toán và báo cáo thống kê.</p>
          <div className="grid grid-cols-2 gap-3">
            {[["📅","Lịch khám online"],["📋","Hồ sơ điện tử"],["💳","Thanh toán"],["📊","Báo cáo thống kê"]].map(([icon,text]) => (
              <div key={text} className="flex items-center gap-2 bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
                <span>{icon}</span><span className="text-sm text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">🏥</div>
              <h2 className="text-2xl font-bold text-white">Đăng nhập</h2>
              <p className="text-white/50 text-sm mt-1">Chào mừng trở lại</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Tên đăng nhập</label>
                <input value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="admin / doctor / patient" onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Mật khẩu</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-60">
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </div>
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/50 text-xs font-semibold mb-2">Tài khoản demo:</p>
              {[["director","director123","Ban Giám đốc"],["admin","admin123","Quản trị viên"],["doctor","doctor123","Bác sĩ"],["reception","reception123","Lễ tân"],["patient","patient123","Bệnh nhân"]].map(([u,p,r]) => (
                <button key={u} onClick={() => { setForm({username:u,password:p}); }}
                  className="w-full text-left text-xs text-white/40 hover:text-white/70 py-0.5 transition-colors">
                  <span className="text-blue-400">{u}</span> / {p} — {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
// NAV theo bảng phân quyền:
// Ban Giám đốc: Báo cáo thống kê + Thông báo (của bản thân)
// Ban Quản lý:  Báo cáo thống kê + Thông báo (của bản thân)
// Bác sĩ: Xem lịch khám + Thanh toán (xử lý) + Xem HSBA + Thông báo
// Lễ tân: Xem lịch khám + Thanh toán (xử lý) + Thông báo
// Quản trị viên: Quản trị hệ thống + Thông báo
// Bệnh nhân: Đặt lịch + Xem lịch bản thân + HSBA bản thân + Hóa đơn + Thông báo
const NAV = {
  director: [
    { id: "reports",       icon: "📈", label: "Báo cáo thống kê" },
    { id: "notifications", icon: "🔔", label: "Thông báo" },
  ],
  manager: [
    { id: "reports",       icon: "📈", label: "Báo cáo thống kê" },
    { id: "notifications", icon: "🔔", label: "Thông báo" },
  ],
  doctor: [
    { id: "appointments",  icon: "📅", label: "Lịch khám" },
    { id: "records",       icon: "📋", label: "Hồ sơ bệnh án" },
    { id: "payments",      icon: "💳", label: "Thanh toán" },
    { id: "notifications", icon: "🔔", label: "Thông báo" },
  ],
  receptionist: [
    { id: "appointments",  icon: "📅", label: "Quản lý lịch khám" },
    { id: "payments",      icon: "💳", label: "Thanh toán" },
    { id: "notifications", icon: "🔔", label: "Thông báo" },
  ],
  system_admin: [
    { id: "settings",      icon: "⚙️", label: "Quản trị hệ thống" },
    { id: "notifications", icon: "🔔", label: "Thông báo" },
  ],
  patient: [
    { id: "appointments",  icon: "📅", label: "Đặt lịch khám" },
    { id: "records",       icon: "📋", label: "Hồ sơ của tôi" },
    { id: "payments",      icon: "💳", label: "Hóa đơn" },
    { id: "notifications", icon: "🔔", label: "Thông báo" },
  ],
};

function Sidebar({ user, activeTab, onNav, collapsed, onToggle }) {
  const nav = NAV[user.role] || NAV.patient;
  return (
    <div className={`h-screen bg-gray-900 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"} flex-shrink-0`}>
      <div className={`p-4 flex items-center gap-3 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-xl flex-shrink-0">🏥</div>
        {!collapsed && <div><p className="text-white font-bold text-sm leading-tight">MedCare Pro</p><p className="text-blue-400 text-xs">Hospital System</p></div>}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === item.id ? "bg-blue-500 text-white shadow-lg" : "text-gray-400 hover:bg-white/5 hover:text-white"} ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? item.label : undefined}>
            <span className="text-base">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className={`p-3 border-t border-white/10 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 mb-2">
            <Avatar initials={user.name.charAt(0)} color="#3b82f6" size="sm" />
            <div className="overflow-hidden"><p className="text-white text-xs font-semibold truncate">{user.name}</p><p className="text-gray-500 text-xs">{{"director":"Ban Giám đốc","manager":"Ban Quản lý","doctor":"Bác sĩ","receptionist":"Lễ tân","system_admin":"Quản trị viên","patient":"Bệnh nhân"}[user.role] || user.role}</p></div>
          </div>
        )}
        <button onClick={onToggle} className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/5 text-sm">
          {collapsed ? "→" : "← Thu gọn"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ user, onNav }) {
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800">Xin chào, {user.name} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Thứ Bảy, 23/05/2026 — {new Date().toLocaleTimeString("vi-VN")}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Lịch khám hôm nay" value="12" sub="+3 so với hôm qua" color="bg-blue-50 text-blue-500" />
        <StatCard icon="👥" label="Bệnh nhân đang chờ" value="4" sub="Phòng chờ A,B" color="bg-yellow-50 text-yellow-500" />
        <StatCard icon="✅" label="Đã hoàn thành" value="8" sub="Hôm nay" color="bg-green-50 text-green-500" />
        <StatCard icon="🔔" label="Thông báo mới" value={unread} sub="Chưa đọc" color="bg-purple-50 text-purple-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Doanh thu 6 tháng gần nhất (triệu đồng)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}M`, "Doanh thu"]} />
              <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, fill: "#0ea5e9" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Phân bổ chuyên khoa</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={SPECIALTY_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                {SPECIALTY_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {SPECIALTY_DATA.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:s.color}}></div><span className="text-gray-600">{s.name}</span></div>
                <span className="font-semibold text-gray-700">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-700">Lịch khám hôm nay</h3>
          <button onClick={() => onNav("appointments")} className="text-blue-500 text-sm font-medium hover:underline">Xem tất cả →</button>
        </div>
        <div className="space-y-3">
          {MOCK_APPOINTMENTS.filter(a => a.date === "2026-05-23").map(apt => (
            <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">{apt.time}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{apt.patientName}</p>
                <p className="text-gray-500 text-xs">{apt.doctorName} • {apt.specialty}</p>
              </div>
              <Badge status={apt.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APPOINTMENTS
// ============================================================
function Appointments({ user }) {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ patientName: "", doctorId: "", date: "", time: "", type: "Khám bệnh" });
  const [toast, setToast] = useState("");

  const filtered = appointments.filter(a => filter === "all" || a.status === filter);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleBook = () => {
    if (!form.patientName || !form.doctorId || !form.date || !form.time) { showToast("Vui lòng điền đầy đủ thông tin!"); return; }
    const doc = MOCK_DOCTORS.find(d => d.id === parseInt(form.doctorId));
    const newApt = { id: `LK00${appointments.length + 1}`, patientId: "BN_NEW", patientName: form.patientName, doctorId: parseInt(form.doctorId), doctorName: doc?.name || "", specialty: doc?.specialty || "", date: form.date, time: form.time, status: "pending", type: form.type, fee: 250000 };
    setAppointments([...appointments, newApt]);
    setShowModal(false);
    setForm({ patientName: "", doctorId: "", date: "", time: "", type: "Khám bệnh" });
    showToast("✅ Đặt lịch thành công! Bệnh nhân sẽ nhận được thông báo qua SMS/Email.");
  };

  const handleCancel = (id) => {
    setAppointments(appointments.map(a => a.id === id ? {...a, status: "cancelled"} : a));
    showToast("Đã hủy lịch khám");
  };
  const handleConfirm = (id) => {
    setAppointments(appointments.map(a => a.id === id ? {...a, status: "confirmed"} : a));
    showToast("✅ Đã xác nhận lịch khám");
  };

  return (
    <div className="space-y-5">
      {toast && <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-bounce">{toast}</div>}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Quản lý lịch khám</h2>
          <p className="text-gray-500 text-sm">Tổng cộng {appointments.length} lịch khám</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm">
          <span>+</span> Đặt lịch mới
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[["all","Tất cả"],["pending","Chờ xác nhận"],["confirmed","Đã xác nhận"],["waiting","Chờ khám"],["completed","Hoàn thành"],["cancelled","Đã hủy"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === v ? "bg-blue-500 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>{l}</button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {["Mã LK","Bệnh nhân","Bác sĩ","Ngày khám","Giờ","Loại khám","Trạng thái","Hành động"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(apt => (
                <tr key={apt.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{apt.id}</td>
                  <td className="px-4 py-3"><p className="font-semibold text-gray-800">{apt.patientName}</p></td>
                  <td className="px-4 py-3"><p className="text-gray-700">{apt.doctorName}</p><p className="text-gray-400 text-xs">{apt.specialty}</p></td>
                  <td className="px-4 py-3 text-gray-700">{apt.date}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{apt.time}</td>
                  <td className="px-4 py-3 text-gray-600">{apt.type}</td>
                  <td className="px-4 py-3"><Badge status={apt.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {apt.status === "pending" && <button onClick={() => handleConfirm(apt.id)} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">Xác nhận</button>}
                      {["pending","confirmed","waiting"].includes(apt.status) && <button onClick={() => handleCancel(apt.id)} className="px-2.5 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors">Hủy</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><span className="text-4xl block mb-2">📭</span>Không có lịch khám nào</div>}
        </div>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Đặt lịch khám mới">
        <div className="space-y-4">
          <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Họ tên bệnh nhân *</label>
            <input value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="Nhập họ tên bệnh nhân" /></div>
          <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Chọn bác sĩ *</label>
            <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
              <option value="">-- Chọn bác sĩ --</option>
              {MOCK_DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Ngày khám *</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Giờ khám *</label>
              <select value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                <option value="">-- Chọn giờ --</option>
                {["08:00","08:30","09:00","09:30","10:00","10:30","11:00","13:30","14:00","14:30","15:00","15:30","16:00"].map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
          </div>
          <div><label className="text-sm font-semibold text-gray-700 block mb-1.5">Loại khám</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400">
              {["Khám bệnh","Tái khám","Khám định kỳ","Khám cấp cứu"].map(t => <option key={t}>{t}</option>)}
            </select></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">Hủy</button>
            <button onClick={handleBook} className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors">Đặt lịch</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// MEDICAL RECORDS
// ============================================================
function MedicalRecords({ user }) {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const patients = MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));
  const getRecords = (pid) => MOCK_RECORDS.filter(r => r.patientId === pid);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl font-black text-gray-800">Hồ sơ bệnh án điện tử</h2><p className="text-gray-500 text-sm">Lưu trữ toàn bộ lịch sử khám và điều trị</p></div>
        {(user.role === "director" || user.role === "manager") && (
          <button onClick={() => setShowAdd(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm">
            <span>+</span> Tạo hồ sơ mới
          </button>
        )}
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" placeholder="🔍 Tìm kiếm bệnh nhân theo tên hoặc mã..." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-3">
          <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wide">Danh sách bệnh nhân ({patients.length})</h3>
          {patients.map(p => {
            const recs = getRecords(p.id);
            return (
              <button key={p.id} onClick={() => setSelected(p)} className={`w-full text-left p-4 rounded-2xl border transition-all ${selected?.id === p.id ? "border-blue-300 bg-blue-50 shadow-md" : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"}`}>
                <div className="flex items-center gap-3">
                  <Avatar initials={p.name.charAt(0)} color="#0ea5e9" size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                    <p className="text-gray-400 text-xs">{p.id} • {p.gender} • {new Date().getFullYear() - new Date(p.dob).getFullYear()} tuổi</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">{recs.length} hồ sơ</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 h-64 flex items-center justify-center text-gray-400 flex-col gap-2">
              <span className="text-5xl">📋</span>
              <p>Chọn bệnh nhân để xem hồ sơ</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #eff6ff, #f0fdf4)" }}>
                <div className="flex items-center gap-4">
                  <Avatar initials={selected.name.charAt(0)} color="#0ea5e9" size="lg" />
                  <div>
                    <h3 className="text-xl font-black text-gray-800">{selected.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span>🎂 {new Date().getFullYear() - new Date(selected.dob).getFullYear()} tuổi</span>
                      <span>🩸 Nhóm máu: <strong>{selected.bloodType}</strong></span>
                      <span>⚠️ Dị ứng: <strong>{selected.allergies}</strong></span>
                      <span>📞 {selected.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <h4 className="font-bold text-gray-700">Lịch sử khám bệnh</h4>
                {getRecords(selected.id).length === 0 ? (
                  <p className="text-gray-400 text-sm py-4 text-center">Chưa có hồ sơ khám bệnh</p>
                ) : getRecords(selected.id).map(rec => (
                  <div key={rec.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-400">{rec.id}</span>
                        <span className="font-semibold text-gray-700 text-sm">{rec.date} — {rec.doctor}</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Hoàn thành</span>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                      <div><span className="text-gray-500 font-medium">Chẩn đoán:</span> <span className="font-bold text-red-600">{rec.diagnosis}</span></div>
                      <div><span className="text-gray-500 font-medium">Triệu chứng:</span> <span className="text-gray-700">{rec.symptoms}</span></div>
                      {rec.prescription.length > 0 && (
                        <div>
                          <span className="text-gray-500 font-medium block mb-2">Đơn thuốc:</span>
                          <div className="space-y-1.5">
                            {rec.prescription.map((p, i) => (
                              <div key={i} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                <span className="text-blue-500">💊</span>
                                <span className="font-semibold text-blue-800">{p.drug}</span>
                                <span className="text-gray-500 text-xs">• {p.dosage} • {p.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {rec.tests.length > 0 && (
                        <div>
                          <span className="text-gray-500 font-medium block mb-2">Kết quả xét nghiệm:</span>
                          <div className="grid grid-cols-2 gap-2">
                            {rec.tests.map((t, i) => (
                              <div key={i} className="bg-green-50 px-3 py-2 rounded-lg text-xs">
                                <p className="font-semibold text-green-800">🧪 {t.name}</p>
                                <p className="text-green-600">{t.result}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {rec.notes && <div className="bg-yellow-50 px-3 py-2 rounded-lg text-xs"><span className="font-semibold text-yellow-800">📝 Ghi chú: </span><span className="text-yellow-700">{rec.notes}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAYMENTS
// ============================================================
// QR Payment Modal — hiển thị mã QR và chờ xác nhận
function QRPaymentModal({ open, onClose, invoice, onConfirm }) {
  const [confirmed, setConfirmed] = useState(false);

  // Reset state mỗi khi mở modal mới
  useEffect(() => {
    if (open) setConfirmed(false);
  }, [open, invoice]);

  if (!invoice) return null;

  const qrData = encodeURIComponent(
    `MedCare|INV:${invoice.id}|AMT:${invoice.total}|PT:${invoice.patientName}|TS:${Date.now()}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrData}&color=1d4ed8&bgcolor=ffffff&qzone=2`;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
    }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title="Thanh toán QR Code" size="md">
      <div className="space-y-5">
        {/* Thông tin hóa đơn */}
        <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Hóa đơn</p>
            <p className="text-base font-bold text-gray-800">{invoice.patientName}</p>
            <p className="text-xs text-gray-500 font-mono">{invoice.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Số tiền</p>
            <p className="text-2xl font-black text-blue-600">{invoice.total.toLocaleString("vi-VN")}đ</p>
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <span className="text-lg mt-0.5">📱</span>
          <p className="text-sm text-amber-800 leading-relaxed">
            Mở ứng dụng ngân hàng hoặc ví điện tử, chọn <strong>Quét mã QR</strong>, sau đó quét mã bên dưới để thanh toán. Nhấn <strong>Xác nhận đã thanh toán</strong> sau khi chuyển tiền thành công.
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-60 h-60 rounded-2xl border-2 border-blue-200 bg-white p-2 shadow-lg flex items-center justify-center">
              <img
                src={qrUrl}
                alt="QR thanh toán"
                className="w-full h-full rounded-xl"
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
              />
              <div style={{display:'none'}} className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                <span className="text-4xl">📱</span>
                <p className="text-xs text-center">Không tải được mã QR.<br/>Vui lòng kiểm tra kết nối.</p>
              </div>
            </div>
            {/* Corner decorators */}
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-blue-500 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-blue-500 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-blue-500 rounded-br-lg" />
          </div>
          <p className="text-xs text-gray-400 text-center">Hỗ trợ: VietQR · MoMo · ZaloPay · VNPay</p>
        </div>

        {/* Buttons */}
        {!confirmed ? (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onClose}
              className="py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className="py-3 px-4 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>✅</span> Xác nhận đã thanh toán
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl animate-bounce">✅</div>
            <p className="text-green-700 font-semibold text-sm">Đang xác nhận thanh toán...</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================================
function Payments({ user }) {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [selected, setSelected] = useState(null);       // invoice đang chọn phương thức
  const [qrInvoice, setQrInvoice] = useState(null);     // invoice đang hiện QR
  const [filter, setFilter] = useState("all");

  const filtered = invoices.filter(i => filter === "all" || i.status === filter);
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.total, 0);

  const handlePay = (method) => {
    if (!selected) return;
    if (method === "QR") {
      // Chuyển sang modal QR riêng, đóng modal chọn phương thức
      setQrInvoice(selected);
      setSelected(null);
      return;
    }
    setInvoices(invoices.map(i => i.id === selected.id ? {...i, status: "paid", method} : i));
    setSelected(null);
  };

  const handleConfirmQr = () => {
    if (!qrInvoice) return;
    setInvoices(invoices.map(i => i.id === qrInvoice.id ? {...i, status: "paid", method: "QR"} : i));
    setQrInvoice(null);
  };

  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-black text-gray-800">Quản lý thanh toán</h2><p className="text-gray-500 text-sm">Hóa đơn và lịch sử giao dịch</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon="💰" label="Đã thu (hôm nay)" value={`${(totalRevenue/1000).toFixed(0)}K`} sub="VNĐ" color="bg-green-50 text-green-500" />
        <StatCard icon="⏳" label="Chờ thanh toán" value={`${(totalPending/1000).toFixed(0)}K`} sub="VNĐ" color="bg-yellow-50 text-yellow-500" />
        <StatCard icon="📄" label="Tổng hóa đơn" value={invoices.length} sub={`${invoices.filter(i=>i.status==="paid").length} đã thanh toán`} color="bg-blue-50 text-blue-500" />
      </div>
      <div className="flex gap-2">
        {[["all","Tất cả"],["pending","Chờ thanh toán"],["paid","Đã thanh toán"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === v ? "bg-blue-500 text-white shadow" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>{l}</button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {["Mã HD","Bệnh nhân","Ngày","Dịch vụ","Tổng tiền","Trạng thái","Thanh toán"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{inv.patientName}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.date}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{inv.services.map(s=>s.name).join(", ")}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{inv.total.toLocaleString("vi-VN")}đ</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {inv.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {inv.status === "pending" ? (
                      <button onClick={() => setSelected(inv)} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors">Thanh toán</button>
                    ) : (
                      <span className="text-xs text-gray-400">{inv.method}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chọn phương thức thanh toán */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Chọn phương thức thanh toán">
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm"><span className="text-gray-500">Bệnh nhân:</span> <strong>{selected.patientName}</strong></p>
              <p className="text-sm"><span className="text-gray-500">Mã hóa đơn:</span> <strong>{selected.id}</strong></p>
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                {selected.services.map((s,i) => (
                  <div key={i} className="flex justify-between text-sm"><span className="text-gray-600">{s.name}</span><span>{s.price.toLocaleString("vi-VN")}đ</span></div>
                ))}
                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
                  <span>Tổng cộng</span><span className="text-blue-600">{selected.total.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700">Chọn phương thức thanh toán:</p>
            <div className="grid grid-cols-2 gap-3">
              {[["💵","Tiền mặt"],["🏦","Chuyển khoản"],["💳","Thẻ"],["📱","Mã QR"]].map(([icon,method]) => (
                <button
                  key={method}
                  onClick={() => handlePay(method === "Mã QR" ? "QR" : method)}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all font-semibold text-sm text-gray-700 hover:shadow-md ${method === "Mã QR" ? "border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"}`}
                >
                  <span className="text-3xl">{icon}</span>
                  <span>{method}</span>
                  {method === "Mã QR" && <span className="text-xs text-blue-500 font-normal">VietQR · MoMo · ZaloPay</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal QR Payment riêng */}
      <QRPaymentModal
        open={!!qrInvoice}
        onClose={() => setQrInvoice(null)}
        invoice={qrInvoice}
        onConfirm={handleConfirmQr}
      />
    </div>
  );
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function Notifications() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");
  const markRead = (id) => setNotifs(notifs.map(n => n.id === id ? {...n, read: true} : n));
  const markAll = () => setNotifs(notifs.map(n => ({...n, read: true})));

  const filtered = filter === "unread" ? notifs.filter(n => !n.read) : notifs;
  const typeIcon = { reminder: "📅", result: "🧪", system: "⚙️", payment: "💳" };
  const typeColor = { reminder: "bg-blue-100 text-blue-600", result: "bg-green-100 text-green-600", system: "bg-gray-100 text-gray-600", payment: "bg-yellow-100 text-yellow-600" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl font-black text-gray-800">Thông báo & Nhắc lịch</h2><p className="text-gray-500 text-sm">{notifs.filter(n=>!n.read).length} thông báo chưa đọc</p></div>
        <button onClick={markAll} className="text-blue-500 text-sm font-medium hover:underline">Đánh dấu tất cả đã đọc</button>
      </div>
      <div className="flex gap-2">
        {[["all","Tất cả"],["unread","Chưa đọc"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === v ? "bg-blue-500 text-white shadow" : "bg-white text-gray-600 border border-gray-200"}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer ${!n.read ? "border-blue-200 bg-blue-50/50 shadow-sm" : "border-gray-100 bg-white hover:bg-gray-50"}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeColor[n.type]}`}>{typeIcon[n.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-bold text-sm ${!n.read ? "text-gray-800" : "text-gray-600"}`}>{n.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{n.channel}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-0.5">{n.message}</p>
                <p className="text-gray-400 text-xs mt-1">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><span className="text-5xl block mb-2">🎉</span>Không có thông báo nào</div>}
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="font-bold text-gray-700 mb-3">⚙️ Cấu hình Notification Service</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[["📧 Email","Hoạt động","text-green-600"],["📱 SMS","Hoạt động","text-green-600"],["🔄 Retry Policy","Tối đa 3 lần / 15 phút","text-gray-600"],["📊 Queue","RabbitMQ — 0 tin chờ","text-gray-600"]].map(([k,v,c]) => (
            <div key={k} className="bg-white rounded-xl px-4 py-3 border border-blue-100"><span className="text-gray-500">{k}: </span><span className={`font-semibold ${c}`}>{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REPORTS
// ============================================================
function Reports() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black text-gray-800">Báo cáo & Thống kê</h2><p className="text-gray-500 text-sm">Dữ liệu theo thời gian thực — Cập nhật lần cuối: 23/05/2026 08:45</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Bệnh nhân tháng này" value="145" sub="+12% so với tháng trước" color="bg-blue-50 text-blue-500" />
        <StatCard icon="💰" label="Doanh thu tháng" value="55M" sub="VNĐ" color="bg-green-50 text-green-500" />
        <StatCard icon="⭐" label="Tỉ lệ hài lòng" value="94%" sub="Dựa trên 128 đánh giá" color="bg-yellow-50 text-yellow-500" />
        <StatCard icon="⚡" label="Thời gian chờ TB" value="18 phút" sub="Giảm 3 phút" color="bg-purple-50 text-purple-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Số bệnh nhân & Doanh thu (6 tháng)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#0ea5e9" radius={[4,4,0,0]} name="Doanh thu (M)" />
              <Bar yAxisId="right" dataKey="patients" fill="#10b981" radius={[4,4,0,0]} name="Bệnh nhân" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4">Hiệu suất bác sĩ (bệnh nhân/tháng)</h3>
          <div className="space-y-4 mt-6">
            {MOCK_DOCTORS.map((doc, i) => {
              const count = [32, 28, 24, 20][i];
              const pct = (count/40)*100;
              return (
                <div key={doc.id}>
                  <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{doc.name}</span><span className="text-gray-500">{count} bệnh nhân</span></div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: doc.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4">Báo cáo nhanh</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[["📊 Doanh thu tháng","Xuất PDF"],["📅 Lịch khám tuần","Xuất Excel"],["👥 Danh sách bệnh nhân","Xuất CSV"],["📋 Hồ sơ bệnh án","Xuất PDF"]].map(([name,btn]) => (
            <div key={name} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
              <p className="font-semibold text-gray-700 text-sm mb-3">{name}</p>
              <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg font-semibold">{btn}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS / ADMIN
// ============================================================
function Settings({ logs = [] }) {
  const [activeSection, setActiveSection] = useState("users");

  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-black text-gray-800">Quản trị hệ thống</h2><p className="text-gray-500 text-sm">Cấu hình và phân quyền người dùng</p></div>
      <div className="flex gap-2 flex-wrap">
        {[["users","👥 Người dùng"],["doctors","👨‍⚕️ Bác sĩ"],["security","🔒 Bảo mật"],["system","⚙️ Hệ thống"],["logs","📋 Nhật ký đăng nhập"]].map(([v,l]) => (
          <button key={v} onClick={() => setActiveSection(v)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeSection === v ? "bg-blue-500 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{l}</button>
        ))}
      </div>
      {activeSection === "users" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Tài khoản người dùng</h3>
            <button className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 transition-colors">+ Thêm tài khoản</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              {["Người dùng","Tên đăng nhập","Vai trò","Trạng thái","Hành động"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {USERS.map(u => (
                <tr key={u.username} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar initials={u.name.charAt(0)} size="sm" /><span className="font-semibold text-gray-800">{u.name}</span></div></td>
                  <td className="px-4 py-3 font-mono text-gray-500">{u.username}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">{u.role}</span></td>
                  <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Hoạt động</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <button className="text-xs text-blue-500 hover:underline">Sửa</button>
                    <button className="text-xs text-red-500 hover:underline">Vô hiệu</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeSection === "doctors" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_DOCTORS.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <Avatar initials={doc.avatar} color={doc.color} size="lg" />
              <div className="flex-1">
                <p className="font-bold text-gray-800">{doc.name}</p>
                <p className="text-gray-500 text-sm">{doc.specialty}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${doc.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{doc.available ? "🟢 Đang làm việc" : "🔴 Nghỉ phép"}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {doc.schedule.map(t => <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-mono">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeSection === "security" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="font-bold text-gray-700">Cấu hình bảo mật hệ thống</h3>
          {[
            ["🔐 Mã hóa HTTPS/TLS", "Đang hoạt động", "Tất cả dữ liệu được mã hóa qua TLS 1.3", true],
            ["🛡️ Bảo vệ SQL Injection", "Đang hoạt động", "Dùng Prepared Statements & ORM", true],
            ["🔑 JWT Authentication", "Đang hoạt động", "Token hết hạn sau 24h, refresh token 7 ngày", true],
            ["🚫 Rate Limiting", "Đang hoạt động", "Tối đa 100 request/phút mỗi IP", true],
            ["📝 Audit Log", "Đang hoạt động", "Ghi log toàn bộ hành động của người dùng", true],
            ["🔒 RBAC Phân quyền", "Đang hoạt động", "5 vai trò: Admin, Bác sĩ, Điều dưỡng, Lễ tân, Bệnh nhân", true],
          ].map(([name, status, desc, active]) => (
            <div key={name} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className={`mt-0.5 w-3 h-3 rounded-full flex-shrink-0 ${active ? "bg-green-500" : "bg-red-400"}`}></span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{status}</span>
            </div>
          ))}
        </div>
      )}
      {activeSection === "system" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["💾 Cơ sở dữ liệu", "PostgreSQL 15", "Kết nối: 12/100", "bg-blue-50 border-blue-100"],
            ["🔄 Sao lưu tự động", "Mỗi ngày lúc 02:00", "Lần cuối: hôm nay 02:00 ✅", "bg-green-50 border-green-100"],
            ["📊 Uptime hệ thống", "99.8%", "Hoạt động liên tục 47 ngày", "bg-yellow-50 border-yellow-100"],
            ["🌐 Server", "Node.js 20 + Express", "RAM: 2.1/4GB | CPU: 23%", "bg-purple-50 border-purple-100"],
          ].map(([title, main, sub, cls]) => (
            <div key={title} className={`rounded-2xl border p-5 ${cls}`}>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">{title}</p>
              <p className="text-xl font-black text-gray-800">{main}</p>
              <p className="text-gray-500 text-sm mt-1">{sub}</p>
            </div>
          ))}
        </div>
      )}
      {activeSection === "logs" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-700">Nhật ký đăng nhập</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ghi lại toàn bộ lượt đăng nhập trong phiên làm việc hiện tại</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-semibold">{logs.length} lượt</span>
              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg font-semibold">{logs.filter(l=>l.status==="success").length} thành công</span>
              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg font-semibold">{logs.filter(l=>l.status==="fail").length} thất bại</span>
            </div>
          </div>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <span className="text-5xl mb-3">📋</span>
              <p className="font-semibold text-gray-400">Chưa có nhật ký nào</p>
              <p className="text-sm text-gray-300 mt-1">Nhật ký sẽ xuất hiện sau mỗi lần đăng nhập</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Thời gian","Tên đăng nhập","Họ tên","Vai trò","Trạng thái","IP"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...logs].reverse().map(log => (
                    <tr key={log.id} className={`transition-colors ${log.status === "fail" ? "bg-red-50/40 hover:bg-red-50" : "hover:bg-blue-50/20"}`}>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">{log.time}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-700">{log.username}</td>
                      <td className="px-4 py-3 text-gray-600">{log.name}</td>
                      <td className="px-4 py-3">
                        {log.role !== "—" ? (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{log.role}</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {log.status === "success"
                          ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">✅ Thành công</span>
                          : <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">❌ Thất bại</span>
                        }
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP (Controller Layer - MVC)
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [loginLogs, setLoginLogs] = useState([]);

  const getDefaultTab = (u) => (NAV[u.role]?.[0]?.id) || "dashboard";
  const addLog = (entry) => setLoginLogs(prev => [...prev, entry]);

  const handleLogout = () => { setUser(null); setActiveTab("dashboard"); };

  if (!user) return <LoginPage onLogin={(u) => { setUser(u); setActiveTab(getDefaultTab(u)); }} onLog={addLog} />;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard user={user} onNav={setActiveTab} />;
      case "appointments": return <Appointments user={user} />;
      case "records": return <MedicalRecords user={user} />;
      case "payments": return <Payments user={user} />;
      case "notifications": return <Notifications />;
      case "reports": return <Reports />;
      case "settings": return <Settings logs={loginLogs} />;
      default: return <Dashboard user={user} onNav={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <Sidebar user={user} activeTab={activeTab} onNav={setActiveTab} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>🏥 MedCare Pro</span>
            <span>›</span>
            <span className="text-gray-700 font-semibold capitalize">{activeTab === "dashboard" ? "Tổng quan" : activeTab}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("notifications")} className="relative w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <span>🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">2</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
              <Avatar initials={user.name.charAt(0)} color="#0ea5e9" size="sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-700 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-400">Đăng xuất</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
