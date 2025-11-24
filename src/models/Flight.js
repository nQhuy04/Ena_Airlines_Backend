// src/models/Flight.js
const mongoose = require('mongoose');

// Schema con cho mỗi chiếc ghế trong chuyến bay
const seatSchema = new mongoose.Schema({
    number: { type: String, required: true }, // Ví dụ: 'A1', 'A2', '12F'
    class: { type: String, enum: ['economy', 'business'], required: true },
    // isAvailable đã bị thay thế bằng status để có nhiều trạng thái hơn
    status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
    // ID của đơn hàng đã đặt ghế này, null nếu ghế còn trống
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null } 
}, { _id: false }); // _id: false để mảng seats không tự tạo _id cho mỗi ghế

const flightSchema = new mongoose.Schema({
    // Số hiệu chuyến bay, ví dụ 'EN101'. Kết hợp với ngày bay sẽ là duy nhất.
    flightNumber: { type: String, required: true, trim: true, uppercase: true }, 

    // Tham chiếu đến các model khác
    departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    aircraft: { type: mongoose.Schema.Types.ObjectId, ref: 'Aircraft', required: true },
    
    // Thời gian
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    
    // Giá vé cơ bản cho mỗi hạng
    basePrice: {
        economy: { type: Number, required: true, min: 0 },
        business: { type: Number, required: true, min: 0 },
    },
    
    // Trạng thái vận hành của chuyến bay
    status: { 
        type: String, 
        enum: ['scheduled', 'on-time', 'delayed', 'cancelled', 'completed'], 
        default: 'scheduled' 
    },
    
    pilots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CrewMember' }],
    flightAttendants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CrewMember' }],


    // Mảng chứa toàn bộ các ghế trên chuyến bay này
    seats: [seatSchema],
    
}, { timestamps: true });

// Tạo một index kết hợp để đảm bảo không có 2 chuyến bay trùng số hiệu trong cùng 1 ngày
flightSchema.index({ flightNumber: 1, departureTime: 1 }, { unique: true });

module.exports = mongoose.model('Flight', flightSchema);