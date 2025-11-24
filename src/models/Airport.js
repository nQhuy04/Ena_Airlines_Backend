// src/models/Airport.js
const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    // Mã IATA 3 chữ cái, ví dụ SGN, HAN, DAD
    iataCode: { type: String, required: true, unique: true, uppercase: true, trim: true, length: 3 },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Airport', airportSchema);