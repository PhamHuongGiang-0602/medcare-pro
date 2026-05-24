# 🏥 MedCare Pro — Hệ thống Quản lý Bệnh viện Trực tuyến

> **Kiến trúc:** Client-Server + MVC  
> **Backend:** Node.js + Express.js  
> **Frontend:** React (Artifacts / Standalone)

---

## 🚀 Cài đặt & Chạy

### Backend API
```bash
cd backend
npm install
npm run dev       # Development (nodemon)
# hoặc
npm start         # Production

# Server chạy tại: http://localhost:4000
```

### Frontend (React)
Mở file `frontend/hospital-management.jsx` trong Claude Artifacts  
hoặc tích hợp vào React App:
```bash
cd frontend
npm install
npm start         # http://localhost:3000
```

---

## 🔐 Tài khoản Demo

| Username     | Password       | Vai trò          | Quyền truy cập                          |
|-------------|---------------|-----------------|----------------------------------------|
| `admin`      | `admin123`     | Quản trị viên    |quản lý hệ thống              |
| `doctor1`    | `doctor123`    | BS. Nguyễn Văn An | Lịch khám của mình, hồ sơ bệnh án, báo cáo |
| `doctor2`    | `doctor123`    | BS. Trần Thị Bình | Lịch khám của mình, hồ sơ bệnh án     |
| `patient`    | `patient123`   | Bệnh nhân        | Hồ sơ & lịch khám của mình, hóa đơn  |
| `reception`  | `reception123` | Lễ tân           | Lịch khám, thanh toán                  |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/login          Đăng nhập → nhận JWT token
GET    /api/auth/me             Thông tin user hiện tại (cần token)
```

### Lịch khám (Appointments)
```
GET    /api/appointments                    Danh sách (có filter: ?date=&status=&doctorId=)
GET    /api/appointments/:id               Chi tiết
POST   /api/appointments                   Tạo lịch khám mới
PATCH  /api/appointments/:id/status        Cập nhật trạng thái
DELETE /api/appointments/:id               Xóa lịch khám
```

### Hồ sơ bệnh án (Medical Records)
```
GET    /api/records                         Danh sách (có filter: ?patientId=)
GET    /api/records/:id                    Chi tiết
POST   /api/records                        Tạo hồ sơ mới (Doctor/Admin)
```

### Bệnh nhân
```
GET    /api/patients                        Danh sách (có search: ?q=)
GET    /api/patients/:id                   Chi tiết + lịch sử đầy đủ
```

### Bác sĩ
```
GET    /api/doctors                         Danh sách (filter: ?specialty=&available=)
GET    /api/doctors/:id/schedule           Lịch làm việc (?date=YYYY-MM-DD)
```

### Hóa đơn (Invoices)
```
GET    /api/invoices                        Danh sách (filter: ?status=&patientId=)
PATCH  /api/invoices/:id/pay               Thanh toán { "method": "Tiền mặt" }
```

### Thông báo (Notifications)
```
GET    /api/notifications                  Danh sách (?unread=true)
PATCH  /api/notifications/:id/read        Đánh dấu đã đọc
PATCH  /api/notifications/read-all        Đánh dấu tất cả đã đọc
POST   /api/notifications                  Gửi thông báo (Admin)
```

### Báo cáo (Reports)
```
GET    /api/reports/summary                Tổng hợp dashboard (Admin/Doctor)
```

### Quản trị
```
GET    /api/users                          Danh sách users (Admin)
GET    /api/health                         Health check
```

---

## 🔑 Cách sử dụng API

### 1. Đăng nhập lấy token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Dùng token trong các request
```bash
curl http://localhost:4000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Tạo lịch khám mới
```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patientId": "p1",
    "doctorId": "d2",
    "date": "2026-05-25",
    "time": "09:30",
    "type": "Khám bệnh"
  }'
```

### 4. Thanh toán hóa đơn
```bash
curl -X PATCH http://localhost:4000/api/invoices/i3/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"method":"Chuyển khoản"}'
```

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT (Browser/Mobile)                 │
│              React SPA — Presentation Layer              │
│         View: Pages │ Controller: Event Handlers         │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS/REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│              SERVER (Node.js + Express)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Routes Layer     — URL mapping & validation     │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Middleware       — Auth (JWT) + RBAC + Security │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Controllers      — Business Logic (MVC)         │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Models / DB      — Data Layer (In-memory/SQL)   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Các pattern áp dụng:
- **Client-Server**: Tách biệt hoàn toàn FE/BE, giao tiếp qua REST API
- **MVC**: Controller xử lý logic, Model quản lý data, Route là View của API
- **Event-based**: Notification Service tạo thông báo tự động khi có sự kiện
- **Data-centered**: Tất cả module truy cập dùng chung data layer

---

## 🔒 Bảo mật đã triển khai

| Biện pháp | Mô tả |
|-----------|-------|
| JWT Authentication | Token hết hạn sau 24h |
| RBAC | 5 vai trò với quyền khác nhau |
| Helmet.js | Bảo vệ HTTP headers |
| Rate Limiting | 100 request/phút/IP |
| CORS | Kiểm soát nguồn gốc request |
| bcrypt | Hash password với salt rounds=10 |
| Input Validation | Kiểm tra dữ liệu đầu vào |

---

## 📁 Cấu trúc thư mục

```
medcare-pro/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       Auth login/me
│   │   │   ├── appointmentController.js CRUD lịch khám
│   │   │   └── index.js                Patients, Doctors, Records...
│   │   ├── middleware/
│   │   │   └── auth.js                 JWT + RBAC
│   │   ├── models/
│   │   │   └── db.js                   In-memory database
│   │   ├── routes/
│   │   │   └── index.js                API routes
│   │   └── server.js                   Express entry point
│   └── package.json
├── frontend/
│   └── hospital-management.jsx         React SPA (6 modules)
└── README.md
```
