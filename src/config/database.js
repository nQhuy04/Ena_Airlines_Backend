// src/config/database.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;

    // --- THÊM DÒNG DEBUG NÀY VÀO ---
    console.log("--- KẾT NỐI DATABASE ---");
    console.log("Server đang cố gắng kết nối đến:", connectionString);
    console.log("-----------------------");
    // --- KẾT THÚC DEBUG ---

    if (!connectionString) {
        console.error('LỖI KẾT NỐI: Biến MONGODB_URI chưa được thiết lập trong file .env');
        process.exit(1); 
    }

    await mongoose.connect(connectionString);

    console.log('Kết nối đến MongoDB Atlas thành công!');

  } catch (error) {
    console.error('Kết nối đến database thất bại:', error);
    process.exit(1);
  }
};

module.exports = connectDB;