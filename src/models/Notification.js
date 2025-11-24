// src/models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Thông báo này thuộc về user nào?
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Tiêu đề (ví dụ: Đặt vé thành công)
    title: { type: String, required: true },
    
    // Nội dung chi tiết
    message: { type: String, required: true },
    
    // Loại thông báo (để hiện màu sắc icon: xanh, vàng, đỏ...)
    type: { 
        type: String, 
        enum: ['success', 'info', 'warning', 'error'], 
        default: 'info' 
    },
    
    // Trạng thái đã đọc chưa (để hiện chấm đỏ)
    isRead: { type: Boolean, default: false },
    
}, { timestamps: true }); // Tự động có createdAt, updatedAt

module.exports = mongoose.model('Notification', notificationSchema);