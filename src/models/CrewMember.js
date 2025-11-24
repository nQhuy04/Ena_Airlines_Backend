// src/models/CrewMember.js
const mongoose = require('mongoose');

const crewMemberSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    role: { 
        type: String, 
        enum: ['pilot', 'flight_attendant'], // Phi công hoặc Tiếp viên
        required: true 
    },
    rank: { 
        type: String, // VD: Captain (Cơ trưởng), First Officer (Cơ phó), Purser (Tiếp viên trưởng)
        required: true 
    },
    employeeId: { type: String, required: true, unique: true }, // Mã nhân viên (VD: PIL001)
    avatar: { type: String }, // Đường dẫn ảnh
    status: { 
        type: String, 
        enum: ['active', 'on_leave', 'retired'], 
        default: 'active' 
    }
}, { timestamps: true });

module.exports = mongoose.model('CrewMember', crewMemberSchema);