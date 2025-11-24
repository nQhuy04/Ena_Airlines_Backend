// src/services/dashboardService.js

const Booking = require('../models/Booking');
const User = require('../models/User');
const Flight = require('../models/Flight');

const getDashboardStats = async () => {
    try {
        // 1. CARD THỐNG KÊ CƠ BẢN
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalFlights = await Flight.countDocuments();
        const totalBookings = await Booking.countDocuments();
        
        // Tính tổng doanh thu (chỉ tính vé đã confirmed)
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;


        // 2. DỮ LIỆU BIỂU ĐỒ TRÒN (Status Ratio)
        const statusStats = await Booking.aggregate([
            { $group: { _id: "$status", value: { $sum: 1 } } }
        ]);
        // Format lại cho đúng chuẩn Frontend (name, value, color)
        const pieData = statusStats.map(item => {
            let name = item._id;
            let color = '#999';
            if (item._id === 'confirmed') { name = 'Thành công'; color = '#52c41a'; }
            if (item._id === 'pending' || item._id === 'pending_payment') { name = 'Chờ xử lý'; color = '#faad14'; }
            if (item._id === 'cancelled') { name = 'Đã hủy'; color = '#ff4d4f'; }
            return { name, value: item.value, color };
        });


        // 3. DỮ LIỆU BIỂU ĐỒ DOANH THU (THEO 12 THÁNG CỦA NĂM HIỆN TẠI)
        const currentYear = new Date().getFullYear();
        const revenueByMonth = await Booking.aggregate([
            {
                $match: {
                    status: 'confirmed',
                    createdAt: { 
                        $gte: new Date(`${currentYear}-01-01`), 
                        $lte: new Date(`${currentYear}-12-31`) 
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" }, // Nhóm theo tháng (1-12)
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } } // Sắp xếp tháng tăng dần
        ]);

        // Chuẩn hóa dữ liệu (Đảm bảo có đủ tháng 1 -> 12, tháng nào không có thì total = 0)
        const areaData = [];
        for (let i = 1; i <= 12; i++) {
            const found = revenueByMonth.find(item => item._id === i);
            areaData.push({
                name: `T${i}`,
                total: found ? found.total : 0
            });
        }


        // 4. LẤY 5 BOOKING MỚI NHẤT
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name')
            .lean();
        
        const formattedRecents = recentBookings.map(b => ({
            key: b._id,
            code: b.bookingCode,
            user: b.user?.name || 'Khách',
            price: new Intl.NumberFormat('vi-VN').format(b.totalAmount),
            status: b.status
        }));

        return {
            EC: 0,
            DT: {
                cards: { totalUsers, totalFlights, totalBookings, totalRevenue },
                pieData,
                areaData,
                recentBookings: formattedRecents
            }
        };

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return { EC: -1, EM: 'Lỗi server khi lấy thống kê' };
    }
};

module.exports = { getDashboardStats };