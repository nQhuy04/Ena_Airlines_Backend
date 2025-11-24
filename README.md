# 📡 ENA Airline - Backend Server

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

Đây là mã nguồn phía máy chủ (Server-side) cho hệ thống đặt vé máy bay **ENA Airline**. Dự án cung cấp các RESTful API để xử lý nghiệp vụ đặt vé, quản lý chuyến bay, điều phối nhân sự và xác thực người dùng.

## 🛠️ Công Nghệ Sử Dụng

*   **Runtime:** Node.js
*   **Framework:** Express.js (v5.x)
*   **Database:** MongoDB Atlas (Cloud Database)
*   **ODM:** Mongoose
*   **Authentication:** JWT (JSON Web Token) & Bcrypt
*   **Email Service:** Nodemailer
*   **Architecture:** MVC (Model-View-Controller) + Service Layer

## 📂 Cấu Trúc Thư Mục

ENA-AIRLINES-BACKEND/
├── src/
│   ├── config/         # Cấu hình Database, biến môi trường
│   ├── controllers/    # Tiếp nhận request & phản hồi response
│   ├── middleware/     # Xử lý trung gian (Auth, Validation)
│   ├── models/         # Định nghĩa Schema dữ liệu (MongoDB)
│   ├── routes/         # Định nghĩa các API endpoints
│   ├── seeders/        # Dữ liệu mẫu (Khởi tạo Admin, Sân bay...)
│   ├── services/       # Xử lý logic nghiệp vụ phức tạp
│   └── server.js       # Entry point
├── .env                # Biến môi trường (PRIVATE)
└── package.json        # Khai báo thư viện


🚀 Hướng Dẫn Cài Đặt & Chạy (Local)
1. Yêu cầu tiên quyết
    - Máy đã cài đặt Node.js (Khuyên dùng bản LTS).
    - Đã có tài khoản MongoDB Atlas (hoặc MongoDB local).
2. Cài đặt thư viện
    - Mở terminal tại thư mục gốc dự án và chạy:
    npm install
3. Cấu hình môi trường (.env)
    - Tạo file .env tại thư mục gốc (ngang hàng package.json). Copy nội dung sau:
    PORT=8080
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ena_airlines_db
    JWT_SECRET=chuoi_bi_mat_cua_ban_tu_dat
    EMAIL_USER=dia_chi_email_gui_thong_bao@gmail.com
    EMAIL_APP_PASSWORD=mat_khau_ung_dung_email
4. Nạp dữ liệu mẫu (Seeding)
    - Để hệ thống có sẵn dữ liệu Sân bay, Máy bay và Tài khoản Admin ban đầu:
    # Chạy từng file seeder
    node src/seeders/airportSeeder.js
    node src/seeders/aircraftSeeder.js
    # ... (và các file seeder khác)
5. Khởi chạy Server
    - Chế độ Production:
    npm start
    - Chế độ Development (Tự động reload khi code):
    npm run dev

Server sẽ chạy tại địa chỉ: http://localhost:8080


📚 Danh sách API Chính
Method	Endpoint	Mô tả	Quyền hạn
POST	/api/v1/auth/login	Đăng nhập hệ thống	Public
GET	/api/v1/flights/search	Tìm kiếm chuyến bay	Public
POST	/api/v1/booking	Đặt vé máy bay	User
POST	/api/v1/flights	Tạo lịch bay mới	Admin
GET	/api/v1/dashboard/stats	Thống kê doanh thu	Admin

👨‍💻 Tác Giả
Developed by Nguyễn Quang Huy

Use with ❤️ for ENA Airline Project.