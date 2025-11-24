// src/server.js

require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const apiRoutes = require('./routes');

// Khởi tạo ứng dụng Express
const app = express();

// Kết nối đến Database
connectDB();

// Cấu hình Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ĐỊNH NGHĨA ROUTES ---

// 2. DI CHUYỂN ĐỊNH NGHĨA ROUTE VÀO ĐÂY (TRƯỚC APP.LISTEN)
// API route chính, tất cả các route trong `src/routes` sẽ có tiền tố /api/v1
app.use('/api/v1', apiRoutes); 

// Route mặc định để kiểm tra server có hoạt động không
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Chào mừng đến với API của ENA Airlines!' });
});


// Lấy PORT từ file .env
const PORT = process.env.PORT || 8080;

// Khởi động server
app.listen(PORT, () => {
    console.log(`Backend server đang chạy trên port ${PORT}`);
});