// src/controllers/notificationController.js

const notificationService = require('../services/notificationService');

// 1. API Lấy danh sách thông báo
const getNotifications = async (req, res) => {
    // Lấy userId từ token đã xác thực
    const userId = req.user.id; 
    const result = await notificationService.getUserNotifications(userId);
    
    // Trả về kết quả
    return res.status(result.EC === 0 ? 200 : 500).json(result);
};

// 2. API Đánh dấu tất cả là đã đọc
const markRead = async (req, res) => {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);
    return res.status(200).json(result);
};

module.exports = { getNotifications, markRead };