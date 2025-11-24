// src/models/Aircraft.js
const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
    // Tên loại máy bay, ví dụ Airbus A321
    model: { type: String, required: true, trim: true },
    // Số hiệu đăng ký, ví dụ VN-A368. Phải là duy nhất.
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    // Sức chứa của 2 hạng ghế
    seatCapacity: {
        economy: { type: Number, required: true, min: 0 },
        business: { type: Number, required: true, min: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model('Aircraft', aircraftSchema);