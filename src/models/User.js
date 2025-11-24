// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['customer', 'staff', 'admin'], 
        default: 'customer' 
    },
    // Thêm các thông tin khác nếu bạn muốn sau này
    // phoneNumber: { type: String },
}, { timestamps: true });

// Middleware: Trước khi một document 'User' được lưu, hãy mã hóa mật khẩu
userSchema.pre('save', async function(next) {
    // Chỉ chạy hàm này nếu mật khẩu đã được thay đổi (hoặc là user mới)
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('User', userSchema);