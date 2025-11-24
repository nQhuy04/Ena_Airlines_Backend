// src/controllers/bookingController.js (HOÀN CHỈNH - ĐÚNG CHUẨN)

const bookingService = require('../services/bookingService');

// HÀM TẠO BOOKING MỚI
const createBooking = async (req, res) => {
    try {
        // 1. Lấy userId một cách an toàn từ token đã được giải mã
        const userId = req.user.id;

        // 2. Lấy các trường dữ liệu từ body mà frontend gửi lên
        //    Hãy chắc chắn rằng chúng ta đọc đúng tên trường: 'flight', 'passengers', 'seatNumbers'
        const { flight, passengers, seatNumbers } = req.body;

        // 3. Gom tất cả dữ liệu vào một object để truyền xuống tầng service
        const bookingData = {
            userId: userId,
            flightId: flight, // Đổi tên 'flight' thành 'flightId' cho service dễ hiểu
            passengers,
            seatNumbers
        };

        // 4. Gọi service với dữ liệu đã được chuẩn bị đúng
        const result = await bookingService.createBooking(bookingData);
        
        // 5. Trả kết quả về cho frontend
        return res.status(result.EC === 0 ? 201 : 400).json(result);

    } catch (error) {
        // Bắt lỗi chung nếu có gì đó bất thường xảy ra trong quá trình xử lý
        console.error("Error in createBooking controller:", error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
    }
};

// HÀM LẤY LỊCH SỬ BOOKING CỦA USER
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await bookingService.getMyBookings(userId);
        return res.status(result.EC === 0 ? 200 : 500).json(result);
    } catch (error) {
        console.error("Error in getMyBookings controller:", error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
    }
};

// HÀM LẤY TẤT CẢ BOOKING (CHO ADMIN)
const getAllBookings = async (req, res) => {
    try {
        const result = await bookingService.getAllBookings();
        return res.status(result.EC === 0 ? 200 : 500).json(result);
    } catch (error) {
        console.error("Error in getAllBookings controller:", error);
        return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
    }
}


const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // Lấy vai trò người dùng đang thao tác (admin hay customer)
    const userRole = req.user.role; 

    // Truyền userRole xuống service
    const result = await bookingService.updateBookingStatus(id, status, userRole);
    
    return res.status(result.EC === 0 ? 200 : 500).json(result);
};

// Export các hàm để route có thể sử dụng
module.exports = {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateStatus
};