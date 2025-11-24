// src/models/Booking.js
const mongoose = require('mongoose');

// Schema con cho thông tin từng hành khách
const passengerSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    // Các thông tin khác như ngày sinh, số passport có thể thêm ở đây
    // dateOfBirth: { type: Date, required: true }, 
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    // Mã đặt chỗ, ví dụ ENAXYZ123. Phải là duy nhất.
    bookingCode: { type: String, required: true, unique: true, uppercase: true },

    // Tham chiếu đến các model khác
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    
    // Thông tin hành khách trên chuyến bay
    passengers: { type: [passengerSchema], required: true },

    // Danh sách các ghế đã được đặt trong lần booking này
    bookedSeats: [{
        seatNumber: { type: String, required: true }
    }],

    // Tổng số tiền đã thanh toán
    totalAmount: { type: Number, required: true, min: 0 },
    
    // Trạng thái của việc đặt vé
    status: { 
        type: String, 
        enum: ['pending', 'pending_payment', 'confirmed', 'cancelled', 'checked_in'], 
        default: 'pending' 
    },

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);