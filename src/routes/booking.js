// src/routes/booking.js (ĐÃ SỬA LỖI)

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController'); 
const { verifyJWT, requireRole } = require('../middleware/auth');

// === USER ROUTES (cần đăng nhập) ===
// Tạo một booking mới
// Đảm bảo rằng bạn đang gọi hàm bookingController.createBooking
router.post('/', verifyJWT, bookingController.createBooking);

// Lấy lịch sử booking của user đang đăng nhập
router.get('/my-bookings', verifyJWT, bookingController.getMyBookings);

// === ADMIN ROUTES ===
// Lấy tất cả booking trong hệ thống
router.get('/', verifyJWT, requireRole('admin'), bookingController.getAllBookings);

router.patch('/:id/status', verifyJWT, bookingController.updateStatus);

module.exports = router;