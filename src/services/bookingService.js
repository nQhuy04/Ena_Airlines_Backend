// src/services/bookingService.js (FINAL - TÍCH HỢP EMAIL & THÔNG BÁO)

const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User'); 
const mongoose = require('mongoose');
const emailService = require('./emailService'); 
const notificationService = require('./notificationService'); // Import Notification Service

const createBooking = async (bookingData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, flightId, passengers, seatNumbers: seatsToBook } = bookingData;
        
        // 1. Kiểm tra chuyến bay
        const flight = await Flight.findById(flightId).session(session);
        if (!flight) {
            await session.abortTransaction();
            return { EC: 1, EM: 'Không tìm thấy chuyến bay.' };
        }

        let totalAmount = 0;
        const finalBookedSeats = []; 
        
        const seatNumberStrings = seatsToBook.map(s => s.seatNumber);

        // 2. Kiểm tra từng ghế
        for (const seatNumber of seatNumberStrings) {
            const seat = flight.seats.find(s => s.number === seatNumber);

            if (!seat) {
                await session.abortTransaction();
                return { EC: 2, EM: `Ghế ${seatNumber} không tồn tại trên chuyến bay này.` };
            }
            if (seat.status !== 'available') {
                await session.abortTransaction();
                return { EC: 3, EM: `Ghế ${seatNumber} đã được đặt hoặc không có sẵn.` };
            }
            
            seat.status = 'booked'; // Khóa ghế
            totalAmount += flight.basePrice[seat.class];
            finalBookedSeats.push({ seatNumber: seat.number });
        }
        
        const bookingCode = `ENA${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 3. Tạo Booking mới (Trạng thái: pending)
        const newBooking = new Booking({
            user: userId,
            flight: flightId,
            passengers,
            bookedSeats: finalBookedSeats,
            totalAmount,
            bookingCode,
            status: 'pending' 
        });
        
        // 4. Gán bookingId vào ghế trong Flight
        flight.seats.forEach(seat => {
            if (seatNumberStrings.includes(seat.number)) {
                seat.bookingId = newBooking._id;
            }
        });

        // 5. Lưu Database
        await newBooking.save({ session });
        await flight.save({ session });

        await session.commitTransaction(); // === GIAO DỊCH THÀNH CÔNG ===

        // --- SAU KHI GIAO DỊCH THÀNH CÔNG (Thực hiện bất đồng bộ) ---

        // 6. TẠO THÔNG BÁO (NOTIFICATION)
        try {
            await notificationService.createNotification({
                userId: userId, 
                title: 'Đặt vé thành công',
                message: `Mã vé: ${bookingCode}. Đơn hàng đang chờ duyệt.`,
                type: 'success'
            });
            console.log('🔔 Đã tạo thông báo thành công.');
        } catch (notifError) {
            console.error("Lỗi tạo notification:", notifError);
        }

        // 7. GỬI EMAIL XÁC NHẬN
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                console.log(`📧 Đang gửi email xác nhận tới: ${user.email}`);
                // Truyền đủ 3 tham số: email, booking, flight info
                emailService.sendBookingPendingEmail(user.email, newBooking, flight);
            }
        } catch (emailError) {
            console.error("Lỗi gửi email:", emailError);
        }

        return { EC: 0, EM: 'Đặt vé thành công!', DT: newBooking };

    } catch (error) {
        await session.abortTransaction();
        console.error('Lỗi khi tạo booking:', error);
        return { EC: -1, EM: 'Lỗi server' };
    } finally {
        session.endSession();
    }
};

const getMyBookings = async (userId) => {
    try {
        let bookings = await Booking.find({ user: userId })
            .populate({
                path: 'flight',
                populate: [
                    { path: 'departureAirport', select: 'city iataCode' },
                    { path: 'arrivalAirport', select: 'city iataCode' },
                    { path: 'aircraft', select: 'model' }
                ]
            })
            .sort({ createdAt: -1 });
        
        bookings = bookings.filter(booking => booking.flight !== null);

        return { EC: 0, EM: 'OK', DT: bookings };
    } catch (error) {
         return { EC: -1, EM: 'Lỗi server' };
    }
};

const getAllBookings = async () => {
     try {
        let bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('flight', 'flightNumber departureTime')
            .sort({ createdAt: -1 });
        
        bookings = bookings.filter(booking => booking.flight !== null);

        return { EC: 0, EM: 'OK', DT: bookings };
    } catch (error) {
         return { EC: -1, EM: 'Lỗi server' };
    }
}


const updateBookingStatus = async (bookingId, newStatus, userRole) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) throw new Error('Booking not found');

        const oldStatus = booking.status;
        booking.status = newStatus;
        await booking.save({ session });

        // Lấy thông tin chi tiết
        const fullBooking = await Booking.findById(bookingId)
            .populate('user')
            .populate({ path: 'flight', populate: [{ path: 'departureAirport' }, { path: 'arrivalAirport' }] })
            .session(session);

        // 1. XỬ LÝ NHẢ GHẾ NẾU HỦY
        if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
            const flight = await Flight.findById(booking.flight).session(session);
            if (flight) {
                const seatNumbersToRelease = booking.bookedSeats.map(s => s.seatNumber);
                flight.seats.forEach(seat => {
                    if (seatNumbersToRelease.includes(seat.number)) {
                        seat.status = 'available'; 
                        seat.bookingId = null;     
                    }
                });
                await flight.save({ session });
            }
        }

        await session.commitTransaction(); 

        // --- 2. TẠO THÔNG BÁO & EMAIL (SIDE EFFECTS) ---
        const userEmail = fullBooking.user.email;
        const userId = fullBooking.user._id;

        // LOGIC ĐIỀU HƯỚNG EMAIL & NOTIFICATION DỰA TRÊN NGƯỜI HỦY
        if (newStatus === 'confirmed') {
            // ... (Code duyệt vé giữ nguyên)
            await notificationService.createNotification({
                userId: userId,
                title: 'Vé đã được duyệt! 🛫',
                message: `Mã vé ${fullBooking.bookingCode} đã được xuất. Chúc bạn thượng lộ bình an!`,
                type: 'success'
            });
            emailService.sendBookingSuccessEmail(userEmail, fullBooking, fullBooking.flight);
        } 
        else if (newStatus === 'cancelled') {
            if (userRole === 'admin') {
                // --- TRƯỜNG HỢP 1: ADMIN HỦY (Hoàn 100%) ---
                
                // Thông báo: Ghi rõ hoàn tiền 100%
                await notificationService.createNotification({
                    userId: userId,
                    title: 'Đơn hàng bị từ chối ⛔',
                    message: `Mã vé ${fullBooking.bookingCode} bị hủy bởi quản trị viên. Chúng tôi sẽ hoàn tiền 100% ngay lập tức.`,
                    type: 'error'
                });
                
                // Email: Gửi mẫu email hoàn 100%
                emailService.sendAdminCancellationEmail(userEmail, fullBooking); 
            } else {
                // --- TRƯỜNG HỢP 2: KHÁCH HỦY (Hoàn 85%) ---
                
                // Thông báo: Giữ nguyên
                await notificationService.createNotification({
                    userId: userId,
                    title: 'Hủy vé thành công ✅',
                    message: `Bạn đã hủy mã vé ${fullBooking.bookingCode}. Thủ tục hoàn tiền đang được xử lý.`,
                    type: 'warning'
                });
                
                // Email: Gửi mẫu email biên lai hoàn tiền 85%
                emailService.sendBookingCancellationEmail(userEmail, fullBooking); 
            }
        }

        return { EC: 0, EM: 'Cập nhật trạng thái thành công!', DT: booking };

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        return { EC: -1, EM: error.message || 'Lỗi server' };
    } finally {
        session.endSession();
    }
};



module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };