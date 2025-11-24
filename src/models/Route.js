// src/models/Route.js
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },

    arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    
    durationMinutes: { type: Number, required: true, min: 0 },
}, { timestamps: true });

// Đảm bảo không có 2 đường bay trùng lặp
routeSchema.index({ departureAirport: 1, arrivalAirport: 1 }, { unique: true });

module.exports = mongoose.model('Route', routeSchema);