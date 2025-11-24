// src/services/notificationService.js
const Notification = require('../models/Notification');

// 1. Tạo thông báo mới (Hàm này dùng trong nội bộ Backend)
const createNotification = async ({ userId, title, message, type }) => {
    try {
        await Notification.create({ user: userId, title, message, type });
        // Sau này có thể thêm Socket.IO ở đây để bắn real-time
    } catch (error) {
        console.error('Lỗi tạo thông báo:', error);
    }
};

// 2. Lấy danh sách thông báo của User
const getUserNotifications = async (userId) => {
    try {
        // Lấy hết, sắp xếp mới nhất lên đầu
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        
        // Đếm số lượng chưa đọc
        const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

        return { 
            EC: 0, 
            DT: { notifications, unreadCount } 
        };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Lỗi lấy thông báo' };
    }
};

// 3. Đánh dấu đã đọc (Khi người dùng bấm vào cái chuông)
const markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { user: userId, isRead: false },
            { isRead: true }
        );
        return { EC: 0, EM: 'Success' };
    } catch (error) {
        return { EC: -1, EM: 'Lỗi server' };
    }
};

module.exports = { createNotification, getUserNotifications, markAllAsRead };